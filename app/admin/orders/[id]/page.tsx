import { redirect } from 'next/navigation'
import MainNav from '@/components/MainNav'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import OrderDetailClient from '@/features/admin/OrderDetailClient'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-[240px_1fr]">
        <AdminNav />
        <div>
          <h1 className="mb-6 text-3xl font-bold text-white">Pedido</h1>
          <OrderDetailClient orderId={params.id} />
        </div>
      </section>
    </main>
  )
}
