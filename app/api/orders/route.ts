import { NextResponse } from 'next/server'
import { getOrders } from '@/shared/lib/data-store'
import { getSession } from '@/shared/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const orders = await getOrders()
  return NextResponse.json({ orders })
}
