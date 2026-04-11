import { z } from 'zod'
import type { CountryCode, OrderItem } from '@/shared/types/commerce'
import type Stripe from 'stripe'
import { getProducts } from '@/shared/lib/data-store'
import { getPriceForCountry } from '@/features/store/pricing'
import { COUNTRY_CONFIG, getCountryConfig } from '@/shared/lib/country'
import { toStripeUnitAmount } from '@/shared/lib/stripe-money'

const CHECKOUT_COUNTRY_CODES = COUNTRY_CONFIG.map((c) => c.code) as [
  CountryCode,
  ...CountryCode[],
]

export const checkoutCartBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  address: z.string().min(5),
  country: z.enum(CHECKOUT_COUNTRY_CODES),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
})

export type CheckoutCartBody = z.infer<typeof checkoutCartBodySchema>

export type PreparedCartCheckout = {
  orderItems: OrderItem[]
  productLines: Stripe.Checkout.SessionCreateParams.LineItem[]
  shippingLine: Stripe.Checkout.SessionCreateParams.LineItem[]
  currencyLower: string
  country: CountryCode
  totalAmount: number
  currency: OrderItem['currency']
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

  const productLines: Stripe.Checkout.SessionCreateParams.LineItem[] = orderItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: item.currency.toLowerCase(),
      product_data: {
        name: item.productName,
      },
      unit_amount: toStripeUnitAmount(item.unitAmount, item.currency),
    },
  }))

  const shippingLine: Stripe.Checkout.SessionCreateParams.LineItem[] =
    countryConfig.shippingFlatAmount > 0
      ? [
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
      : []

  const totalAmount =
    orderItems.reduce((acc, item) => acc + item.unitAmount * item.quantity, 0) +
    countryConfig.shippingFlatAmount

  return {
    ok: true,
    data: {
      orderItems,
      productLines,
      shippingLine,
      currencyLower,
      country,
      totalAmount,
      currency: firstCurrency,
    },
  }
}
