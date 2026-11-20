import { redirect } from 'next/navigation'
import MainNav from '@/components/MainNav'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import { leerPedidoDatos } from '@/shared/lib/pedido-datos'
import OrderDetailClient from '@/features/admin/OrderDetailClient'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  // WhatsApp, DNI, entrega, envío, colores, forma de pago y origen (shared/lib/pedido-datos.ts)
  const guardados = await leerPedidoDatos(params.id)
  // La huella de la conexión es solo para el límite de pedidos: no va al navegador
  const datos = guardados ? (({ huella: _huella, ...resto }) => resto)(guardados) : null

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-[240px_1fr]">
        <AdminNav />
        <div className="min-w-0">
          <h1 className="mb-6 text-3xl font-bold text-white">Pedido</h1>
          <OrderDetailClient orderId={params.id} datos={datos} />
        </div>
      </section>
    </main>
  )
}
