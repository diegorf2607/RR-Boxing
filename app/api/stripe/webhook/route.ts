import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/shared/lib/stripe'
import { findOrderBySession, insertAdminNotification, updateOrder } from '@/shared/lib/data-store'

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook configuration' }, { status: 400 })
  }

  const payload = await req.text()
  const stripe = getStripeClient()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const order = await findOrderBySession(session.id)
    if (order) {
      await updateOrder(order.id, { status: 'paid', paymentStatus: 'paid', paymentMethod: 'stripe' })
      try {
        await insertAdminNotification({
          type: 'order_paid',
          severity: 'info',
          title: 'Pedido pagado',
          body: `${order.customerEmail} · ${order.currency} ${order.totalAmount.toFixed(2)}`,
          link: `/admin/orders/${order.id}`,
          entityType: 'order',
          entityId: order.id,
        })
      } catch {
        /* sin tabla de notificaciones */
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const order = await findOrderBySession(session.id)
    if (order) await updateOrder(order.id, { status: 'cancelled', paymentStatus: 'unpaid' })
  }

  return NextResponse.json({ received: true })
}
