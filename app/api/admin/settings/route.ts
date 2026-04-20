import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { getStoreSettings, updateStoreSettings } from '@/shared/lib/data-store'

const patchSchema = z.object({
  storeName: z.string().min(1).max(120).optional(),
  defaultCurrencyDisplay: z.string().min(3).max(8).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).max(99999).optional(),
  supportContactText: z.string().max(2000).optional(),
  checkoutHelperText: z.string().max(4000).optional(),
  storeEnabled: z.boolean().optional(),
})

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const settings = await getStoreSettings()
  return NextResponse.json({ settings })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const payload = patchSchema.parse(await req.json())
  const settings = await updateStoreSettings(payload)
  return NextResponse.json({ settings })
}
