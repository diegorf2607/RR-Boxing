import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import { getDashboardSnapshot, getOrders } from '@/shared/lib/data-store'
import { tableroMedicion, type Monto, type TableroMedicion } from '@/shared/lib/resumen-diario'
import { diaIso } from '@/shared/lib/plazos'
import { porAtender } from '@/features/admin/por-atender'
import DashboardAdminClient, { type VentasPanel } from '@/features/admin/DashboardAdminClient'
import type { Order } from '@/shared/types/commerce'

export const dynamic = 'force-dynamic'

/** Cuántos pedidos por atender se listan en el panel; los demás, en /admin/orders */
const MAX_POR_ATENDER = 8

/** Pagado o en camino: la misma regla que el resumen de cada mañana (shared/lib/resumen-diario.ts) */
const estaPagado = (o: Order) =>
  o.paymentStatus === 'paid' ||
  (o.paymentStatus !== 'refunded' && ['paid', 'processing', 'shipped', 'delivered'].includes(o.status))

/** Suma por moneda, soles primero */
function sumar(pedidos: Order[]): Monto[] {
  const porMoneda = new Map<string, number>()
  for (const o of pedidos) porMoneda.set(o.currency, (porMoneda.get(o.currency) ?? 0) + o.totalAmount)
  return Array.from(porMoneda, ([moneda, total]) => ({ moneda, total: Math.round(total * 100) / 100 })).sort(
    (a, b) => Number(b.moneda === 'PEN') - Number(a.moneda === 'PEN'),
  )
}

/** Las cifras de ventas, con el mes de Lima (no el de UTC) */
function ventasDe(pedidos: Order[], ahora: Date): VentasPanel {
  const pagados = pedidos.filter(estaPagado)
  const inicioMes = Date.parse(`${diaIso(ahora).slice(0, 7)}-01T00:00:00-05:00`)
  const enSoles = pagados.filter((o) => o.currency === 'PEN')
  const totalSoles = enSoles.reduce((s, o) => s + o.totalAmount, 0)
  return {
    pagados: pagados.length,
    cobradoMes: sumar(pagados.filter((o) => Date.parse(o.createdAt) >= inicioMes)),
    cobradoTotal: sumar(pagados),
    ticketPromedio: enSoles.length > 0 ? Math.round((totalSoles / enSoles.length) * 100) / 100 : 0,
  }
}

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  // Si las cifras por origen fallan, el resto del panel igual se muestra
  const [snapshot, medicion, pedidos] = await Promise.all([
    getDashboardSnapshot(),
    tableroMedicion().catch((): TableroMedicion | null => null),
    getOrders(),
  ])
  const atender = pedidos.filter(porAtender)

  return (
    <main className="min-h-screen bg-dark">
      <section className="container mx-auto grid grid-cols-1 gap-4 px-4 pb-10 pt-1 md:grid-cols-[240px_1fr] md:gap-6 md:py-10">
        <AdminNav />
        <div className="min-w-0">
          <DashboardAdminClient
            snapshot={snapshot}
            medicion={medicion}
            atender={{ total: atender.length, pedidos: atender.slice(0, MAX_POR_ATENDER) }}
            ventas={ventasDe(pedidos, new Date())}
          />
        </div>
      </section>
    </main>
  )
}
