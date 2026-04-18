import { z } from 'zod'
import type { CountryCode, OrderItem } from '@/shared/types/commerce'
import type Stripe from 'stripe'
import { getProducts } from '@/shared/lib/data-store'
import { getPriceForCountry } from '@/features/store/pricing'
import { COUNTRY_CONFIG, getCountryConfig } from '@/shared/lib/country'
import { toStripeUnitAmount } from '@/shared/lib/stripe-money'
import {
  GIFT_CLASS_PRICE_PEN,
  GIFT_GUIDE_PRICE_PEN,
  isGiftFreePePen,
} from '@/shared/constants/gift-pricing'
import {
  comboDiscountApplies,
  computeComboDiscountAmount,
  roundMoney,
  totalCartUnits,
} from '@/shared/lib/combo-promo'

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
  /**
   * Perú PEN y subtotal ≤ S/ 100: si es true, se agregan a Stripe la guía PDF + clase grabada (pago).
   * Si el subtotal supera S/ 100, el pack va gratis y este flag se ignora en el servidor.
   */
  includeGiftPack: z.boolean().optional().default(false),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
})

export type CheckoutCartBody = z.infer<typeof checkoutCartBodySchema>
export type CheckoutShippingMethod = z.infer<typeof checkoutShippingMethodSchema>

export type PreparedCartCheckout = {
  orderItems: OrderItem[]
  productLines: Stripe.Checkout.SessionCreateParams.LineItem[]
  giftLines: Stripe.Checkout.SessionCreateParams.LineItem[]
  shippingLine: Stripe.Checkout.SessionCreateParams.LineItem[]
  currencyLower: string
  country: CountryCode
  totalAmount: number
  currency: OrderItem['currency']
  /** Solo Perú PEN: pack regalo sin cargo si el subtotal de productos supera S/ 100. */
  giftFree: boolean
  giftChargeAmount: number
  /** Subtotal de productos antes del descuento combo. */
  productSubtotalGross: number
  comboApplied: boolean
  comboDiscountAmount: number
}

function allocateComboDiscountToOrderItems(
  items: OrderItem[],
  grossSubtotal: number,
  discountAmount: number
): OrderItem[] {
  if (discountAmount <= 0) return items
  let assigned = 0
  return items.map((item, index, arr) => {
    const lineGross = roundMoney(item.unitAmount * item.quantity)
    const isLast = index === arr.length - 1
    const lineDiscount = isLast
      ? roundMoney(discountAmount - assigned)
      : roundMoney((lineGross / grossSubtotal) * discountAmount)
    assigned += lineDiscount
    const lineNet = roundMoney(lineGross - lineDiscount)
    const newUnit = roundMoney(lineNet / item.quantity)
    return { ...item, unitAmount: newUnit }
  })
}

export async function prepareCartCheckout(
  body: CheckoutCartBody
): Promise<{ ok: true; data: PreparedCartCheckout } | { ok: false; error: string }> {
  const products = await getProducts()
  const country = body.country
  const countryConfig = getCountryConfig(country)

  const orderItems: OrderItem[] = body.items.flatMap((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId && p.active)
    if (!product) return []
    const price = getPriceForCountry(product, country)
    return [
      {
        productId: product.id,
        productName: product.name,
        quantity: cartItem.quantity,
        unitAmount: price.amount,
        currency: price.currency,
      },
    ]
  })

  if (orderItems.length === 0) {
    return { ok: false, error: 'Cart is empty' }
  }

  const firstCurrency = orderItems[0].currency
  const mixedCurrency = orderItems.some((item) => item.currency !== firstCurrency)
  if (mixedCurrency) {
    return { ok: false, error: 'Mixed currencies in cart' }
  }

  const currencyLower = firstCurrency.toLowerCase()

  const productSubtotalGross = roundMoney(
    orderItems.reduce((acc, item) => acc + item.unitAmount * item.quantity, 0)
  )
  const cartUnits = totalCartUnits(body.items)
  const comboApplied = comboDiscountApplies(cartUnits)
  const comboDiscountAmount = comboApplied
    ? computeComboDiscountAmount(productSubtotalGross, cartUnits)
    : 0

  const orderItemsForCharge = comboApplied
    ? allocateComboDiscountToOrderItems(orderItems, productSubtotalGross, comboDiscountAmount)
    : orderItems

  const productLines: Stripe.Checkout.SessionCreateParams.LineItem[] = orderItemsForCharge.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: item.currency.toLowerCase(),
      product_data: {
        name: item.productName,
      },
      unit_amount: toStripeUnitAmount(item.unitAmount, item.currency),
    },
  }))

  const subtotalProducts = roundMoney(
    orderItemsForCharge.reduce((acc, item) => acc + item.unitAmount * item.quantity, 0)
  )

  let shippingLine: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  let shippingFlatAmount = 0

  if (country === 'PE' && firstCurrency === 'PEN') {
    const method = body.shippingMethod ?? 'standard'
    const peShipping: Record<CheckoutShippingMethod, { amount: number; label: string }> = {
      standard: { amount: 0, label: 'Standard 2+3 días hábiles' },
      express: { amount: 9.9, label: 'Express 24/48 horas' },
      urgent: { amount: 14.9, label: 'Envío URGENTE (Lima metropolitana)' },
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

  let giftLines: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  let giftChargeAmount = 0
  let giftFree = false

  if (country === 'PE' && firstCurrency === 'PEN') {
    giftFree = isGiftFreePePen(productSubtotalGross)
    if (!giftFree && body.includeGiftPack) {
      giftChargeAmount = GIFT_GUIDE_PRICE_PEN + GIFT_CLASS_PRICE_PEN
      giftLines = [
        {
          quantity: 1,
          price_data: {
            currency: currencyLower,
            product_data: {
              name: 'Guía digital RRBOXING — fundamentos de boxeo (PDF)',
            },
            unit_amount: toStripeUnitAmount(GIFT_GUIDE_PRICE_PEN, firstCurrency),
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: currencyLower,
            product_data: {
              name: 'Clase virtual grabada — primeros pasos',
            },
            unit_amount: toStripeUnitAmount(GIFT_CLASS_PRICE_PEN, firstCurrency),
          },
        },
      ]
    }
  }

  const totalAmount = subtotalProducts + shippingFlatAmount + giftChargeAmount

  return {
    ok: true,
    data: {
      orderItems: orderItemsForCharge,
      productLines,
      giftLines,
      shippingLine,
      currencyLower,
      country,
      totalAmount,
      currency: firstCurrency,
      giftFree,
      giftChargeAmount,
      productSubtotalGross,
      comboApplied,
      comboDiscountAmount,
    },
  }
}
