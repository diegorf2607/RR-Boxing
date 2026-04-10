import { NextResponse } from 'next/server'
import { deleteProduct } from '@/shared/lib/data-store'
import { getSession } from '@/shared/lib/auth'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await deleteProduct(params.id)
  return NextResponse.json({ ok: true })
}
