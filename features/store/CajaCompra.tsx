'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CartItem, Product } from '@/shared/types/commerce'
import { useCart } from '@/features/cart/CartProvider'
import { precargarCatalogo } from '@/features/cart/useCatalogo'
import { topeLinea } from '@/features/cart/lineas'
import { useCountry } from '@/features/country/CountryProvider'
import { formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { COMBO_MIN_UNITS, participaDelCombo } from '@/shared/lib/combo-promo'
import ProductPrice from '@/features/store/ProductPrice'
import SelectorCantidad from '@/features/cart/SelectorCantidad'
import { getStockStatus } from '@/features/store/stockUrgency'
import { getPriceForCountry } from '@/features/store/pricing'
import { colorDeLasFotos, coloresDisponibles, nombreConVariante } from '@/features/store/colores'
import { ID_FIN_FICHA, opcionesPack, precioPack } from '@/features/store/packs'
import { enlaceConsultaAgotado, enlacePedidoLineas } from '@/features/store/pedidoWhatsappProducto'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

/** Lo que tapa la barra del menú arriba (px): si el botón ya pasó por debajo, salió de la pantalla. */
const ALTO_MENU = 64

/**
 * Caja de compra de la ficha: precio, color (si el producto viene en varios), solo o en combo, cantidad y los dos
 * botones. Al agregar se abre el carrito lateral. En el celular, mientras «Agregar al carrito» no está a la vista (más
 * abajo, en la primera pantalla, o ya pasado), abajo hay una barra con el nombre, el precio y «Agregar»; se esconde al
 * llegar al final de la ficha para no tapar el pie. Con ?pack=<slugs> (los combos del inicio) llega con ese pack elegido.
 */
export default function CajaCompra({ product, candidatos }: { product: Product; candidatos: Product[] }) {
  const { addItems, abrirPanel } = useCart()
  const { country } = useCountry()
  const base = useId()
  const boton = useRef<HTMLButtonElement>(null)

  const opciones = useMemo(() => opcionesPack(product, candidatos), [product, candidatos])
  const [opcionId, setOpcionId] = useState(() => opciones[0]?.id ?? 'solo')
  const [cantidad, setCantidad] = useState(1)
  const [colores, setColores] = useState<Record<string, string>>({})
  const [avisarColor, setAvisarColor] = useState(false)
  const [barra, setBarra] = useState(false)

  // Desde «Elegir este combo» del inicio: ?pack=vendas-boxeo-45m,cuerda-salto-boxeo elige el pack con esos productos
  useEffect(() => {
    const pedido = new URLSearchParams(window.location.search).get('pack')
    if (!pedido) return
    const clave = (slugs: string[]) => [...slugs].sort().join(',')
    const buscado = clave(pedido.split(',').map((s) => s.trim()).filter(Boolean))
    const elegida = opciones.find((o) => o.productos.length > 1 && clave(o.productos.slice(1).map((p) => p.slug)) === buscado)
    if (elegida) setOpcionId(elegida.id)
  }, [opciones])

  const estado = getStockStatus(product.stock)
  const agotado = estado.kind === 'agotado'
  const opcion = opciones.find((o) => o.id === opcionId)
  const productos = opcion?.productos ?? [product]
  // El stock más bajo del pedido, sin pasar el tope por línea que acepta el servidor
  const tope = (lista: Product[]) => topeLinea(Math.min(...lista.map((p) => p.stock)))
  const unidades = Math.min(cantidad, tope(productos))

  const locale = getCountryConfig(country).locale
  const moneda = getPriceForCountry(product, country).currency
  const dinero = (monto: number) => formatCurrency(monto, moneda, locale)

  // Los productos del pedido que vienen en varios colores: hay que elegir el de cada uno antes de agregar
  const porElegir = productos
    .map((p) => ({ product: p, lista: coloresDisponibles(p) }))
    .filter((x) => x.lista.length > 0)
  const faltan = porElegir.filter((x) => !colores[x.product.id])
  const colorPropio = porElegir.find((x) => x.product.id === product.id)
  const coloresSumados = porElegir.filter((x) => x.product.id !== product.id)

  const lineas = productos.map((p) => {
    const color = colores[p.id]
    const variante: CartItem['variante'] = color && coloresDisponibles(p).includes(color) ? { color } : undefined
    return { product: p, quantity: unidades, variante }
  })
  const total = precioPack(productos, unidades, country)
  const hrefWhatsapp = agotado ? enlaceConsultaAgotado(product) : enlacePedidoLineas(lineas, country)

  /** Lleva a la persona al primer color que falta elegir (desde la barra de abajo, también sube la página). */
  const pedirColor = () => {
    setAvisarColor(true)
    const primero = faltan[0]
    if (!primero) return
    const campo = document.getElementById(`${base}-color-${primero.product.id}-0`)
    if (!campo) return
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    campo.closest('fieldset')?.scrollIntoView({ block: 'center', behavior: suave ? 'smooth' : 'auto' })
    campo.focus({ preventScroll: true })
  }

  const agregar = () => {
    if (agotado) return
    if (faltan.length > 0) return pedirColor()
    addItems(lineas.map((l) => ({ productId: l.product.id, quantity: l.quantity, variante: l.variante })))
    abrirPanel()
  }

  // El carrito lateral se abre al agregar: que encuentre el catálogo ya cargado
  useEffect(() => {
    precargarCatalogo()
  }, [])

  // Barra del celular: visible mientras el botón «Agregar al carrito» no está en la pantalla (todavía más abajo, o ya
  // pasado hacia arriba) y no llega el final de la ficha. Así se puede comprar desde la primera pantalla.
  useEffect(() => {
    if (agotado) return
    let cuadro = 0
    const medir = () => {
      cuadro = 0
      const elemento = boton.current
      if (!elemento) return
      const r = elemento.getBoundingClientRect()
      const fuera = r.top > window.innerHeight || r.bottom < ALTO_MENU
      const fin = document.getElementById(ID_FIN_FICHA)
      const alFinal = fin ? fin.getBoundingClientRect().top < window.innerHeight : false
      setBarra(fuera && !alFinal)
    }
    const alMover = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir)
    }
    medir()
    window.addEventListener('scroll', alMover, { passive: true })
    window.addEventListener('resize', alMover)
    return () => {
      window.removeEventListener('scroll', alMover)
      window.removeEventListener('resize', alMover)
      if (cuadro) cancelAnimationFrame(cuadro)
    }
  }, [agotado])

  /** Si las fotos muestran un solo color, se dice cuál y se ofrece pedir una foto del otro por WhatsApp. */
  const notaFotos = (p: Product, lista: string[]) => {
    const deLasFotos = colorDeLasFotos(p)
    if (!deLasFotos) return null
    const otros = lista.filter((c) => c.toLocaleLowerCase('es-PE') !== deLasFotos).map((c) => c.toLocaleLowerCase('es-PE'))
    if (otros.length === 0) return null
    const pedirFoto = enlaceWhatsapp(`Hola, RR Boxing. Quiero ver una foto de «${p.name.trim()}» en color ${otros.join(' o ')}.`)
    return (
      <p className="mt-2 text-sm text-neutral">
        Las fotos son del color {deLasFotos}.{' '}
        <a
          href={pedirFoto}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-light underline underline-offset-2 hover:text-accent"
        >
          Pídenos una foto del {otros.join(' o del ')} por WhatsApp
        </a>
        .
      </p>
    )
  }

  /** Botones de color de un producto: obligatorio elegir uno antes de agregar. */
  const selectorColor = ({ product: p, lista }: { product: Product; lista: string[] }) => {
    const elegido = colores[p.id]
    const errorId = `${base}-color-error-${p.id}`
    const mostrarError = avisarColor && !elegido
    return (
      <fieldset key={p.id} className="mt-6">
        <legend className="text-sm text-neutral">
          {p.id === product.id ? 'Color' : `Color de ${p.name.trim().toLocaleLowerCase('es-PE')}`}:{' '}
          <span className={elegido ? 'text-white' : 'text-neutral'}>{elegido ?? 'elige uno'}</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {lista.map((color, i) => {
            const id = `${base}-color-${p.id}-${i}`
            const activo = elegido === color
            return (
              <label
                key={color}
                htmlFor={id}
                className={`min-w-[96px] cursor-pointer rounded-lg border px-5 py-3 text-center text-sm font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                  activo
                    ? 'border-accent bg-dark-100 text-white'
                    : 'border-dark-300 text-neutral-light hover:border-neutral-dark hover:text-white'
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name={`${base}-color-${p.id}`}
                  value={color}
                  checked={activo}
                  onChange={() => setColores((prev) => ({ ...prev, [p.id]: color }))}
                  aria-describedby={mostrarError ? errorId : undefined}
                  className="sr-only"
                />
                {color}
              </label>
            )
          })}
        </div>
        {mostrarError ? (
          <p id={errorId} role="alert" className="mt-2 text-sm text-amber-300">
            Elige un color para continuar.
          </p>
        ) : null}
        {notaFotos(p, lista)}
      </fieldset>
    )
  }

  const nombre = product.name.trim()
  const esCombo = productos.length > 1 || unidades > 1
  const enPack = productos.length > 1
  // La barra del celular dice cuántas unidades (o combos) suma su total, y el color elegido
  const nombreBarra = nombreConVariante(nombre, colores[product.id] ? { color: colores[product.id] } : undefined)
  const detalleBarra = enPack
    ? unidades > 1
      ? `${unidades} combos ${opcion?.titulo.toLocaleLowerCase('es-PE') ?? ''}`.trim()
      : opcion?.titulo ?? ''
    : unidades > 1
      ? `${unidades} unidades`
      : ''
  const avisoCombo = !agotado && participaDelCombo(product) && opciones.length === 0

  return (
    <>
      <div className="max-w-lg">
        <ProductPrice product={product} />
        <p className={`mt-3 text-sm ${agotado ? 'text-neutral' : 'text-neutral-light'}`}>{estado.label}</p>
        <p className="mt-4 text-neutral-light">{product.description}</p>

        {!agotado && colorPropio ? selectorColor(colorPropio) : null}

        {!agotado && opciones.length > 0 ? (
          <fieldset className="mt-6">
            <legend className="text-sm text-neutral">Llévalo solo o en combo</legend>
            <div className="mt-2 grid gap-2">
              {opciones.map((o) => {
                const precio = precioPack(o.productos, Math.min(cantidad, tope(o.productos)), country)
                const activa = o.id === opcionId
                return (
                  <label
                    key={o.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                      activa ? 'border-accent bg-dark-100' : 'border-dark-300 hover:border-neutral-dark'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${base}-pack`}
                      value={o.id}
                      checked={activa}
                      onChange={() => setOpcionId(o.id)}
                      className="h-4 w-4 shrink-0 accent-accent"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-white">{o.titulo}</span>
                      {precio.descuento > 0 ? (
                        <span className="block text-sm text-accent">Ahorras {dinero(precio.descuento)} (10%)</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-white">{dinero(precio.total)}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ) : null}

        {!agotado ? coloresSumados.map(selectorColor) : null}

        {!agotado ? (
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm text-neutral" aria-hidden>
              Cantidad
            </span>
            <SelectorCantidad
              valor={unidades}
              max={tope(productos)}
              onCambiar={setCantidad}
              etiqueta={productos.length > 1 ? 'Cantidad de combos' : `Cantidad de ${nombre}`}
            />
          </div>
        ) : null}

        {!agotado && esCombo ? (
          <div className="mt-5 border-t border-dark-300 pt-4" aria-live="polite">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-neutral-light">Total de productos</span>
              <span className="text-xl font-bold tabular-nums text-white">{dinero(total.total)}</span>
            </div>
            {total.descuento > 0 ? (
              <p className="mt-1 text-sm text-accent">Con el combo 10%: ahorras {dinero(total.descuento)}</p>
            ) : null}
            <p className="mt-2 text-sm text-neutral">
              {lineas.map((l) => `${l.quantity} × ${nombreConVariante(l.product.name, l.variante)}`).join(' + ')}
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          <button ref={boton} type="button" disabled={agotado} onClick={agregar} className="btn-primary">
            {agotado ? 'Agotado' : 'Agregar al carrito'}
          </button>
          <a
            href={hrefWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!agotado && faltan.length > 0) {
                e.preventDefault()
                pedirColor()
              }
            }}
            className="btn-secondary"
          >
            {agotado ? 'Preguntar por WhatsApp' : 'Pedir por WhatsApp'}
          </a>
        </div>

        {avisoCombo ? (
          <p className="mt-4 text-sm text-neutral-light">
            Con {COMBO_MIN_UNITS} o más unidades en tu pedido, <span className="text-white">10% de descuento</span> en
            productos.
          </p>
        ) : null}
      </div>

      {!agotado ? (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-dark-300 bg-dark/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-[transform,visibility] duration-200 motion-reduce:transition-none md:hidden ${
            barra ? 'visible translate-y-0' : 'invisible translate-y-full'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{nombreBarra}</p>
              <p className="truncate text-sm">
                <span className="font-bold tabular-nums text-accent">{dinero(total.total)}</span>
                {detalleBarra ? <span className="text-neutral"> · {detalleBarra}</span> : null}
              </p>
            </div>
            <button
              type="button"
              onClick={agregar}
              className="btn-primary w-auto shrink-0"
            >
              Agregar
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
