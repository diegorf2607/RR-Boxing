import type { Metadata } from 'next'
import MainNav from '@/components/MainNav'
import LoginForm from '@/features/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Acceso',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <>
      <MainNav />
      <main className="min-h-[60vh] pb-16 pt-10 md:pb-24 md:pt-16">
        <section className="contenedor">
          <div className="max-w-md">
            <h1 className="page-title">Acceso administrador</h1>
            <p className="mb-8 mt-3 text-tinta-2">Solo personal autorizado de RR Boxing.</p>
            <LoginForm />
          </div>
        </section>
      </main>
    </>
  )
}
