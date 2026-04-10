import type { ReactNode } from 'react'
import MainNav from '@/components/MainNav'

export default function LegalPageShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <article className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-4xl font-bold text-accent">{title}</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-neutral-light">{children}</div>
      </article>
    </main>
  )
}
