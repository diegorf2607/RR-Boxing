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
import { nombreConVariante } from '@/features/store/colores'

function CartLineSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 rounded-2xl border border-dark-300 bg-dark-100 p-4 md:p-5">
      <div className="h-20 w-20 shrink-0 rounded-lg bg-dark-200 md:h-24 md:w-24" />
      <div className="min-w-0 flex-1 space-y-3 py-1">
        <div className="h-5 w-3/4 max-w-xs rounded bg-dark-200" />
        <div className="h-4 w-24 rounded bg-dark-200" />
        <div className="h-10 w-36 rounded-lg bg-dark-200" />
      </div>
    </div>
  )
}

/**
 * /cart, en el estilo de /clase y del carrito lateral: filas con líneas finas, un acento y el resumen al lado (abajo en
 * el celular). Al quitar una línea, el foco pasa al título «Carrito» para no caerse al <body>.
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
    <section className="border-t border-dark-300 bg-dark pb-16 pt-6 md:pb-24 md:pt-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-neutral-light transition hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Seguir comprando
            </Link>
            <h1 ref={titulo} tabIndex={-1} className="page-title outline-none">
              Carrito
            </h1>
            {!trulyEmpty && !waitingForCatalog && !orphanLines && (
              <p className="mt-1 text-sm text-neutral-light">
                {itemCount === 1 ? '1 producto' : `${itemCount} productos`}
              </p>
            )}
          </div>
        </div>

        {waitingForCatalog ? (
          <div className="space-y-4">
            <CartLineSkeleton />
            <CartLineSkeleton />
          </div>
        ) : trulyEmpty ? (
          <div className="max-w-lg rounded-2xl border border-dark-300 bg-dark-100 p-5">
            <h2 className="text-lg font-semibold text-white">Tu carrito está vacío</h2>
            <p className="mt-2 text-base leading-relaxed text-neutral-light">
              Agrega productos desde la tienda y aquí armas tu pedido.
            </p>
            <Link href="/" className="btn-primary mt-5">
              Ir a la tienda
            </Link>
          </div>
        ) : orphanLines ? (
          <div className="max-w-lg rounded-2xl border border-dark-300 bg-dark-100 p-5">
            <p className="text-base leading-relaxed text-neutral-light">
              Hay productos en tu carrito que ya no están disponibles. Vuelve a la tienda y agrégalos de nuevo.
            </p>
            <Link href="/" className="btn-secondary mt-5">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start lg:gap-10">
            <ul className="rounded-2xl border border-dark-300 bg-dark-100">
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
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-dark-300 bg-white md:h-24 md:w-24"
                        >
                          {row.product.imageUrls[0] ? (
                            <Image
                              src={row.product.imageUrls[0]}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 80px, 96px"
                              className="object-contain"
                            />
                          ) : null}
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h2 className="text-base font-medium leading-snug text-white">
                                <Link href={`/product/${row.product.slug}`} className="hover:text-accent">
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
                              className="-mr-3 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral transition hover:bg-dark-200 hover:text-white"
                              aria-label={`Quitar ${row.product.name.trim()}${row.variante?.color ? ` (${row.variante.color})` : ''} del carrito`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
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
                                  className="text-accent underline underline-offset-2 hover:text-white"
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
                              <p className="font-semibold tabular-nums text-white">
                                {formatCurrency(row.lineTotal, row.price.currency, config.locale)}
                              </p>
                            </div>
                          )}

                          {stock.kind === 'pocas' && <p className="mt-2 text-xs text-neutral">{stock.label}</p>}
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>

            {/* Una sección dentro de <main> (no un <aside>): el resumen es parte del contenido principal */}
            <section aria-labelledby="resumen-carrito" className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-dark-300 bg-dark-100 p-6">
                <h2 id="resumen-carrito" className="text-lg font-semibold text-white">
                  Resumen
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-neutral-light">
                    <dt>Subtotal</dt>
                    <dd className="font-semibold tabular-nums text-white">{dinero(subtotal)}</dd>
                  </div>
                  {comboDiscount > 0 ? (
                    <div className="flex justify-between gap-4 text-accent">
                      <dt className="font-semibold">Combo 10%</dt>
                      <dd className="font-bold tabular-nums">−{dinero(comboDiscount)}</dd>
                    </div>
                  ) : hayProductosDelCombo ? (
                    <p className="text-xs text-neutral">
                      Con {COMBO_MIN_UNITS} o más productos del combo tienes 10% menos.
                    </p>
                  ) : null}
                </dl>
                <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-dark-300 pt-4">
                  <span className="text-base text-white">Total de productos</span>
                  <span className="text-xl font-bold tabular-nums text-accent">{dinero(subtotalConCombo)}</span>
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
                    <p className="mt-2 text-xs text-neutral">No incluye el envío.</p>
                    <Link href="/checkout" className="btn-primary mt-5">
                      Continuar con mi pedido
                    </Link>
                    <a href={enlacePedido} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-3">
                      Pedir directo por WhatsApp
                    </a>
                    <p className="mt-3 text-center text-sm leading-relaxed text-neutral-light">
                      Por WhatsApp, el mensaje sale con tu pedido ya escrito.
                    </p>
                  </>
                )}
                <Link
                  href="/"
                  className="mt-3 flex min-h-[44px] items-center justify-center text-sm text-neutral-light underline underline-offset-2 hover:text-accent"
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
