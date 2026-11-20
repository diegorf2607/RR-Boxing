import type { ReactNode } from 'react'
import MainNav from '@/components/MainNav'

/**
 * La página de un texto legal: la barra de la tienda y el texto.
 * Sin `title`, el contenido trae su propio título (components/legal/Documento.tsx).
 * Con `title`, arma la página simple de antes (un título y el texto en una columna).
 */
export default function LegalPageShell({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-dark text-white">
      <MainNav />
      {title ? (
        <article className="container mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-6 text-4xl font-bold text-accent">{title}</h1>
          <div className="max-w-none space-y-4 text-neutral-light">{children}</div>
        </article>
      ) : (
        <div className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">{children}</div>
      )}
    </main>
  )
}
