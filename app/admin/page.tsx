import { redirect } from 'next/navigation'
import MainNav from '@/components/MainNav'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import { getDashboardSnapshot } from '@/shared/lib/data-store'
import { tableroMedicion, type TableroMedicion } from '@/shared/lib/resumen-diario'
import DashboardAdminClient from '@/features/admin/DashboardAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  // Si las cifras por origen fallan, el resto del panel igual se muestra
  const [snapshot, medicion] = await Promise.all([
    getDashboardSnapshot(),
    tableroMedicion().catch((): TableroMedicion | null => null),
  ])

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-[240px_1fr]">
        <AdminNav />
        <div className="min-w-0">
          <DashboardAdminClient snapshot={snapshot} medicion={medicion} />
        </div>
      </section>
    </main>
  )
}
