import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import OrdersAdminClient from '@/features/admin/OrdersAdminClient'

export default async function AdminOrdersPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <main className="min-h-screen bg-dark">
      <section className="container mx-auto grid grid-cols-1 gap-4 px-4 pb-10 pt-1 md:grid-cols-[240px_1fr] md:gap-6 md:py-10">
        <AdminNav />
        <div className="min-w-0">
          <h1 className="mb-6 font-heading text-4xl leading-none text-white md:text-5xl">Pedidos</h1>
          <OrdersAdminClient />
        </div>
      </section>
    </main>
  )
}
