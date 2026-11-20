'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, X } from 'lucide-react'
import { useCart } from '@/features/cart/CartProvider'
import EnlaceClase from '@/components/EnlaceClase'

/** En el carrito y en /checkout el menú no saca a la persona hacia las clases: ahí la acción es terminar el pedido. */
const RUTAS_DE_COMPRA = ['/cart', '/checkout']

const claseEnlaceEscritorio =
  'inline-flex min-h-[44px] items-center whitespace-nowrap text-[15px] font-[550] text-neutral-light transition-colors hover:text-white aria-[current=page]:text-white'

const claseEnlaceCelular =
  'flex min-h-[52px] items-center border-b border-dark-300 text-[17px] font-[550] text-white aria-[current=page]:text-accent'

/**
 * La barra de la tienda, como la maqueta de la línea A: el logo con «RR Boxing», el menú en el medio (desde 768 px) y
 * el carrito con borde a la derecha. En el celular, el menú se abre con el botón de tres líneas, debajo de la barra.
 * Sin selector de país: solo hay envíos dentro del Perú y en soles (CountryProvider ya fuerza PE).
 */
export default function MainNav() {
  const { count, abrirPanel } = useCart()
  const pathname = usePathname()
  const enCompra = RUTAS_DE_COMPRA.some((ruta) => pathname === ruta || pathname?.startsWith(`${ruta}/`))

  const [menuAbierto, setMenuAbierto] = useState(false)
  const idMenu = useId()
  const cabecera = useRef<HTMLElement>(null)
  const botonMenu = useRef<HTMLButtonElement>(null)

  // Al cambiar de página, el menú se cierra
  useEffect(() => {
    setMenuAbierto(false)
  }, [pathname])

  // Con el menú abierto: Escape lo cierra y devuelve el foco al botón; un toque fuera de la barra o pasar a una
  // pantalla ancha (donde el menú ya está a la vista) también lo cierran.
  useEffect(() => {
    if (!menuAbierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuAbierto(false)
      botonMenu.current?.focus()
    }
    const alTocar = (e: PointerEvent) => {
      if (cabecera.current && !cabecera.current.contains(e.target as Node)) setMenuAbierto(false)
    }
    const ancho = window.matchMedia('(min-width: 768px)')
    const alCambiarAncho = () => {
      if (ancho.matches) setMenuAbierto(false)
    }
    document.addEventListener('keydown', alTeclear)
    document.addEventListener('pointerdown', alTocar)
    ancho.addEventListener('change', alCambiarAncho)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.removeEventListener('pointerdown', alTocar)
      ancho.removeEventListener('change', alCambiarAncho)
    }
  }, [menuAbierto])

  const actual = (ruta: string) => (pathname === ruta ? ('page' as const) : undefined)
  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <>
      {/* Para teclado y lector de pantalla: salta el menú y va directo al contenido de la página */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-3 focus:font-semibold focus:text-dark"
      >
        Saltar al contenido
      </a>
      <header ref={cabecera} className="sticky top-0 z-50 border-b border-dark-300 bg-dark/95">
        <div className="wrap flex h-[68px] items-center gap-4 md:gap-10">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image src="/rr-boxing-logo.png" alt="" width={30} height={46} priority className="h-[46px] w-[30px]" />
            <span className="font-heading text-[19px] leading-none tracking-[0.005em] [font-stretch:75%]">RR Boxing</span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
            <Link href="/" aria-current={actual('/')} className={claseEnlaceEscritorio}>
              Tienda
            </Link>
            <Link href="/consulta" aria-current={actual('/consulta')} className={claseEnlaceEscritorio}>
              Clases 1 a 1
            </Link>
            <EnlaceClase className={claseEnlaceEscritorio}>Clase virtual</EnlaceClase>
            <Link href="/#preguntas-frecuentes" className={claseEnlaceEscritorio}>
              Preguntas
            </Link>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {/* Abre el carrito lateral; con Ctrl, Cmd o la rueda del ratón, abre /cart como un enlace normal.
                En el celular «Carrito» queda solo para el lector de pantalla: se ve el ícono y la cantidad. */}
            <Link
              href="/cart"
              aria-haspopup="dialog"
              onClick={(e) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                e.preventDefault()
                setMenuAbierto(false)
                abrirPanel()
              }}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-dark-400 px-3 text-sm font-semibold tabular-nums text-white transition-colors hover:border-neutral motion-reduce:transition-none"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              <span>
                <span className="max-sm:sr-only">Carrito </span>({count})
              </span>
            </Link>

            {!enCompra ? (
              <button
                ref={botonMenu}
                type="button"
                aria-label="Menú"
                aria-expanded={menuAbierto}
                aria-controls={idMenu}
                onClick={() => setMenuAbierto((v) => !v)}
                className="flex h-11 w-11 items-center justify-center text-white md:hidden"
              >
                {menuAbierto ? (
                  <X className="h-6 w-6" strokeWidth={1.6} aria-hidden />
                ) : (
                  <span aria-hidden className="grid gap-[5px]">
                    <span className="block h-[1.6px] w-5 bg-current" />
                    <span className="block h-[1.6px] w-5 bg-current" />
                    <span className="block h-[1.6px] w-5 bg-current" />
                  </span>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {/* El menú del celular: cae sobre la página, debajo de la barra, con filas separadas por líneas finas */}
        {!enCompra ? (
          <nav
            id={idMenu}
            aria-label="Principal"
            hidden={!menuAbierto}
            className="absolute inset-x-0 top-full border-b border-dark-300 bg-dark md:hidden"
          >
            <div className="wrap pb-4">
              <Link href="/" aria-current={actual('/')} onClick={cerrarMenu} className={claseEnlaceCelular}>
                Tienda
              </Link>
              <Link href="/consulta" aria-current={actual('/consulta')} onClick={cerrarMenu} className={claseEnlaceCelular}>
                Clases 1 a 1
              </Link>
              <EnlaceClase className={claseEnlaceCelular}>Clase virtual</EnlaceClase>
              <Link href="/#preguntas-frecuentes" onClick={cerrarMenu} className={claseEnlaceCelular}>
                Preguntas
              </Link>
            </div>
          </nav>
        ) : null}
      </header>
      {/* Destino del salto: justo después del menú (scroll-mt para que el menú fijo no lo tape) */}
      <div id="contenido" tabIndex={-1} className="scroll-mt-20 outline-none" />
    </>
  )
}
