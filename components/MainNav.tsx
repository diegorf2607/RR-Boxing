'use client'

import { useEffect, useId, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useCart } from '@/features/cart/CartProvider'
import { useClaseVigente } from '@/components/EnlaceClase'

/** En el carrito y en /checkout el menú del celular no saca a la persona: ahí la acción es terminar el pedido. */
const RUTAS_DE_COMPRA = ['/cart', '/checkout']

type Enlace = { href: string; texto: string; soloSiHayClase?: boolean }

/**
 * Los enlaces del menú. «Tienda» y «Combos» llevan a secciones de la portada: el catálogo (id="catalogo") y los
 * combos (id="combos"). «Clase gratis» desaparece cuando la clase virtual ya pasó.
 */
const ENLACES: Enlace[] = [
  { href: '/#catalogo', texto: 'Tienda' },
  { href: '/#combos', texto: 'Combos' },
  { href: '/consulta', texto: 'Clases 1 a 1' },
  { href: '/clase', texto: 'Clase gratis', soloSiHayClase: true },
]

const ENVIO = 'Envío estándar gratis dentro del Perú'

/**
 * El menú negro de la tienda: logo (sin texto al lado), enlaces, el envío y el carrito. En el celular, el carrito
 * y un botón que abre los enlaces. Todo control mide al menos 44 px.
 */
export default function MainNav() {
  const { count, abrirPanel } = useCart()
  const pathname = usePathname()
  const hayClase = useClaseVigente()
  const [abierto, setAbierto] = useState(false)
  const idMenu = useId()
  const enCompra = RUTAS_DE_COMPRA.some((ruta) => pathname === ruta || pathname?.startsWith(`${ruta}/`))
  const enlaces = ENLACES.filter((e) => !e.soloSiHayClase || hayClase)

  // El menú del celular se cierra al cambiar de página y con Escape
  useEffect(() => {
    setAbierto(false)
  }, [pathname])

  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto])

  const actual = (href: string) => (href === '/consulta' && pathname === '/consulta' ? 'page' : undefined)

  return (
    <>
      {/* Para teclado y lector de pantalla: salta el menú y va directo al contenido de la página */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-3 focus:font-bold focus:text-tinta"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-50 bg-tinta text-white">
        <div className="contenedor flex h-[60px] items-center gap-3 md:h-[68px] md:gap-8 lg:gap-10">
          <Link href="/" className="flex h-11 min-w-[44px] shrink-0 items-center" aria-label="RR Boxing, inicio">
            <Image
              src="/marca/logo-amarillo.png"
              alt=""
              width={307}
              height={420}
              priority
              sizes="34px"
              className="h-10 w-auto md:h-[46px]"
            />
          </Link>

          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-6 lg:gap-7">
              {enlaces.map((e) => (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    aria-current={actual(e.href)}
                    className="flex h-11 items-center whitespace-nowrap border-b-2 border-transparent pt-0.5 text-[15px] font-semibold transition-colors hover:border-accent aria-[current=page]:border-accent"
                  >
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 md:gap-5">
            <span className="hidden whitespace-nowrap text-[15px] font-medium text-[#BDBDBD] lg:inline">{ENVIO}</span>
            {/* Abre el carrito lateral; con Ctrl, Cmd o la rueda del ratón, abre /cart como un enlace normal */}
            <Link
              href="/cart"
              aria-haspopup="dialog"
              onClick={(e) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                e.preventDefault()
                abrirPanel()
              }}
              className="flex h-11 min-w-[44px] items-center justify-center gap-2 px-1 text-[15px] font-semibold md:justify-start md:px-0"
            >
              <ShoppingBag className="h-5 w-5 shrink-0" strokeWidth={1.8} aria-hidden />
              {/* Se lee «Carrito, 2 productos»; en el celular solo se ven el ícono y el número */}
              <span className="sr-only md:not-sr-only">Carrito</span> <span className="tabular-nums">{count}</span>
              <span className="sr-only"> {count === 1 ? 'producto' : 'productos'}</span>
            </Link>
            {!enCompra && (
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center md:hidden"
                aria-expanded={abierto}
                aria-controls={idMenu}
                aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
                onClick={() => setAbierto((v) => !v)}
              >
                {abierto ? (
                  <X className="h-6 w-6" strokeWidth={2} aria-hidden />
                ) : (
                  <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Menú del celular: se abre debajo de la barra, encima de la página */}
        {!enCompra && (
          <div
            id={idMenu}
            hidden={!abierto}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-60px)] overflow-y-auto border-t border-linea-oscura bg-tinta md:hidden"
          >
            <nav aria-label="Principal en el celular" className="contenedor pb-6 pt-2">
              <ul>
                {enlaces.map((e) => (
                  <li key={e.href} className="border-b border-linea-oscura">
                    <Link
                      href={e.href}
                      aria-current={actual(e.href)}
                      onClick={() => setAbierto(false)}
                      className="flex min-h-[56px] items-center text-lg font-semibold aria-[current=page]:text-accent"
                    >
                      {e.texto}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] text-claro">{ENVIO}</p>
            </nav>
          </div>
        )}
      </header>
      {/* Destino del salto: justo después del menú (scroll-mt para que el menú fijo no lo tape) */}
      <div id="contenido" tabIndex={-1} className="scroll-mt-20 outline-none" />
    </>
  )
}
