import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { getOrderById, updateOrder } from '@/shared/lib/data-store'
import type { OrderStatus, PaymentStatus } from '@/shared/types/commerce'

const schema = z.object({
  status: z.enum(['pending', 'paid', 'cancelled', 'processing', 'shipped', 'delivered']).optional(),
  paymentStatus: z.enum(['unpaid', 'paid', 'failed', 'refunded']).optional(),
  internalNotes: z.string().max(8000).nullable().optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const order = await getOrderById(params.id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = schema.parse(await req.json())
  const patch: Parameters<typeof updateOrder>[1] = {}
  if (body.status !== undefined) patch.status = body.status as OrderStatus
  if (body.paymentStatus !== undefined) patch.paymentStatus = body.paymentStatus as PaymentStatus
  if (body.internalNotes !== undefined) patch.internalNotes = body.internalNotes

  const updated = await updateOrder(params.id, patch)
  if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json({ order: updated })
}
