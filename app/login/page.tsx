import MainNav from '@/components/MainNav'
import LoginForm from '@/features/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto max-w-md px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold">Acceso administrador</h1>
        <p className="mb-6 text-sm text-neutral-light">Solo personal autorizado RRBOXING.</p>
        <LoginForm />
      </section>
    </main>
  )
}
