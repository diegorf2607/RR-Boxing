// GET /api/pedido/datos (solo el panel): la forma de pago y el origen de los últimos pedidos, para el listado de
// /admin/orders. Los datos completos de un pedido los lee la página del detalle en el servidor.
import { NextResponse } from 'next/server'
import { getSession } from '@/shared/lib/auth'
import { leerVariosPedidoDatos } from '@/shared/lib/pedido-datos'
import { origenTexto } from '@/shared/lib/origen'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const todos = await leerVariosPedidoDatos()
  const datos = Object.fromEntries(
    Object.entries(todos).map(([id, d]) => [id, { formaPago: d.formaPago, origen: origenTexto(d.origen) }])
  )
  return NextResponse.json({ datos }, { headers: { 'Cache-Control': 'no-store' } })
}
