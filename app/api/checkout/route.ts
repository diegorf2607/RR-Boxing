import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { CountryCode, Order, OrderItem } from '@/shared/types/commerce'
import { appendOrder, getProducts } from '@/shared/lib/data-store'
import { getPriceForCountry } from '@/features/store/pricing'
import { getStripeClient } from '@/shared/lib/stripe'
import { getCountryConfig } from '@/shared/lib/country'
import { toStripeUnitAmount } from '@/shared/lib/stripe-money'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  address: z.string().min(5),
  country: z.enum(['PE', 'MX', 'CO', 'CL', 'US']),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
})

export async function POST(req: Request) {
  const body = schema.parse(await req.json())
  const products = await getProducts()
  const country = body.country as CountryCode
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
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const firstCurrency = orderItems[0].currency
  const mixedCurrency = orderItems.some((item) => item.currency !== firstCurrency)
  if (mixedCurrency) {
    return NextResponse.json({ error: 'Mixed currencies in cart' }, { status: 400 })
  }

  const stripe = getStripeClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const currency = orderItems[0].currency.toLowerCase()

  const productLines = orderItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: item.currency.toLowerCase(),
      product_data: {
        name: item.productName,
      },
      unit_amount: toStripeUnitAmount(item.unitAmount, item.currency),
    },
  }))

  const shippingLine =
    countryConfig.shippingFlatAmount > 0
      ? [
          {
            quantity: 1,
            price_data: {
              currency,
              product_data: {
                name: `Envío (${countryConfig.name})`,
              },
              unit_amount: toStripeUnitAmount(countryConfig.shippingFlatAmount, currency),
            },
          },
        ]
      : []

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: body.email,
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    line_items: [...productLines, ...shippingLine],
    metadata: {
      country: body.country,
      customerName: body.name,
      address: body.address,
    },
  })

  const totalAmount = orderItems.reduce((acc, item) => acc + item.unitAmount * item.quantity, 0)

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    customerEmail: body.email,
    customerName: body.name,
    country,
    items: orderItems,
    totalAmount: totalAmount + countryConfig.shippingFlatAmount,
    currency: orderItems[0].currency,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'stripe',
    stripeSessionId: session.id,
    createdAt: new Date().toISOString(),
  }
  await appendOrder(newOrder)

  return NextResponse.json({ url: session.url })
}
