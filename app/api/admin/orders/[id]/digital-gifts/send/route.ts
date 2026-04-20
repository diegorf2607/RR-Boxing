import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import {
  buildDigitalGiftsEmailDraft,
  getOrderById,
  getOrderDigitalGiftsForOrder,
  insertOrderGiftSendEvent,
  listOrderGiftSendEvents,
} from '@/shared/lib/data-store'

async function sendViaResend(to: string, subject: string, text: string): Promise<{ id: string } | { error: string }> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!key || !from) {
    return { error: 'Falta RESEND_API_KEY o RESEND_FROM_EMAIL' }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, text }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { error: typeof data.message === 'string' ? data.message : JSON.stringify(data) || 'Resend error' }
  }
  const id = typeof data.id === 'string' ? data.id : ''
  return { id }
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await getOrderById(params.id)
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  const gifts = await getOrderDigitalGiftsForOrder(params.id)
  if (gifts.length === 0) {
    return NextResponse.json({ error: 'Este pedido no tiene regalos digitales asociados' }, { status: 400 })
  }

  const activeGifts = gifts.filter((g) => g.active)
  if (activeGifts.length === 0) {
    return NextResponse.json({ error: 'Los regalos asociados están inactivos' }, { status: 400 })
  }

  const { subject, text } = buildDigitalGiftsEmailDraft({
    orderId: order.id,
    customerName: order.customerName,
    gifts: activeGifts,
  })

  const prev = await listOrderGiftSendEvents(params.id)
  const isResend = prev.some((e) => e.success)

  const resendConfigured = !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)

  if (resendConfigured) {
    const result = await sendViaResend(order.customerEmail, subject, text)
    if ('error' in result) {
      await insertOrderGiftSendEvent({
        orderId: order.id,
        recipientEmail: order.customerEmail,
        isResend,
        channel: 'resend',
        success: false,
        errorText: result.error,
        bodyPreview: text.slice(0, 4000),
      })
      return NextResponse.json(
        {
          sent: false,
          mode: 'resend_failed',
          error: result.error,
          emailDraft: { subject, text, to: order.customerEmail },
          events: await listOrderGiftSendEvents(params.id),
        },
        { status: 502 }
      )
    }
    await insertOrderGiftSendEvent({
      orderId: order.id,
      recipientEmail: order.customerEmail,
      isResend,
      channel: 'resend',
      success: true,
      providerMessageId: result.id || null,
      bodyPreview: text.slice(0, 4000),
    })
    return NextResponse.json({
      sent: true,
      mode: 'resend',
      messageId: result.id,
      events: await listOrderGiftSendEvents(params.id),
    })
  }

  return NextResponse.json({
    sent: false,
    mode: 'manual',
    hint:
      'Configura RESEND_API_KEY y RESEND_FROM_EMAIL en el entorno para envío automático. Mientras tanto, copia el borrador y envía desde tu correo.',
    emailDraft: { subject, text, to: order.customerEmail },
    events: prev,
  })
}
