import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { listDigitalGifts, upsertDigitalGift } from '@/shared/lib/data-store'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  giftType: z.enum(['pdf', 'video', 'link']),
  description: z.string().max(2000).default(''),
  contentUrl: z.string().min(1).max(4000),
  active: z.boolean().optional(),
})

export async function GET(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === '1'
  const gifts = await listDigitalGifts(all)
  return NextResponse.json({ gifts })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = createSchema.parse(await req.json())
  const gift = await upsertDigitalGift({
    name: body.name,
    giftType: body.giftType,
    description: body.description,
    contentUrl: body.contentUrl,
    active: body.active ?? true,
  })
  return NextResponse.json({ gift }, { status: 201 })
}
