import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import MainNav from '@/components/MainNav'

/**
 * La página de un texto legal: la barra de la tienda y el texto, en el contenedor de la maqueta (.wrap).
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
        <article className="wrap pb-16 pt-10 md:pb-20 md:pt-14">
          <h1 className="page-title mb-6">{title}</h1>
          <div className="max-w-[70ch] space-y-4 text-neutral-light">{children}</div>
        </article>
      ) : (
        <div className="wrap pb-16 pt-10 md:pb-20 md:pt-14">{children}</div>
      )}
    </main>
  )
}

/**
 * La cabecera de las páginas sueltas, las que van sin el menú de la tienda (/clase, el Libro de Reclamaciones, la
 * página 404 y las de /bonus): la misma barra de 68 px de la maqueta, con el logo y «RR Boxing», y a la derecha lo
 * que la página necesite (un enlace). Lleva al inicio de la tienda.
 */
export function CabeceraSola({ className = '', children }: { className?: string; children?: ReactNode }) {
  return (
    <header className={`border-b border-line ${className}`}>
      <div className="wrap flex min-h-[68px] flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
        <Link href="/" aria-label="RR Boxing, ir a la tienda" className="flex min-h-[44px] shrink-0 items-center gap-3">
          <Image src="/rr-boxing-logo.png" alt="" width={30} height={46} priority className="h-[46px] w-[30px]" />
          <span className="font-heading text-[19px] leading-none tracking-[0.005em] [font-stretch:75%]">RR Boxing</span>
        </Link>
        {children}
      </div>
    </header>
  )
}
