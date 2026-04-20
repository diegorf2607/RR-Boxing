import MainNav from '@/components/MainNav'
import AdminNav from '@/components/AdminNav'

type AdminShellProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function AdminShell({ title, subtitle, children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-dark to-dark-100">
      <MainNav />
      <section className="container mx-auto grid gap-8 px-4 py-8 md:grid-cols-[260px_1fr] lg:py-10">
        <AdminNav />
        <div className="min-w-0">
          <header className="mb-8 border-b border-dark-300 pb-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">Panel RRBOXING</p>
            <h1 className="font-heading text-3xl font-bold tracking-wide text-white md:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-2xl text-sm text-neutral-light">{subtitle}</p> : null}
          </header>
          {children}
        </div>
      </section>
    </main>
  )
}
