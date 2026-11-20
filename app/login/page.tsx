import type { Metadata } from 'next'
import MainNav from '@/components/MainNav'
import LoginForm from '@/features/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Acceso',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-dark text-white">
      <MainNav />
      <section className="wrap pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="max-w-md">
          <h1 className="page-title">Acceso administrador</h1>
          <p className="mb-7 mt-4 text-base text-neutral-light">Solo personal autorizado de RR Boxing.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
