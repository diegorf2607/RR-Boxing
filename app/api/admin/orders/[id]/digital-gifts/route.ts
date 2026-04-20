import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { getOrderById, getOrderDigitalGiftsForOrder, listDigitalGifts, setOrderDigitalGifts } from '@/shared/lib/data-store'

const putSchema = z.object({
  giftIds: z.array(z.string().uuid()),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const order = await getOrderById(params.id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const [linked, catalog] = await Promise.all([
    getOrderDigitalGiftsForOrder(params.id),
    listDigitalGifts(true),
  ])
  return NextResponse.json({ linked, catalog })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const order = await getOrderById(params.id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = putSchema.parse(await req.json())
  await setOrderDigitalGifts(params.id, body.giftIds)
  const linked = await getOrderDigitalGiftsForOrder(params.id)
  return NextResponse.json({ linked })
}
