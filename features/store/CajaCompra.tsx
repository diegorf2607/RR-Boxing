'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CartItem, Product } from '@/shared/types/commerce'
import { useCart } from '@/features/cart/CartProvider'
import { precargarCatalogo } from '@/features/cart/useCatalogo'
import { useCountry } from '@/features/country/CountryProvider'
import { formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { COMBO_MIN_UNITS, participaDelCombo } from '@/shared/lib/combo-promo'
import ProductPrice from '@/features/store/ProductPrice'
import SelectorCantidad from '@/features/cart/SelectorCantidad'
import { getStockStatus } from '@/features/store/stockUrgency'
import { getPriceForCountry } from '@/features/store/pricing'
import { coloresDisponibles, nombreConVariante } from '@/features/store/colores'
import { ID_FIN_FICHA, opcionesPack, precioPack } from '@/features/store/packs'
import { enlaceConsultaAgotado, enlacePedidoLineas } from '@/features/store/pedidoWhatsappProducto'

/** Lo que tapa la barra del menú arriba (px): si la caja ya pasó por debajo, salió de la pantalla. */
const ALTO_MENU = 64

/**
 * Caja de compra de la ficha: precio, color (si el producto viene en varios), solo o en combo, cantidad y los dos
 * botones. Al agregar se abre el carrito lateral. En el celular, cuando la caja sale de la pantalla, aparece abajo una
 * barra con el nombre, el precio y «Agregar»; se esconde al llegar al final de la ficha para no tapar el pie.
 */
export default function CajaCompra({ product, candidatos }: { product: Product; candidatos: Product[] }) {
  const { addItems, abrirPanel } = useCart()
  const { country } = useCountry()
  const base = useId()
  const caja = useRef<HTMLDivElement>(null)

  const opciones = useMemo(() => opcionesPack(product, candidatos), [product, candidatos])
  const [opcionId, setOpcionId] = useState(() => opciones[0]?.id ?? 'solo')
  const [cantidad, setCantidad] = useState(1)
  const [colores, setColores] = useState<Record<string, string>>({})
  const [avisarColor, setAvisarColor] = useState(false)
  const [barra, setBarra] = useState(false)

  const estado = getStockStatus(product.stock)
  const agotado = estado.kind === 'agotado'
  const opcion = opciones.find((o) => o.id === opcionId)
  const productos = opcion?.productos ?? [product]
  const tope = (lista: Product[]) => Math.max(1, Math.min(...lista.map((p) => p.stock)))
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

  // Barra del celular: visible cuando la caja ya pasó hacia arriba y todavía no llega el final de la ficha
  useEffect(() => {
    if (agotado) return
    let cuadro = 0
    const medir = () => {
      cuadro = 0
      const elemento = caja.current
      if (!elemento) return
      const pasada = elemento.getBoundingClientRect().bottom < ALTO_MENU
      const fin = document.getElementById(ID_FIN_FICHA)
      const alFinal = fin ? fin.getBoundingClientRect().top < window.innerHeight : false
      setBarra(pasada && !alFinal)
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
      </fieldset>
    )
  }

  const nombre = product.name.trim()
  const esCombo = productos.length > 1 || unidades > 1
  const avisoCombo = !agotado && participaDelCombo(product) && opciones.length === 0

  return (
    <>
      <div ref={caja} className="max-w-lg">
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
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
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
          <button
            type="button"
            disabled={agotado}
            onClick={agregar}
            className="w-full rounded-lg bg-accent px-6 py-4 text-base font-bold text-dark transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
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
            className="block w-full rounded-lg border border-accent px-6 py-4 text-center text-base font-bold text-accent transition-colors hover:bg-accent/10"
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
              <p className="truncate text-sm font-medium text-white">{nombre}</p>
              <p className="truncate text-sm">
                <span className="font-bold tabular-nums text-accent">{dinero(total.total)}</span>
                {opcion && opcion.productos.length > 1 ? (
                  <span className="text-neutral"> · {opcion.titulo}</span>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              onClick={agregar}
              className="shrink-0 rounded-lg bg-accent px-6 py-3 text-base font-bold text-dark transition-colors hover:bg-accent-dark"
            >
              Agregar
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
