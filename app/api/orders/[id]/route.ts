import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { updateOrder } from '@/shared/lib/data-store'

const schema = z.object({
  status: z.enum(['pending', 'paid', 'cancelled']),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = schema.parse(await req.json())
  const updated = await updateOrder(params.id, body)
  if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json({ order: updated })
}
