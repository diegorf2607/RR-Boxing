import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import DigitalGiftsAdminClient from '@/features/admin/DigitalGiftsAdminClient'

export default async function AdminDigitalGiftsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <main className="min-h-screen bg-dark">
      <section className="container mx-auto grid grid-cols-1 gap-4 px-4 pb-10 pt-1 md:grid-cols-[240px_1fr] md:gap-6 md:py-10">
        <AdminNav />
        <div>
          <h1 className="mb-2 font-heading text-4xl leading-none text-white md:text-5xl">Regalos digitales</h1>
          <p className="mb-6 max-w-2xl text-sm text-neutral-light">
            Catálogo de PDFs, videos y enlaces que puedes asociar a pedidos y enviar por correo al cliente.
          </p>
          <DigitalGiftsAdminClient />
        </div>
      </section>
    </main>
  )
}
