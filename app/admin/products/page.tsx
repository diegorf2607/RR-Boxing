import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import ProductsAdminClient from '@/features/admin/ProductsAdminClient'

export default async function AdminProductsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <main className="min-h-screen bg-dark">
      <section className="container mx-auto grid grid-cols-1 gap-4 px-4 pb-10 pt-1 md:grid-cols-[240px_1fr] md:gap-6 md:py-10">
        <AdminNav />
        <div>
          <h1 className="mb-6 font-heading text-4xl leading-none text-white md:text-5xl">Productos</h1>
          <ProductsAdminClient />
        </div>
      </section>
    </main>
  )
}
