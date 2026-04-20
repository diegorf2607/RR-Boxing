import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { getAdminProducts } from '@/shared/lib/data-store'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const products = await getAdminProducts()
  return NextResponse.json({ products })
}
