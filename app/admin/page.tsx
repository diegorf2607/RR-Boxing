import { redirect } from 'next/navigation'
import MainNav from '@/components/MainNav'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import { getOrders, getProducts } from '@/shared/lib/data-store'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const [products, orders] = await Promise.all([getProducts(), getOrders()])

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-[240px_1fr]">
        <AdminNav />
        <div>
          <h1 className="mb-6 text-4xl font-bold">Dashboard</h1>
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="card">
              <p className="text-sm text-neutral-light">Productos activos</p>
              <p className="text-3xl font-bold">{products.filter((p) => p.active).length}</p>
            </article>
            <article className="card">
              <p className="text-sm text-neutral-light">Pedidos totales</p>
              <p className="text-3xl font-bold">{orders.length}</p>
            </article>
            <article className="card">
              <p className="text-sm text-neutral-light">Pedidos pagados</p>
              <p className="text-3xl font-bold">{orders.filter((o) => o.status === 'paid').length}</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
