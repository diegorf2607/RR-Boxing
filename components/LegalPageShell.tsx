import type { ReactNode } from 'react'
import MainNav from '@/components/MainNav'

/**
 * La página de un texto legal: el menú de la tienda y el texto, sobre blanco.
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
    <>
      <MainNav />
      <main className="pb-16 pt-6 md:pb-24 md:pt-10">
        {title ? (
          <article className="contenedor">
            <h1 className="page-title mb-6">{title}</h1>
            <div className="max-w-[70ch] space-y-4 leading-relaxed text-tinta-2">{children}</div>
          </article>
        ) : (
          <div className="contenedor">{children}</div>
        )}
      </main>
    </>
  )
}
