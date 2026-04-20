import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { duplicateProduct } from '@/shared/lib/data-store'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const product = await duplicateProduct(params.id)
    return NextResponse.json({ product }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
