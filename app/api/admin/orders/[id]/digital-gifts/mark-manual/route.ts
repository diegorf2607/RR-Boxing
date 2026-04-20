import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { getOrderById, insertOrderGiftSendEvent, listOrderGiftSendEvents } from '@/shared/lib/data-store'

const bodySchema = z.object({
  adminNote: z.string().max(2000).optional(),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await getOrderById(params.id)
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  const body = bodySchema.parse(await req.json().catch(() => ({})))
  const prev = await listOrderGiftSendEvents(params.id)
  const isResend = prev.some((e) => e.success)

  await insertOrderGiftSendEvent({
    orderId: order.id,
    recipientEmail: order.customerEmail,
    isResend,
    channel: 'manual',
    success: true,
    adminNote: body.adminNote ?? null,
    bodyPreview: null,
  })

  return NextResponse.json({ ok: true, events: await listOrderGiftSendEvents(params.id) })
}
