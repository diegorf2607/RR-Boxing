'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/features/cart/CartProvider'
import EnlaceClase from '@/components/EnlaceClase'

/** En el carrito y en /checkout el menú no saca a la persona hacia las clases: ahí la acción es terminar el pedido. */
const RUTAS_DE_COMPRA = ['/cart', '/checkout']

/**
 * La barra de la tienda. Sin selector de país: solo hay envíos dentro del Perú y en soles (CountryProvider ya fuerza
 * PE). El carrito es el control más grande de la derecha (44 px).
 */
export default function MainNav() {
  const { count, abrirPanel } = useCart()
  const pathname = usePathname()
  const enCompra = RUTAS_DE_COMPRA.some((ruta) => pathname === ruta || pathname?.startsWith(`${ruta}/`))

  return (
    <>
      {/* Para teclado y lector de pantalla: salta el menú y va directo al contenido de la página */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-3 focus:font-bold focus:text-dark"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-50 border-b border-dark-300 bg-dark/95 backdrop-blur">
        <div className="container mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4 md:py-3">
          <Link
            href="/"
            className="shrink-0 font-heading text-xl tracking-wide text-accent md:justify-self-start md:text-2xl"
          >
            RRBOXING
          </Link>

          <nav className="hidden items-center justify-center gap-5 md:flex md:justify-self-center lg:gap-8">
            <Link href="/" className="whitespace-nowrap text-sm font-medium text-white transition hover:text-accent">
              Tienda
            </Link>
            <Link
              href="/consulta"
              className="whitespace-nowrap text-sm font-medium text-neutral-light transition hover:text-white"
            >
              Clases 1 a 1
            </Link>
            <EnlaceClase className="whitespace-nowrap text-sm font-medium text-neutral-light transition hover:text-white">
              Clase virtual
            </EnlaceClase>
          </nav>

          <div className="flex min-w-0 items-center justify-end gap-3 md:justify-self-end">
            {/* En el celular, un enlace de texto como los del menú de escritorio (44 px de alto para el dedo) */}
            {!enCompra ? (
              <Link
                href="/consulta"
                className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap text-sm font-medium text-neutral-light transition hover:text-white md:hidden"
              >
                Clases 1 a 1
              </Link>
            ) : null}
            <span className="hidden whitespace-nowrap text-sm text-neutral lg:inline">Envíos dentro del Perú</span>
            {/* Abre el carrito lateral; con Ctrl, Cmd o la rueda del ratón, abre /cart como un enlace normal */}
            <Link
              href="/cart"
              aria-label={count > 0 ? `Carrito (${count})` : 'Carrito'}
              aria-haspopup="dialog"
              onClick={(e) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                e.preventDefault()
                abrirPanel()
              }}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dark-300 hover:bg-dark-100"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-accent px-1.5 text-xs font-bold text-dark">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      {/* Destino del salto: justo después del menú (scroll-mt para que el menú fijo no lo tape) */}
      <div id="contenido" tabIndex={-1} className="scroll-mt-20 outline-none" />
    </>
  )
}
