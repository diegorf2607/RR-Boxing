'use client'

import Image from 'next/image'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CartItem, Product } from '@/shared/types/commerce'
import { useCart } from '@/features/cart/CartProvider'
import { precargarCatalogo } from '@/features/cart/useCatalogo'
import { topeLinea } from '@/features/cart/lineas'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
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
const ALTO_MENU = 68

/** La muestra de color junto al nombre, como en la maqueta. Un color que no está aquí va sin muestra. */
const MUESTRAS: Record<string, string> = {
  negro: '#111111',
  blanco: '#F2F0EA',
}

/** La etiqueta de cada grupo de la caja (color, pack, cantidad): 14.5 px en negrita, como en la maqueta. */
const leyenda = 'mb-2.5 text-[14.5px] font-semibold text-white'

/**
 * Caja de compra de la ficha, en la línea A: precio, color (si el producto viene en varios), solo o en combo, cantidad,
 * el resumen y los dos botones. Cada grupo es una caja con borde (.opcion); la elegida lleva borde blanco doble y el
 * punto amarillo. Al agregar se abre el carrito lateral. Debajo de 900 px, mientras «Agregar al carrito» no está a la
 * vista (más abajo, en la primera pantalla, o ya pasado), abajo hay una barra con la foto, el nombre, el precio y
 * «Agregar»; se esconde al llegar al final de la ficha para no tapar el pie. Con ?pack=<slugs> (los combos del inicio)
 * llega con ese pack elegido.
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
      <p className="mt-2.5 text-[13.5px] text-neutral">
        Las fotos son del color {deLasFotos}.{' '}
        <a
          href={pedirFoto}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-light underline decoration-1 underline-offset-4 hover:text-white"
        >
          Pídenos una foto del {otros.join(' o del ')} por WhatsApp
        </a>
        .
      </p>
    )
  }

  /** Cajas de color de un producto (dos por fila): obligatorio elegir uno antes de agregar. */
  const selectorColor = ({ product: p, lista }: { product: Product; lista: string[] }) => {
    const elegido = colores[p.id]
    const errorId = `${base}-color-error-${p.id}`
    const mostrarError = avisarColor && !elegido
    return (
      <fieldset key={p.id} className="min-w-0">
        <legend className={leyenda}>
          {p.id === product.id ? 'Color' : `Color de ${p.name.trim().toLocaleLowerCase('es-PE')}`}:{' '}
          <span className={elegido ? 'text-white' : 'font-normal text-neutral'}>{elegido ?? 'elige uno'}</span>
        </legend>
        <div className="grid grid-cols-2 gap-2.5">
          {lista.map((color, i) => {
            const id = `${base}-color-${p.id}-${i}`
            const muestra = MUESTRAS[color.toLocaleLowerCase('es-PE')]
            return (
              <label key={color} htmlFor={id} className="opcion">
                <input
                  id={id}
                  type="radio"
                  name={`${base}-color-${p.id}`}
                  value={color}
                  checked={elegido === color}
                  onChange={() => setColores((prev) => ({ ...prev, [p.id]: color }))}
                  aria-describedby={mostrarError ? errorId : undefined}
                />
                <span className="opcion-caja">
                  {muestra ? (
                    <span aria-hidden className="h-4 w-4 shrink-0 rounded border border-dark-400" style={{ background: muestra }} />
                  ) : null}
                  {color}
                </span>
              </label>
            )
          })}
        </div>
        {mostrarError ? (
          <p id={errorId} role="alert" className="mt-2.5 text-sm text-amber-300">
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
  const foto = product.imageUrls[0]

  return (
    <>
      <div className="flex flex-col gap-[22px]">
        <div className="flex flex-col gap-4">
          <ProductPrice product={product} detalle={estado.label} />
          <p className="text-neutral-light">{product.description}</p>
        </div>

        {!agotado && colorPropio ? selectorColor(colorPropio) : null}

        {!agotado && opciones.length > 0 ? (
          <fieldset className="min-w-0">
            <legend className={leyenda}>Llévalo solo o en combo</legend>
            <div className="grid gap-2.5">
              {opciones.map((o) => {
                const precio = precioPack(o.productos, Math.min(cantidad, tope(o.productos)), country)
                const ahorro = precio.descuento > 0
                return (
                  <label key={o.id} className="opcion">
                    <input
                      type="radio"
                      name={`${base}-pack`}
                      value={o.id}
                      checked={o.id === opcionId}
                      onChange={() => setOpcionId(o.id)}
                    />
                    <span className="opcion-caja grid min-h-[68px] grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3.5 gap-y-0.5 py-3">
                      <span className={`opcion-punto ${ahorro ? 'row-span-2' : ''}`} />
                      <span className="font-semibold">{o.titulo}</span>
                      <span className={`text-right font-bold tabular-nums ${ahorro ? 'row-span-2' : ''}`}>
                        {dinero(precio.total)}
                      </span>
                      {ahorro ? (
                        <span className="col-start-2 text-[13.5px] font-medium text-accent">
                          Ahorras {dinero(precio.descuento)} (10%)
                        </span>
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ) : null}

        {!agotado ? coloresSumados.map(selectorColor) : null}

        {!agotado ? (
          <div>
            <p className={leyenda} aria-hidden>
              Cantidad
            </p>
            <SelectorCantidad
              valor={unidades}
              max={tope(productos)}
              onCambiar={setCantidad}
              etiqueta={productos.length > 1 ? 'Cantidad de combos' : `Cantidad de ${nombre}`}
            />
          </div>
        ) : null}

        {/* El resumen, como en la maqueta: entre dos líneas finas, cada producto con su precio y el total en negrita */}
        {!agotado && esCombo ? (
          <div className="grid gap-1.5 border-y border-dark-300 py-3.5 text-[15px] text-neutral-light" aria-live="polite">
            {lineas.map((l) => (
              <div key={l.product.id} className="flex justify-between gap-3">
                <span className="min-w-0">
                  {l.quantity} × {nombreConVariante(l.product.name, l.variante)}
                </span>
                <span className="shrink-0 tabular-nums text-white">
                  {dinero(getPriceForCountry(l.product, country).amount * l.quantity)}
                </span>
              </div>
            ))}
            {total.descuento > 0 ? (
              <div className="flex justify-between gap-3 text-accent">
                <span>Con el combo 10%: ahorras</span>
                <span className="shrink-0 tabular-nums">{dinero(total.descuento)}</span>
              </div>
            ) : null}
            <div className="mt-1 flex items-baseline justify-between gap-3 text-lg font-bold text-white">
              <span>Total de productos</span>
              <span className="shrink-0 tabular-nums">{dinero(total.total)}</span>
            </div>
          </div>
        ) : null}

        <div className="grid gap-2.5">
          <button ref={boton} type="button" disabled={agotado} onClick={agregar} className="btn-primary btn-xl">
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
            className="btn-secondary btn-xl"
          >
            <IconoWhatsapp />
            {agotado ? 'Preguntar por WhatsApp' : 'Pedir por WhatsApp'}
          </a>
          {avisoCombo ? (
            <p className="text-center text-[13.5px] text-neutral">
              Con {COMBO_MIN_UNITS} o más unidades en tu pedido, <span className="text-white">10% de descuento</span> en
              productos.
            </p>
          ) : null}
        </div>
      </div>

      {!agotado ? (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-dark-400 bg-dark-100 px-[var(--gut)] pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 transition-[transform,visibility] duration-[250ms] motion-reduce:transition-none min-[900px]:hidden ${
            barra ? 'visible translate-y-0' : 'invisible translate-y-[110%]'
          }`}
        >
          <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3">
            {foto ? (
              <span aria-hidden className="tile relative h-12 w-12 rounded-lg">
                <Image src={foto} alt="" fill sizes="48px" className="object-contain p-1" />
              </span>
            ) : (
              <span aria-hidden />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{nombreBarra}</p>
              <p className="truncate text-[15px]">
                <span className="font-bold tabular-nums text-white">{dinero(total.total)}</span>
                {detalleBarra ? <span className="text-sm text-neutral"> · {detalleBarra}</span> : null}
              </p>
            </div>
            <button type="button" onClick={agregar} className="btn-primary btn-compact w-auto shrink-0">
              Agregar
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
