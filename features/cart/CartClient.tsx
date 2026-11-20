'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { COMBO_MIN_UNITS } from '@/shared/lib/combo-promo'
import { getStockStatus } from '@/features/store/stockUrgency'
import { enlaceConsultaAgotado, enlacePedidoLineas } from '@/features/store/pedidoWhatsappProducto'
import { armarLineas, resumirCarrito, topeLinea } from '@/features/cart/lineas'
import { useCatalogo } from '@/features/cart/useCatalogo'
import SelectorCantidad from '@/features/cart/SelectorCantidad'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
import { nombreConVariante } from '@/features/store/colores'

/** La caja de la línea A: fondo #131313, línea fina y 16 px de borde (sin el cambio de borde al pasar el mouse). */
const caja = 'rounded-2xl border border-dark-300 bg-dark-100'
const enlace = 'font-medium text-white underline decoration-1 underline-offset-4 hover:text-accent'

function CartLineSkeleton() {
  return (
    <div className={`flex animate-pulse gap-4 p-4 motion-reduce:animate-none md:p-5 ${caja}`}>
      <div className="h-20 w-20 shrink-0 rounded-xl bg-dark-200 md:h-24 md:w-24" />
      <div className="min-w-0 flex-1 space-y-3 py-1">
        <div className="h-5 w-3/4 max-w-xs rounded bg-dark-200" />
        <div className="h-4 w-24 rounded bg-dark-200" />
        <div className="h-10 w-36 rounded-lg bg-dark-200" />
      </div>
    </div>
  )
}

/**
 * /cart, en la línea A (como la ficha y el carrito lateral): los productos en una caja de filas con líneas finas, las
 * fotos sobre el gris claro y el resumen al lado desde 900 px (abajo en el celular). Al quitar una línea, el foco pasa
 * al título «Carrito» para no caerse al <body>.
 */
export default function CartClient() {
  const { items, removeItem, updateQuantity } = useCart()
  const titulo = useRef<HTMLHeadingElement>(null)
  const { country } = useCountry()
  const { productos, cargado: productsLoaded } = useCatalogo()

  // Cada línea es un producto con su color: dos colores del mismo producto son dos líneas.
  const rows = armarLineas(items, productos, country)

  const config = getCountryConfig(country)
  const currency = rows[0]?.price.currency ?? config.currency
  // Lo agotado se queda en el carrito, pero no entra en el resumen, ni en el combo, ni en el pedido.
  const resumen = resumirCarrito(rows)
  const { disponibles, todoAgotado, hayProductosDelCombo, unidades: itemCount } = resumen
  const subtotal = resumen.combo.subtotal
  const comboDiscount = resumen.combo.descuento
  const subtotalConCombo = resumen.combo.total
  const dinero = (amount: number) => formatCurrency(amount, currency, config.locale)

  // Cada línea va con su color; si a una le falta (un carrito guardado antes), el mensaje pregunta el color.
  const enlacePedido = enlacePedidoLineas(disponibles, country)

  const waitingForCatalog = items.length > 0 && !productsLoaded
  const trulyEmpty = items.length === 0
  const orphanLines = productsLoaded && items.length > 0 && rows.length === 0

  return (
    <section className="bg-dark pb-16 pt-2 min-[900px]:pb-20">
      <div className="wrap">
        <div className="mb-7 min-[900px]:mb-9">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm text-neutral-light transition-colors hover:text-white motion-reduce:transition-none"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.6} aria-hidden />
            Seguir comprando
          </Link>
          <h1 ref={titulo} tabIndex={-1} className="page-title mt-1 outline-none">
            Carrito
          </h1>
          {!trulyEmpty && !waitingForCatalog && !orphanLines && (
            <p className="mt-2 text-neutral-light">{itemCount === 1 ? '1 producto' : `${itemCount} productos`}</p>
          )}
        </div>

        {waitingForCatalog ? (
          <div className="space-y-4">
            <CartLineSkeleton />
            <CartLineSkeleton />
          </div>
        ) : trulyEmpty ? (
          <div className={`max-w-lg p-6 ${caja}`}>
            <h2 className="card-title">Tu carrito está vacío</h2>
            <p className="mt-3 text-neutral-light">Agrega productos desde la tienda y aquí armas tu pedido.</p>
            <Link href="/" className="btn-primary mt-5">
              Ir a la tienda
            </Link>
          </div>
        ) : orphanLines ? (
          <div className={`max-w-lg p-6 ${caja}`}>
            <p className="text-neutral-light">
              Hay productos en tu carrito que ya no están disponibles. Vuelve a la tienda y agrégalos de nuevo.
            </p>
            <Link href="/" className="btn-secondary mt-5">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 min-[900px]:grid-cols-[minmax(0,1fr)_360px] min-[900px]:items-start min-[900px]:gap-10">
            <ul className={caja}>
              {rows.map((row) => {
                const stock = getStockStatus(row.product.stock)
                const agotado = stock.kind === 'agotado'

                return (
                  <li key={row.clave} className="border-t border-dark-300 p-4 first:border-t-0 md:p-5">
                    <article>
                      <div className="flex gap-4">
                        {/* La foto lleva a la ficha con el dedo o el mouse; para el teclado basta el enlace del nombre */}
                        <Link
                          href={`/product/${row.product.slug}`}
                          tabIndex={-1}
                          aria-hidden="true"
                          className="tile relative h-20 w-20 shrink-0 rounded-xl md:h-24 md:w-24"
                        >
                          {row.product.imageUrls[0] ? (
                            <Image
                              src={row.product.imageUrls[0]}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 80px, 96px"
                              className="object-contain p-2"
                            />
                          ) : null}
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h2 className="text-[16.5px] font-semibold leading-snug text-white">
                                <Link href={`/product/${row.product.slug}`} className="hover:underline hover:decoration-1 hover:underline-offset-4">
                                  {row.product.name}
                                </Link>
                              </h2>
                              {row.variante?.color ? (
                                <p className="mt-0.5 text-sm text-neutral-light">Color: {row.variante.color}</p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                removeItem(row.productId, row.variante)
                                // El botón desaparece con la línea: el foco pasa al título para no caerse al <body>
                                requestAnimationFrame(() => titulo.current?.focus())
                              }}
                              className="-mb-3 -mr-3 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral transition-colors hover:bg-dark-200 hover:text-white motion-reduce:transition-none"
                              aria-label={`Quitar ${row.product.name.trim()}${row.variante?.color ? ` (${row.variante.color})` : ''} del carrito`}
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.6} aria-hidden />
                            </button>
                          </div>

                          <p className="mt-0.5 text-sm text-neutral">
                            {formatCurrency(row.price.amount, row.price.currency, config.locale)} c/u
                          </p>

                          {agotado ? (
                            <div className="mt-3 text-sm">
                              <p className="font-semibold text-amber-400/90">{stock.label}</p>
                              <p className="mt-1 text-neutral-light">
                                No va en tu pedido.{' '}
                                <a
                                  href={enlaceConsultaAgotado(row.product)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={enlace}
                                >
                                  Preguntar cuándo vuelve
                                </a>
                              </p>
                            </div>
                          ) : (
                            <div className="mt-3 flex flex-nowrap items-center justify-between gap-3">
                              <SelectorCantidad
                                tamano="sm"
                                valor={row.quantity}
                                max={topeLinea(row.product.stock)}
                                etiqueta={`Cantidad de ${nombreConVariante(row.product.name, row.variante)}`}
                                onCambiar={(q) => updateQuantity(row.productId, q, row.variante)}
                              />
                              <p className="font-bold tabular-nums text-white">
                                {formatCurrency(row.lineTotal, row.price.currency, config.locale)}
                              </p>
                            </div>
                          )}

                          {stock.kind === 'pocas' && <p className="mt-2 text-[13px] text-neutral">{stock.label}</p>}
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>

            {/* Una sección dentro de <main> (no un <aside>): el resumen es parte del contenido principal */}
            <section aria-labelledby="resumen-carrito" className="min-[900px]:sticky min-[900px]:top-[88px]">
              <div className={`p-5 sm:p-6 ${caja}`}>
                <h2 id="resumen-carrito" className="card-title">
                  Resumen
                </h2>
                <dl className="mt-5 grid gap-1.5 text-[15px] text-neutral-light">
                  <div className="flex justify-between gap-4">
                    <dt>Subtotal</dt>
                    <dd className="tabular-nums text-white">{dinero(subtotal)}</dd>
                  </div>
                  {comboDiscount > 0 ? (
                    <div className="flex justify-between gap-4 text-accent">
                      <dt>Combo 10%</dt>
                      <dd className="tabular-nums">−{dinero(comboDiscount)}</dd>
                    </div>
                  ) : hayProductosDelCombo ? (
                    <p className="text-[13.5px] text-neutral">
                      Con {COMBO_MIN_UNITS} o más productos del combo tienes 10% menos.
                    </p>
                  ) : null}
                </dl>
                <div className="mt-3.5 flex items-baseline justify-between gap-4 border-t border-dark-300 pt-3.5 text-lg font-bold text-white">
                  <span>Total de productos</span>
                  <span className="tabular-nums">{dinero(subtotalConCombo)}</span>
                </div>
                {todoAgotado ? (
                  <>
                    <button type="button" disabled className="btn-primary mt-5">
                      Continuar con mi pedido
                    </button>
                    <p className="mt-3 text-center text-sm leading-relaxed text-neutral-light">
                      Lo que tienes en el carrito está agotado por ahora, así que no hay nada que pedir. Agrega otros
                      productos desde la tienda.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-1.5 text-[13.5px] text-neutral">No incluye el envío.</p>
                    <Link href="/checkout" className="btn-primary mt-5">
                      Continuar con mi pedido
                    </Link>
                    <a href={enlacePedido} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-2.5">
                      <IconoWhatsapp />
                      Pedir directo por WhatsApp
                    </a>
                    <p className="mt-3 text-center text-[13.5px] text-neutral">
                      Por WhatsApp, el mensaje sale con tu pedido ya escrito.
                    </p>
                  </>
                )}
                <Link
                  href="/"
                  className="mt-2 flex min-h-[44px] items-center justify-center text-sm font-medium text-neutral-light underline decoration-1 underline-offset-4 hover:text-white"
                >
                  Agregar más productos
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  )
}
