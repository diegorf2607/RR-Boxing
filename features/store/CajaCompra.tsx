'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import type { CartItem, Product } from '@/shared/types/commerce'
import { useCart } from '@/features/cart/CartProvider'
import { precargarCatalogo } from '@/features/cart/useCatalogo'
import { topeLinea } from '@/features/cart/lineas'
import { useCountry } from '@/features/country/CountryProvider'
import { formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { COMBO_MIN_UNITS, participaDelCombo } from '@/shared/lib/combo-promo'
import ProductPrice from '@/features/store/ProductPrice'
import SelectorCantidad from '@/features/cart/SelectorCantidad'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
import { getStockStatus } from '@/features/store/stockUrgency'
import { getPriceForCountry } from '@/features/store/pricing'
import { colorDeLasFotos, coloresDisponibles, nombreConVariante } from '@/features/store/colores'
import { ID_FIN_FICHA, nombreCorto, opcionesPack, precioPack, type OpcionPack } from '@/features/store/packs'
import { enlaceConsultaAgotado, enlacePedidoLineas } from '@/features/store/pedidoWhatsappProducto'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

/** Lo que tapa la barra del menú arriba (px): si el botón ya pasó por debajo, salió de la pantalla. */
const ALTO_MENU = 68

/** El cuadrito de color junto al nombre del color. Los que no están aquí van sin cuadrito. */
const MUESTRAS: Record<string, string> = {
  blanco: '#F4F2EC',
  negro: '#111111',
}

const conMayuscula = (texto: string) => texto.charAt(0).toLocaleUpperCase('es-PE') + texto.slice(1)

/** «Guantes + vendas + cuerda»: lo que lleva cada pack. El producto solo conserva su título («Solo guantes»). */
const tituloPack = (o: OpcionPack) =>
  o.productos.length < 2 ? o.titulo : conMayuscula(o.productos.map(nombreCorto).join(' + '))

/** Cuadro de opción (color o pack): línea gris, y al elegirlo, borde negro de 2 px (el relleno compensa el borde). */
const OPCION =
  'cursor-pointer border border-linea-fuerte bg-white transition-colors hover:border-tinta has-[:checked]:border-2 has-[:checked]:border-tinta has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tinta'

/**
 * Caja de compra de la ficha: precio, color (si el producto viene en varios), solo o en combo, cantidad con el total
 * y los dos botones; debajo van las filas de envío, pago y garantía (ProductTrustBlocks, desde la página). Al agregar
 * se abre el carrito lateral. En el celular y la tableta, mientras «Agregar al carrito» no está a la vista (más abajo,
 * en la primera pantalla, o ya pasado), abajo hay una barra con el nombre, el total, WhatsApp y «Agregar»; se esconde
 * al llegar al final de la ficha para no tapar el pie. Con ?pack=<slugs> (los combos del inicio) llega con ese pack.
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

  /** «Pedir por WhatsApp» (en la caja y en la barra): si falta un color, primero se elige. */
  const alPedirPorWhatsapp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!agotado && faltan.length > 0) {
      e.preventDefault()
      pedirColor()
    }
  }

  // El carrito lateral se abre al agregar: que encuentre el catálogo ya cargado
  useEffect(() => {
    precargarCatalogo()
  }, [])

  // Barra de abajo: visible mientras el botón «Agregar al carrito» no está en la pantalla (todavía más abajo, o ya
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
      <p className="mt-2.5 text-sm text-suave">
        Las fotos son del color {deLasFotos}.{' '}
        <a href={pedirFoto} target="_blank" rel="noopener noreferrer" className="enlace text-tinta">
          Pídenos una foto del {otros.join(' o del ')} por WhatsApp
        </a>
        .
      </p>
    )
  }

  /** Cuadros de color de un producto: obligatorio elegir uno antes de agregar. */
  const selectorColor = ({ product: p, lista: todos }: { product: Product; lista: string[] }) => {
    // Primero el color que muestran las fotos (el que se ve arriba); después los demás, en el orden del panel
    const deLasFotos = colorDeLasFotos(p)
    const lista = deLasFotos
      ? [...todos].sort((a, b) => Number(b.toLocaleLowerCase('es-PE') === deLasFotos) - Number(a.toLocaleLowerCase('es-PE') === deLasFotos))
      : todos
    const elegido = colores[p.id]
    const errorId = `${base}-color-error-${p.id}`
    const mostrarError = avisarColor && !elegido
    return (
      <fieldset key={p.id} className="mt-7">
        <legend className="mb-2.5 font-bold">
          {p.id === product.id ? 'Color' : `Color de ${p.name.trim().toLocaleLowerCase('es-PE')}`}:{' '}
          <span className="font-medium text-suave">{elegido ?? 'elige uno'}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {lista.map((color, i) => {
            const id = `${base}-color-${p.id}-${i}`
            const muestra = MUESTRAS[color.toLocaleLowerCase('es-PE')]
            return (
              <label
                key={color}
                htmlFor={id}
                className={`${OPCION} flex min-h-[52px] min-w-[96px] items-center gap-2.5 pl-3 pr-[18px] font-semibold has-[:checked]:pl-[11px] has-[:checked]:pr-[17px] ${
                  muestra ? '' : 'justify-center'
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name={`${base}-color-${p.id}`}
                  value={color}
                  checked={elegido === color}
                  onChange={() => setColores((prev) => ({ ...prev, [p.id]: color }))}
                  aria-describedby={mostrarError ? errorId : undefined}
                  className="sr-only"
                />
                {muestra ? (
                  <span aria-hidden className="h-[26px] w-[26px] shrink-0 border border-[#BDBDBD]" style={{ background: muestra }} />
                ) : null}
                {color}
              </label>
            )
          })}
        </div>
        {mostrarError ? (
          <p id={errorId} role="alert" className="mt-2.5 flex items-start gap-1.5 text-sm font-semibold text-tinta">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Elige un color para continuar.
          </p>
        ) : null}
        {notaFotos(p, lista)}
      </fieldset>
    )
  }

  const nombre = product.name.trim()
  const enPack = productos.length > 1
  const colorElegido = colores[product.id]
  // La barra de abajo dice el color elegido y cuántas unidades (o combos) suma su total
  const detalleBarra = enPack
    ? unidades > 1
      ? `${unidades} combos`
      : tituloPack(opcion ?? opciones[0])
    : unidades > 1
      ? `${unidades} unidades`
      : ''
  const combo = !agotado && participaDelCombo(product)
  // Con packs para elegir, se dice que juntándolo con otro producto hay 10%; si no, que con 2 o más unidades
  const aclaracion = combo && opciones.length > 0 ? 'Con otro producto en tu pedido, 10% de descuento.' : undefined
  const avisoCombo = combo && opciones.length === 0

  return (
    <>
      <ProductPrice product={product} aclaracion={aclaracion} />
      {estado.kind !== 'disponible' ? <p className="mt-2 text-[15px] font-semibold">{estado.label}</p> : null}

      {!agotado && colorPropio ? selectorColor(colorPropio) : null}

      {!agotado && opciones.length > 0 ? (
        <fieldset className="mt-7">
          <legend className="mb-2.5 font-bold">Llévalo solo o en combo</legend>
          <div className="grid gap-2">
            {opciones.map((o) => {
              const precio = precioPack(o.productos, Math.min(cantidad, tope(o.productos)), country)
              const solo = o.productos.length < 2
              return (
                <label
                  key={o.id}
                  className={`${OPCION} grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 px-4 py-3.5 has-[:checked]:px-[15px] has-[:checked]:py-[13px]`}
                >
                  <input
                    type="radio"
                    name={`${base}-pack`}
                    value={o.id}
                    checked={o.id === opcionId}
                    onChange={() => setOpcionId(o.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="row-span-2 h-5 w-5 rounded-full border-2 border-[#9A9A9A] peer-checked:border-[6px] peer-checked:border-tinta"
                  />
                  <span className="col-start-2 row-start-1 font-bold leading-snug">{tituloPack(o)}</span>
                  <span className="col-start-2 row-start-2 text-sm text-suave">
                    {solo
                      ? `Con ${COMBO_MIN_UNITS} unidades o más también tienes el 10%`
                      : `Por separado ${dinero(precio.subtotal)}`}
                  </span>
                  <span className="num col-start-3 row-span-2 row-start-1 text-right text-2xl leading-tight">
                    {dinero(precio.total)}
                    {precio.descuento > 0 ? (
                      <span className="mt-1 block bg-accent px-1.5 py-px font-sans text-[13px] font-semibold leading-snug tracking-normal">
                        Ahorras {dinero(precio.descuento)}
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
        <div className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <SelectorCantidad
              valor={unidades}
              max={tope(productos)}
              onCambiar={setCantidad}
              etiqueta={enPack ? 'Cantidad de combos' : `Cantidad de ${nombre}`}
            />
            <p className="text-right" aria-live="polite">
              <span className="num block text-[32px] leading-none">{dinero(total.total)}</span>
              <span className="mt-1 block text-sm text-suave">
                {total.descuento > 0 ? `Ahorras ${dinero(total.descuento)} (10%)` : 'Total de productos'}
              </span>
            </p>
          </div>
          {enPack ? (
            <p className="mt-3 text-sm text-suave">
              {lineas.map((l) => `${l.quantity} × ${nombreConVariante(l.product.name, l.variante)}`).join(' + ')}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 grid gap-2">
        <button ref={boton} type="button" disabled={agotado} onClick={agregar} className="btn-primary min-h-[58px] text-[17px]">
          {agotado ? 'Agotado' : 'Agregar al carrito'}
        </button>
        <a
          href={hrefWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={alPedirPorWhatsapp}
          className="btn-secondary min-h-[58px] text-[17px]"
        >
          <IconoWhatsapp />
          {agotado ? 'Preguntar por WhatsApp' : 'Pedir por WhatsApp'}
        </a>
      </div>

      {avisoCombo ? (
        <p className="mt-4 text-sm text-suave">
          Con {COMBO_MIN_UNITS} o más unidades en tu pedido, <span className="font-semibold text-tinta">10% de descuento</span>{' '}
          en productos.
        </p>
      ) : null}

      {!agotado ? (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#CFCFCF] bg-white px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 transition-[transform,visibility] duration-200 motion-reduce:transition-none lg:hidden ${
            barra ? 'visible translate-y-0' : 'invisible translate-y-[110%]'
          }`}
        >
          <div className="mx-auto flex max-w-tienda items-center gap-3">
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[15px] font-bold">
                {nombre}
                {colorElegido ? ` · ${colorElegido}` : ''}
              </p>
              <p className="truncate">
                <span className="num text-2xl leading-none">{dinero(total.total)}</span>
                {detalleBarra ? <span className="text-sm text-suave"> · {detalleBarra}</span> : null}
              </p>
            </div>
            <a
              href={hrefWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={alPedirPorWhatsapp}
              aria-label="Pedir por WhatsApp"
              className="flex h-[50px] w-[50px] shrink-0 items-center justify-center border-2 border-tinta transition-colors hover:bg-gris"
            >
              <IconoWhatsapp className="h-6 w-6" />
            </a>
            <button type="button" onClick={agregar} className="btn-primary min-h-[50px] w-auto shrink-0 px-[18px]">
              Agregar
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
