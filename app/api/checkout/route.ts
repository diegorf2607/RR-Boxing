import { NextResponse } from 'next/server'
import type { CountryCode } from '@/shared/types/commerce'
import { appendOrder } from '@/shared/lib/data-store'
import { getStripeClient } from '@/shared/lib/stripe'
import { checkoutCartBodySchema, prepareCartCheckout } from '@/shared/lib/cart-checkout'

const schema = checkoutCartBodySchema

export async function POST(req: Request) {
  const body = schema.parse(await req.json())
  const prepared = await prepareCartCheckout(body)

  if (!prepared.ok) {
    return NextResponse.json({ error: prepared.error }, { status: 400 })
  }

  const { data } = prepared
  const country = body.country as CountryCode

  const stripe = getStripeClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: body.email,
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    line_items: [...data.productLines, ...data.shippingLine],
    metadata: {
      country: body.country,
      customerName: body.name,
      address: body.address,
    },
  })

  await appendOrder({
    id: `ord_${Date.now()}`,
    customerEmail: body.email,
    country,
    items: data.orderItems,
    totalAmount: data.totalAmount,
    currency: data.currency,
    status: 'pending',
    stripeSessionId: session.id,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ url: session.url })
}
