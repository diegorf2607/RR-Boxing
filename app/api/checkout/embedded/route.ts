import { NextResponse } from 'next/server'
import { getStripeClient } from '@/shared/lib/stripe'
import { appendOrder } from '@/shared/lib/data-store'
import { checkoutCartBodySchema, prepareCartCheckout } from '@/shared/lib/cart-checkout'

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

/** Sesión embebida de demostración (POST sin cuerpo) — ej. /pagar */
async function createDemoEmbeddedSession() {
  const stripe = getStripeClient()
  const appUrl = appBaseUrl()

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 1000,
          product_data: {
            name: 'Plan Básico',
            description: 'Pago de prueba',
          },
        },
      },
    ],
    return_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  })

  if (!session.client_secret) {
    return NextResponse.json(
      { error: 'La sesión no devolvió client_secret. Revisa la versión de la API de Stripe.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ clientSecret: session.client_secret })
}

/**
 * POST sin cuerpo → demo USD 10.
 * POST con JSON del carrito → Checkout embebido con ítems reales (misma forma que /api/checkout).
 */
export async function POST(req: Request) {
  try {
    const raw = await req.text()
    if (!raw.trim()) {
      return await createDemoEmbeddedSession()
    }

    const body = checkoutCartBodySchema.parse(JSON.parse(raw))
    const prepared = await prepareCartCheckout(body)

    if (!prepared.ok) {
      return NextResponse.json({ error: prepared.error }, { status: 400 })
    }

    const { data } = prepared
    const stripe = getStripeClient()
    const appUrl = appBaseUrl()

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      customer_email: body.email,
      return_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      line_items: [...data.productLines, ...data.giftLines, ...data.shippingLine],
      metadata: {
        country: body.country,
        customerName: body.name,
        address: body.address,
        shippingMethod: body.shippingMethod ?? 'standard',
        phone: body.phone ?? '',
        giftFree: data.giftFree ? '1' : '0',
        giftChargePen: String(data.giftChargeAmount),
        includeGiftPack: body.includeGiftPack ? '1' : '0',
      },
    })

    if (!session.client_secret) {
      return NextResponse.json(
        { error: 'La sesión no devolvió client_secret. Revisa la versión de la API de Stripe.' },
        { status: 500 }
      )
    }

    await appendOrder({
      id: `ord_${Date.now()}`,
      customerEmail: body.email,
      country: data.country,
      items: data.orderItems,
      totalAmount: data.totalAmount,
      currency: data.currency,
      status: 'pending',
      stripeSessionId: session.id,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al crear la sesión'
    const missingKey = message.includes('Missing STRIPE_SECRET_KEY')
    return NextResponse.json(
      { error: missingKey ? 'Falta STRIPE_SECRET_KEY en el entorno' : message },
      { status: 500 }
    )
  }
}
