import { redirect } from 'next/navigation'
import MainNav from '@/components/MainNav'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'

export default async function AdminSettingsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-[240px_1fr]">
        <AdminNav />
        <div>
          <h1 className="mb-6 text-4xl font-bold">Configuracion ecommerce</h1>
          <div className="card space-y-3">
            <p className="text-neutral-light">
              Configura variables en tu entorno para produccion:
            </p>
            <ul className="list-inside list-disc text-sm text-neutral-light">
              <li>STRIPE_SECRET_KEY</li>
              <li>STRIPE_WEBHOOK_SECRET</li>
              <li>NEXT_PUBLIC_APP_URL</li>
              <li>AUTH_SECRET</li>
              <li>ADMIN_EMAIL</li>
              <li>ADMIN_PASSWORD</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
