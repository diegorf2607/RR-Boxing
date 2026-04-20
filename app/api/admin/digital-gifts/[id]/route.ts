import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { getDigitalGiftById, setDigitalGiftActive, upsertDigitalGift } from '@/shared/lib/data-store'

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  giftType: z.enum(['pdf', 'video', 'link']).optional(),
  description: z.string().max(2000).optional(),
  contentUrl: z.string().min(1).max(4000).optional(),
  active: z.boolean().optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const gift = await getDigitalGiftById(params.id)
  if (!gift) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ gift })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const existing = await getDigitalGiftById(params.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = patchSchema.parse(await req.json())
  const gift = await upsertDigitalGift({
    id: params.id,
    name: body.name ?? existing.name,
    giftType: body.giftType ?? existing.giftType,
    description: body.description ?? existing.description,
    contentUrl: body.contentUrl ?? existing.contentUrl,
    active: body.active ?? existing.active,
  })
  return NextResponse.json({ gift })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await setDigitalGiftActive(params.id, false)
  return NextResponse.json({ ok: true })
}
