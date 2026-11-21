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
import { armarLineas, resumirCarrito, topeLinea } from '@/features/cart/lineas'
import { useCatalogo } from '@/features/cart/useCatalogo'
import SelectorCantidad from '@/features/cart/SelectorCantidad'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
import { enlacePedidoLineas } from '@/features/store/pedidoWhatsappProducto'

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Lo que dura la entrada y la salida del panel (ms). */
const TRANSICION = 200

/**
 * Carrito lateral, blanco con líneas finas: se abre al agregar un producto y con el carrito del menú. A la derecha en
 * escritorio y desde abajo en el celular. Es un diálogo: atrapa el foco, Escape lo cierra y al cerrarse el foco vuelve a donde
 * estaba. El teclado se escucha en todo el documento, para que Escape y Tab sigan funcionando aunque el foco se haya
 * caído al <body>. Lleva a /checkout («Continuar con mi pedido»), donde se piden los datos del pedido, y también deja
 * pedir directo por WhatsApp con el pedido ya escrito.
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
  const tituloRef = useRef<HTMLHeadingElement>(null)
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
    (e: KeyboardEvent) => {
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
      // El foco se fue fuera del panel (por ejemplo, al <body>): vuelve al primero, o al último si va hacia atrás
      if (!activo || !panel.current.contains(activo)) {
        e.preventDefault()
        const destino = e.shiftKey ? ultimo : primero
        destino.focus()
        return
      }
      // Hacia atrás desde el primero, desde el panel o desde el título (que van antes del primero): al último
      const antesDelPrimero = activo === primero || Boolean(activo.compareDocumentPosition(primero) & Node.DOCUMENT_POSITION_FOLLOWING)
      const despuesDelUltimo = activo === ultimo || Boolean(activo.compareDocumentPosition(ultimo) & Node.DOCUMENT_POSITION_PRECEDING)
      if (e.shiftKey && antesDelPrimero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && despuesDelUltimo) {
        e.preventDefault()
        primero.focus()
      }
    },
    [onCerrar]
  )

  // Mientras el panel está en la página, el teclado se escucha en todo el documento
  useEffect(() => {
    if (!montado) return
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [montado, alTeclear])

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
    <div className="fixed inset-0 z-[80]">
      <div
        aria-hidden
        onClick={onCerrar}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200 motion-reduce:transition-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titulo}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col border-t border-linea bg-white text-tinta outline-none transition-transform duration-200 ease-out motion-reduce:transition-none md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-[440px] md:border-l md:border-t-0 ${
          visible ? 'translate-x-0 translate-y-0' : 'translate-y-full md:translate-x-full md:translate-y-0'
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-linea px-5 py-3.5">
          {/* tabIndex -1: recibe el foco cuando se quita una línea (el botón del tacho desaparece) */}
          <h2 id={titulo} ref={tituloRef} tabIndex={-1} className="flex items-baseline gap-3 outline-none">
            <span className="titulo-bloque text-[40px] md:text-[44px]">Tu carrito</span>
            {resumen.unidades > 0 ? (
              <span className="text-sm font-medium text-suave">
                {resumen.unidades === 1 ? '1 producto' : `${resumen.unidades} productos`}
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="-mr-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-tinta transition-colors hover:bg-gris"
            aria-label="Cerrar el carrito"
          >
            <X className="h-6 w-6" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {esperando ? (
            <ul aria-label="Cargando el carrito">
              {items.slice(0, 3).map((item) => (
                <li
                  key={`${item.productId}-${item.variante?.color ?? ''}`}
                  className="flex gap-4 border-b border-linea px-5 py-4 motion-safe:animate-pulse"
                >
                  <div className="h-20 w-20 shrink-0 bg-gris" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 bg-gris" />
                    <div className="h-4 w-1/3 bg-gris" />
                  </div>
                </li>
              ))}
            </ul>
          ) : vacio ? (
            <div className="px-5 py-10 text-center">
              <p className="text-lg font-semibold">Tu carrito está vacío.</p>
              <p className="mt-2 text-suave">Agrega productos desde la tienda.</p>
            </div>
          ) : sinCatalogo ? (
            <p className="px-5 py-8 leading-relaxed text-tinta-2">
              No pudimos cargar los productos de tu carrito. Vuelve a intentarlo en un momento o{' '}
              <Link href="/cart" className="enlace text-tinta">
                abre el carrito
              </Link>
              .
            </p>
          ) : (
            <ul>
              {lineas.map((linea) => {
                const nombre = linea.product.name.trim()
                const max = topeLinea(linea.product.stock)
                return (
                  <li key={linea.clave} className="flex gap-4 border-b border-linea px-5 py-4">
                    <Link
                      href={`/product/${linea.product.slug}`}
                      onClick={onCerrar}
                      className="relative h-20 w-20 shrink-0 overflow-hidden bg-gris"
                    >
                      {linea.product.imageUrls[0] ? (
                        <Image
                          src={linea.product.imageUrls[0]}
                          alt={nombre}
                          fill
                          sizes="80px"
                          className="object-contain p-1.5 mix-blend-multiply"
                        />
                      ) : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold leading-snug">{nombre}</p>
                          {linea.variante?.color ? (
                            <p className="mt-0.5 text-sm text-tinta-2">Color: {linea.variante.color}</p>
                          ) : null}
                          <p className="mt-0.5 text-sm text-suave">
                            {formatCurrency(linea.price.amount, linea.price.currency, config.locale)} c/u
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onQuitar(linea.productId, linea.variante)
                            // El botón desaparece con la línea: el foco pasa al título para no caerse al <body>
                            requestAnimationFrame(() => tituloRef.current?.focus())
                          }}
                          className="-mr-3 -mt-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-suave transition-colors hover:bg-gris hover:text-tinta"
                          aria-label={`Quitar ${nombre}${linea.variante?.color ? ` (${linea.variante.color})` : ''} del carrito`}
                        >
                          <Trash2 className="h-[18px] w-[18px]" aria-hidden />
                        </button>
                      </div>
                      {linea.agotado ? (
                        <p className="mt-2 text-sm font-semibold">Agotado por ahora: no va en tu pedido.</p>
                      ) : (
                        <div className="mt-2.5 flex items-center justify-between gap-3">
                          <SelectorCantidad
                            tamano="sm"
                            valor={linea.quantity}
                            max={max}
                            etiqueta={`Cantidad de ${nombre}`}
                            onCambiar={(q) => onCambiarCantidad(linea.productId, q, linea.variante)}
                          />
                          <p className="num text-[22px] leading-none">
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

        <div className="border-t border-linea px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          {puedeSeguir ? (
            <dl className="space-y-1.5 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-suave">Subtotal</dt>
                <dd className="tabular-nums">{dinero(resumen.combo.subtotal)}</dd>
              </div>
              {resumen.combo.descuento > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <dt>
                    <span className="etiqueta">Combo 10%</span>
                  </dt>
                  <dd className="font-semibold tabular-nums">−{dinero(resumen.combo.descuento)}</dd>
                </div>
              ) : resumen.hayProductosDelCombo ? (
                <p className="text-sm text-suave">Con {COMBO_MIN_UNITS} o más productos del combo tienes 10% menos.</p>
              ) : null}
              <div className="flex items-baseline justify-between gap-4 pt-1">
                <dt className="text-base font-bold">Total de productos</dt>
                <dd className="num text-[28px] leading-none">{dinero(resumen.combo.total)}</dd>
              </div>
              <p className="text-sm text-suave">No incluye el envío.</p>
            </dl>
          ) : null}

          {puedeSeguir ? (
            <Link href="/checkout" onClick={onCerrar} className="btn-primary mt-4">
              Continuar con mi pedido
            </Link>
          ) : null}
          {puedeSeguir ? (
            <a
              href={enlacePedidoLineas(resumen.disponibles, country)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-2"
            >
              <IconoWhatsapp />
              Pedir directo por WhatsApp
            </a>
          ) : null}
          {vacio ? (
            <Link href="/" onClick={onCerrar} className="btn-primary">
              Ir a la tienda
            </Link>
          ) : (
            <button
              type="button"
              onClick={onCerrar}
              className={`${puedeSeguir ? 'mt-1' : ''} flex min-h-[44px] w-full items-center justify-center text-[15px] font-semibold underline underline-offset-[3px] hover:decoration-2`}
            >
              Seguir comprando
            </button>
          )}
          {resumen.todoAgotado ? (
            <p className="mt-3 text-center text-sm text-tinta-2">Lo que tienes en el carrito está agotado por ahora.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
