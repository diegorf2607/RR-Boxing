import { NextResponse } from 'next/server'
import { getStripeClient } from '@/shared/lib/stripe'
import { appendOrder } from '@/shared/lib/data-store'
import { checkoutCartBodySchema, prepareCartCheckout } from '@/shared/lib/cart-checkout'
import { PAGO_EN_LINEA_ACTIVO } from '@/shared/config/pagos'
import type { Order } from '@/shared/types/commerce'

/** Lo único que ve el público si algo falla al iniciar el pago. El detalle va a console.error. */
const ERROR_PUBLICO = 'No pudimos iniciar el pago. Escríbenos por WhatsApp.'

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

/** POST con el JSON del carrito → Checkout embebido de Stripe con los productos reales. */
export async function POST(req: Request) {
  let raw: unknown
  try {
    const text = await req.text()
    raw = text.trim() ? JSON.parse(text) : null
  } catch {
    raw = null
  }
  if (!raw) {
    return NextResponse.json({ error: 'Tu carrito está vacío.' }, { status: 400 })
  }

  const parsed = checkoutCartBodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Revisa tus datos y tu carrito.' }, { status: 400 })
  }
  const body = parsed.data

  try {
    const prepared = await prepareCartCheckout(body)
    if (!prepared.ok) {
      return NextResponse.json({ error: prepared.error }, { status: 400 })
    }

    // Sin pasarela que funcione en Perú no se crean sesiones de pago ni pedidos pendientes.
    if (!PAGO_EN_LINEA_ACTIVO) {
      return NextResponse.json({ error: ERROR_PUBLICO }, { status: 503 })
    }

    const { data } = prepared
    const stripe = getStripeClient()
    const appUrl = appBaseUrl()

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      customer_email: body.email,
      return_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      line_items: [...data.productLines, ...data.shippingLine],
      metadata: {
        country: body.country,
        customerName: body.name,
        address: body.address,
        shippingMethod: body.shippingMethod ?? 'standard',
        phone: body.phone ?? '',
        comboApplied: data.comboApplied ? '1' : '0',
        comboDiscountAmount: String(data.comboDiscountAmount),
        productSubtotalGross: String(data.productSubtotalGross),
      },
    })

    if (!session.client_secret) {
      console.error('[checkout/embedded] La sesión de Stripe no devolvió client_secret', session.id)
      return NextResponse.json({ error: ERROR_PUBLICO }, { status: 500 })
    }

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      customerEmail: body.email,
      customerName: body.name,
      country: data.country,
      items: data.orderItems,
      totalAmount: data.totalAmount,
      currency: data.currency,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'stripe',
      stripeSessionId: session.id,
      createdAt: new Date().toISOString(),
    }
    await appendOrder(newOrder)

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (e) {
    console.error('[checkout/embedded] No se pudo crear la sesión de pago', e)
    return NextResponse.json({ error: ERROR_PUBLICO }, { status: 500 })
  }
}
