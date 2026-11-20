import { z } from 'zod'
import type { CountryCode, OrderItem } from '@/shared/types/commerce'
import type Stripe from 'stripe'
import { getProducts } from '@/shared/lib/data-store'
import { getPriceForCountry } from '@/features/store/pricing'
import { COUNTRY_CONFIG, getCountryConfig } from '@/shared/lib/country'
import { toStripeUnitAmount } from '@/shared/lib/stripe-money'
import { participaDelCombo, resumenCombo, roundMoney } from '@/shared/lib/combo-promo'

const CHECKOUT_COUNTRY_CODES = COUNTRY_CONFIG.map((c) => c.code) as [
  CountryCode,
  ...CountryCode[],
]

export const checkoutShippingMethodSchema = z.enum(['standard', 'express', 'urgent'])

export const checkoutCartBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  address: z.string().min(5),
  country: z.enum(CHECKOUT_COUNTRY_CODES),
  /** Perú: standard 0, express 9.90, urgent 14.90 (PEN). Otros países: se ignora y usa tarifa del país. */
  shippingMethod: checkoutShippingMethodSchema.optional().default('standard'),
  phone: z.string().max(40).optional(),
  // El antiguo «pack de bienvenida» (includeGiftPack) ya no existe: si llega, zod lo descarta.
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })
  ),
})

export type CheckoutCartBody = z.infer<typeof checkoutCartBodySchema>
export type CheckoutShippingMethod = z.infer<typeof checkoutShippingMethodSchema>

export type PreparedCartCheckout = {
  orderItems: OrderItem[]
  productLines: Stripe.Checkout.SessionCreateParams.LineItem[]
  shippingLine: Stripe.Checkout.SessionCreateParams.LineItem[]
  currencyLower: string
  country: CountryCode
  totalAmount: number
  currency: OrderItem['currency']
  /** Subtotal de productos antes del descuento combo. */
  productSubtotalGross: number
  comboApplied: boolean
  comboDiscountAmount: number
}

type LineaPreparada = { item: OrderItem; comboEligible: boolean }

/**
 * Reparte el descuento del combo solo entre los productos que participan, en proporción al
 * total de cada línea. La última línea que participa se queda con el redondeo, así la suma de las
 * líneas es exactamente el subtotal menos el descuento. Devuelve el total neto de cada línea.
 */
function netoPorLinea(lineas: LineaPreparada[], subtotalCombo: number, descuento: number): number[] {
  const brutos = lineas.map((l) => roundMoney(l.item.unitAmount * l.item.quantity))
  if (descuento <= 0 || subtotalCombo <= 0) return brutos
  const ultimaQueParticipa = lineas.map((l) => l.comboEligible).lastIndexOf(true)
  let asignado = 0
  return lineas.map((l, i) => {
    if (!l.comboEligible) return brutos[i]
    const descuentoLinea =
      i === ultimaQueParticipa
        ? roundMoney(descuento - asignado)
        : roundMoney((brutos[i] / subtotalCombo) * descuento)
    asignado = roundMoney(asignado + descuentoLinea)
    return roundMoney(brutos[i] - descuentoLinea)
  })
}

/**
 * Líneas de Stripe para un producto cuyo total neto no siempre se divide exacto entre las unidades:
 * si sobra algún céntimo, unas unidades van un céntimo más caras, para que Stripe cobre el neto exacto.
 */
function lineasStripe(item: OrderItem, neto: number): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const netoMenor = toStripeUnitAmount(neto, item.currency)
  const base = Math.floor(netoMenor / item.quantity)
  const sobra = netoMenor - base * item.quantity
  const linea = (quantity: number, unit_amount: number): Stripe.Checkout.SessionCreateParams.LineItem => ({
    quantity,
    price_data: {
      currency: item.currency.toLowerCase(),
      product_data: { name: item.productName },
      unit_amount,
    },
  })
  if (sobra === 0) return [linea(item.quantity, base)]
  return [linea(sobra, base + 1), linea(item.quantity - sobra, base)]
}

export async function prepareCartCheckout(
  body: CheckoutCartBody
): Promise<{ ok: true; data: PreparedCartCheckout } | { ok: false; error: string }> {
  const products = await getProducts()
  const country = body.country
  const countryConfig = getCountryConfig(country)

  const lineas: LineaPreparada[] = body.items.flatMap((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId && p.active)
    if (!product) return []
    const price = getPriceForCountry(product, country)
    return [
      {
        item: {
          productId: product.id,
          productName: product.name,
          quantity: cartItem.quantity,
          unitAmount: price.amount,
          currency: price.currency,
        },
        comboEligible: participaDelCombo(product),
      },
    ]
  })
  const orderItems = lineas.map((l) => l.item)

  if (orderItems.length === 0) {
    return { ok: false, error: 'Tu carrito está vacío.' }
  }

  const firstCurrency = orderItems[0].currency
  const mixedCurrency = orderItems.some((item) => item.currency !== firstCurrency)
  if (mixedCurrency) {
    return { ok: false, error: 'Tu carrito tiene productos en monedas distintas.' }
  }

  const currencyLower = firstCurrency.toLowerCase()

  // Mismo cálculo que el carrito: solo cuentan los productos válidos que participan del combo.
  const combo = resumenCombo(
    lineas.map((l) => ({
      unitAmount: l.item.unitAmount,
      quantity: l.item.quantity,
      comboEligible: l.comboEligible,
    }))
  )
  const productSubtotalGross = combo.subtotal
  const comboDiscountAmount = combo.descuento
  const comboApplied = comboDiscountAmount > 0

  const netos = netoPorLinea(lineas, combo.subtotalCombo, comboDiscountAmount)
  const orderItemsForCharge: OrderItem[] = orderItems.map((item, i) => ({
    ...item,
    unitAmount: roundMoney(netos[i] / item.quantity),
  }))
  const productLines = orderItems.flatMap((item, i) => lineasStripe(item, netos[i]))
  const subtotalProducts = combo.total

  let shippingLine: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  let shippingFlatAmount = 0

  if (country === 'PE' && firstCurrency === 'PEN') {
    const method = body.shippingMethod ?? 'standard'
    const peShipping: Record<CheckoutShippingMethod, { amount: number; label: string }> = {
      standard: { amount: 0, label: 'Envío estándar, 2 a 3 días hábiles' },
      express: { amount: 9.9, label: 'Envío express, 24 a 48 horas' },
      urgent: { amount: 14.9, label: 'Envío urgente (Lima Metropolitana)' },
    }
    const sel = peShipping[method]
    shippingFlatAmount = sel.amount
    if (sel.amount > 0) {
      shippingLine = [
        {
          quantity: 1,
          price_data: {
            currency: currencyLower,
            product_data: { name: sel.label },
            unit_amount: toStripeUnitAmount(sel.amount, firstCurrency),
          },
        },
      ]
    }
  } else if (countryConfig.shippingFlatAmount > 0) {
    shippingFlatAmount = countryConfig.shippingFlatAmount
    shippingLine = [
      {
        quantity: 1,
        price_data: {
          currency: currencyLower,
          product_data: {
            name: `Envío (${countryConfig.name})`,
          },
          unit_amount: toStripeUnitAmount(countryConfig.shippingFlatAmount, firstCurrency),
        },
      },
    ]
  }

  const totalAmount = roundMoney(subtotalProducts + shippingFlatAmount)

  return {
    ok: true,
    data: {
      orderItems: orderItemsForCharge,
      productLines,
      shippingLine,
      currencyLower,
      country,
      totalAmount,
      currency: firstCurrency,
      productSubtotalGross,
      comboApplied,
      comboDiscountAmount,
    },
  }
}
