import Link from 'next/link'
import { redirect } from 'next/navigation'
import MainNav from '@/components/MainNav'
import { getSession } from '@/shared/lib/auth'
import { getOrders } from '@/shared/lib/data-store'
import LogoutButton from '@/features/auth/LogoutButton'

export default async function AccountPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const orders = (await getOrders()).filter((order) => order.customerEmail === session.email)

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Mi cuenta</h1>
          <LogoutButton />
        </div>
        <div className="card mb-6">
          <p className="text-sm text-neutral-light">Usuario</p>
          <p className="text-xl font-semibold">{session.email}</p>
          <p className="text-sm text-neutral-light">Rol: {session.role}</p>
          {session.role === 'admin' && (
            <Link href="/admin" className="mt-3 inline-block text-accent underline">
              Ir al panel admin
            </Link>
          )}
        </div>
        <h2 className="mb-4 text-2xl font-bold">Historial de pedidos</h2>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-neutral-light">Aun no tienes pedidos registrados.</p>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="card">
                <p className="font-semibold">Pedido #{order.id}</p>
                <p className="text-sm text-neutral-light">Estado: {order.status}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
