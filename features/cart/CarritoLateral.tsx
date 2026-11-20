'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { CartItem } from '@/shared/types/commerce'
import { useCountry } from '@/features/country/CountryProvider'
import { formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { COMBO_MIN_UNITS } from '@/shared/lib/combo-promo'
import { armarLineas, resumirCarrito } from '@/features/cart/lineas'
import { useCatalogo } from '@/features/cart/useCatalogo'
import SelectorCantidad from '@/features/cart/SelectorCantidad'

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Lo que dura la entrada y la salida del panel (ms). */
const TRANSICION = 200

/**
 * Carrito lateral: se abre al agregar un producto y con el ícono del carrito del menú. A la derecha en escritorio y
 * desde abajo en el celular. Es un diálogo: atrapa el foco, Escape lo cierra y al cerrarse el foco vuelve a donde
 * estaba. Lleva a /checkout («Continuar con mi pedido»), donde se piden los datos del pedido.
 */
export default function CarritoLateral({
  abierto,
  items,
  onCerrar,
  onCambiarCantidad,
  onQuitar,
}: {
  abierto: boolean
  items: CartItem[]
  onCerrar: () => void
  onCambiarCantidad: (productId: string, quantity: number, variante?: CartItem['variante']) => void
  onQuitar: (productId: string, variante?: CartItem['variante']) => void
}) {
  const pathname = usePathname()
  const titulo = useId()
  const panel = useRef<HTMLDivElement>(null)
  const antes = useRef<HTMLElement | null>(null)
  // montado: está en la página; visible: ya entró (para la transición)
  const [montado, setMontado] = useState(false)
  const [visible, setVisible] = useState(false)

  const { country } = useCountry()
  const { productos, cargado } = useCatalogo(montado)

  // Entrar y salir con transición
  useEffect(() => {
    if (abierto) {
      antes.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setMontado(true)
      const cuadro = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(cuadro)
    }
    setVisible(false)
    const t = setTimeout(() => setMontado(false), TRANSICION)
    return () => clearTimeout(t)
  }, [abierto])

  // Con el panel abierto, la página de atrás no se desplaza; al cerrarse, el foco vuelve a donde estaba
  useEffect(() => {
    if (!montado) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      const previo = antes.current
      if (previo && document.contains(previo)) previo.focus()
    }
  }, [montado])

  // Al cambiar de página (por ejemplo, a /checkout), se cierra
  const rutaInicial = useRef(pathname)
  useEffect(() => {
    if (rutaInicial.current !== pathname) {
      rutaInicial.current = pathname
      onCerrar()
    }
  }, [pathname, onCerrar])

  const alTeclear = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCerrar()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const enfocables = Array.from(panel.current.querySelectorAll<HTMLElement>(ENFOCABLES)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )
      if (enfocables.length === 0) {
        e.preventDefault()
        panel.current.focus()
        return
      }
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      const activo = document.activeElement
      if (e.shiftKey && (activo === primero || activo === panel.current)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    },
    [onCerrar]
  )

  if (!montado) return null

  const config = getCountryConfig(country)
  const lineas = armarLineas(items, productos, country)
  const resumen = resumirCarrito(lineas)
  const moneda = lineas[0]?.price.currency ?? config.currency
  const dinero = (monto: number) => formatCurrency(monto, moneda, config.locale)
  const esperando = items.length > 0 && !cargado
  const vacio = items.length === 0
  const sinCatalogo = cargado && items.length > 0 && lineas.length === 0
  const puedeSeguir = !esperando && resumen.disponibles.length > 0

  return (
    <div className="fixed inset-0 z-[80]" onKeyDown={alTeclear}>
      <div
        aria-hidden
        onClick={onCerrar}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 motion-reduce:transition-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titulo}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-2xl border-t border-dark-300 bg-dark text-white outline-none transition-transform duration-200 ease-out motion-reduce:transition-none md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-[420px] md:rounded-none md:border-l md:border-t-0 ${
          visible ? 'translate-x-0 translate-y-0' : 'translate-y-full md:translate-x-full md:translate-y-0'
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-dark-300 px-5 py-4">
          <h2 id={titulo} className="font-heading text-3xl leading-none tracking-wide">
            Tu carrito
            {resumen.unidades > 0 ? (
              <span className="ml-3 font-sans text-sm font-normal tracking-normal text-neutral">
                {resumen.unidades === 1 ? '1 producto' : `${resumen.unidades} productos`}
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="-mr-2 rounded-lg p-2 text-neutral-light transition hover:bg-dark-100 hover:text-white"
            aria-label="Cerrar el carrito"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {esperando ? (
            <ul aria-label="Cargando el carrito">
              {items.slice(0, 3).map((item) => (
                <li key={`${item.productId}-${item.variante?.color ?? ''}`} className="flex animate-pulse gap-4 border-b border-dark-300 px-5 py-4">
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-dark-200" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 rounded bg-dark-200" />
                    <div className="h-4 w-1/3 rounded bg-dark-200" />
                  </div>
                </li>
              ))}
            </ul>
          ) : vacio ? (
            <div className="px-5 py-10 text-center">
              <p className="text-base text-white">Tu carrito está vacío.</p>
              <p className="mt-2 text-sm text-neutral-light">Agrega productos desde la tienda.</p>
            </div>
          ) : sinCatalogo ? (
            <p className="px-5 py-8 text-sm leading-relaxed text-neutral-light">
              No pudimos cargar los productos de tu carrito. Vuelve a intentarlo en un momento o{' '}
              <Link href="/cart" className="text-accent underline underline-offset-2 hover:text-white">
                abre el carrito
              </Link>
              .
            </p>
          ) : (
            <ul>
              {lineas.map((linea) => {
                const nombre = linea.product.name.trim()
                const max = Math.max(1, linea.product.stock)
                return (
                  <li key={linea.clave} className="flex gap-4 border-b border-dark-300 px-5 py-4">
                    <Link
                      href={`/product/${linea.product.slug}`}
                      onClick={onCerrar}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-dark-300 bg-white"
                    >
                      {linea.product.imageUrls[0] ? (
                        <Image
                          src={linea.product.imageUrls[0]}
                          alt={nombre}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium leading-snug text-white">{nombre}</p>
                          {linea.variante?.color ? (
                            <p className="mt-0.5 text-sm text-neutral-light">Color: {linea.variante.color}</p>
                          ) : null}
                          <p className="mt-0.5 text-sm text-neutral">
                            {formatCurrency(linea.price.amount, linea.price.currency, config.locale)} c/u
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onQuitar(linea.productId, linea.variante)}
                          className="-mr-2 shrink-0 rounded-lg p-2 text-neutral transition hover:bg-dark-100 hover:text-white"
                          aria-label={`Quitar ${nombre}${linea.variante?.color ? ` (${linea.variante.color})` : ''} del carrito`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      {linea.agotado ? (
                        <p className="mt-2 text-sm text-neutral-light">Agotado por ahora: no va en tu pedido.</p>
                      ) : (
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <SelectorCantidad
                            tamano="sm"
                            valor={linea.quantity}
                            max={max}
                            etiqueta={`Cantidad de ${nombre}`}
                            onCambiar={(q) => onCambiarCantidad(linea.productId, q, linea.variante)}
                          />
                          <p className="font-semibold tabular-nums text-white">
                            {formatCurrency(linea.lineTotal, linea.price.currency, config.locale)}
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-dark-300 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          {puedeSeguir ? (
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4 text-neutral-light">
                <dt>Subtotal</dt>
                <dd className="tabular-nums text-white">{dinero(resumen.combo.subtotal)}</dd>
              </div>
              {resumen.combo.descuento > 0 ? (
                <div className="flex justify-between gap-4 text-accent">
                  <dt>Combo 10%</dt>
                  <dd className="tabular-nums">−{dinero(resumen.combo.descuento)}</dd>
                </div>
              ) : resumen.hayProductosDelCombo ? (
                <p className="text-xs text-neutral">
                  Con {COMBO_MIN_UNITS} o más productos del combo tienes 10% menos.
                </p>
              ) : null}
              <div className="flex items-baseline justify-between gap-4 pt-1">
                <dt className="text-base text-white">Total de productos</dt>
                <dd className="text-xl font-bold tabular-nums text-accent">{dinero(resumen.combo.total)}</dd>
              </div>
              <p className="text-xs text-neutral">No incluye el envío.</p>
            </dl>
          ) : null}

          {puedeSeguir ? (
            <Link
              href="/checkout"
              onClick={onCerrar}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-dark transition hover:bg-accent-dark"
            >
              Continuar con mi pedido
            </Link>
          ) : null}
          {vacio ? (
            <Link
              href="/"
              onClick={onCerrar}
              className="flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-dark transition hover:bg-accent-dark"
            >
              Ir a la tienda
            </Link>
          ) : (
            <button
              type="button"
              onClick={onCerrar}
              className={`${puedeSeguir ? 'mt-2' : ''} flex w-full items-center justify-center rounded-xl border border-dark-300 px-6 py-3 text-base font-medium text-white transition hover:border-accent hover:text-accent`}
            >
              Seguir comprando
            </button>
          )}
          {resumen.todoAgotado ? (
            <p className="mt-3 text-center text-sm text-neutral-light">
              Lo que tienes en el carrito está agotado por ahora.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
