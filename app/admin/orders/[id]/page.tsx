import Link from 'next/link'
import { redirect } from 'next/navigation'
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
      <section className="container mx-auto grid grid-cols-1 gap-4 px-4 pb-10 pt-1 md:grid-cols-[240px_1fr] md:gap-6 md:py-10">
        <AdminNav />
        <div className="min-w-0">
          <Link href="/admin/orders" className="inline-flex min-h-[44px] items-center text-sm text-accent hover:underline">
            ← Pedidos
          </Link>
          <h1 className="mb-4 font-heading text-4xl leading-none text-white md:text-5xl">
            Pedido <span className="whitespace-nowrap">{params.id}</span>
          </h1>
          <OrderDetailClient orderId={params.id} datos={datos} />
        </div>
      </section>
    </main>
  )
}
