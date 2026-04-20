import { redirect } from 'next/navigation'
import MainNav from '@/components/MainNav'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import DigitalGiftsAdminClient from '@/features/admin/DigitalGiftsAdminClient'

export default async function AdminDigitalGiftsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-[240px_1fr]">
        <AdminNav />
        <div>
          <h1 className="mb-2 text-4xl font-bold">Regalos digitales</h1>
          <p className="mb-6 max-w-2xl text-sm text-neutral-light">
            Catálogo de PDFs, videos y enlaces que puedes asociar a pedidos y enviar por correo al cliente.
          </p>
          <DigitalGiftsAdminClient />
        </div>
      </section>
    </main>
  )
}
