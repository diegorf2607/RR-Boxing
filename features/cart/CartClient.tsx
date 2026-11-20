'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { COMBO_MIN_UNITS } from '@/shared/lib/combo-promo'
import { getStockStatus } from '@/features/store/stockUrgency'
import { enlaceConsultaAgotado, enlacePedidoLineas } from '@/features/store/pedidoWhatsappProducto'
import { armarLineas, resumirCarrito } from '@/features/cart/lineas'
import { useCatalogo } from '@/features/cart/useCatalogo'

function CartLineSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 rounded-2xl border border-dark-300 bg-dark-100 p-4 md:p-5">
      <div className="h-24 w-24 shrink-0 rounded-xl bg-dark-200 md:h-28 md:w-28" />
      <div className="min-w-0 flex-1 space-y-3 py-1">
        <div className="h-5 w-3/4 max-w-xs rounded bg-dark-200" />
        <div className="h-4 w-24 rounded bg-dark-200" />
        <div className="h-10 w-36 rounded-lg bg-dark-200" />
      </div>
    </div>
  )
}

export default function CartClient() {
  const { items, removeItem, updateQuantity } = useCart()
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
    <section className="border-t border-dark-300/80 bg-gradient-to-b from-dark to-dark-100 pb-16 pt-6 md:pb-24 md:pt-10">
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
            <h1 className="font-heading text-4xl tracking-wide text-white md:text-5xl">Carrito</h1>
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
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dark-300 bg-dark-100 px-6 py-14 text-center shadow-xl shadow-black/20">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
              <ShoppingBag className="h-8 w-8 text-accent" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="font-heading text-2xl tracking-wide text-white md:text-3xl">Tu carrito está vacío</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-light">
              Agrega productos desde la tienda y aquí armas tu pedido.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex min-w-[200px] items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-dark transition hover:bg-accent-dark"
            >
              Ir a la tienda
            </Link>
            <Link href="/consulta" className="mt-3 text-sm font-medium text-accent underline-offset-4 hover:underline">
              Consultar clases 1 a 1
            </Link>
          </div>
        ) : orphanLines ? (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 px-5 py-8 text-center md:px-8">
            <p className="text-sm leading-relaxed text-neutral-light md:text-base">
              Hay productos en tu carrito que ya no están disponibles. Vuelve a la tienda y agrégalos de nuevo.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-xl border border-accent px-6 py-3 text-sm font-bold text-accent transition hover:bg-accent/10"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start lg:gap-10">
            <ul className="space-y-4">
              {rows.map((row) => {
                const stock = getStockStatus(row.product.stock)
                const agotado = stock.kind === 'agotado'
                const canInc = row.product.stock > 0 && row.quantity < row.product.stock

                return (
                  <li key={row.clave}>
                    <article className="rounded-2xl border border-dark-300 bg-dark-100 p-4 shadow-lg shadow-black/20 transition hover:border-accent/35 md:p-5">
                      <div className="flex gap-4">
                        <Link
                          href={`/product/${row.product.slug}`}
                          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-dark-300 bg-dark-200 ring-1 ring-white/5 transition hover:ring-accent/40 md:h-28 md:w-28"
                        >
                          {row.product.imageUrls[0] ? (
                            <Image
                              src={row.product.imageUrls[0]}
                              alt={row.product.name}
                              fill
                              sizes="(max-width: 768px) 96px, 112px"
                              className="object-cover"
                            />
                          ) : null}
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="inline-block rounded-full bg-dark-300/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-light">
                                {row.product.category}
                              </span>
                              <Link href={`/product/${row.product.slug}`} className="group block">
                                <h2 className="mt-1 font-heading text-xl leading-tight tracking-wide text-white transition group-hover:text-accent md:text-2xl">
                                  {row.product.name}
                                </h2>
                              </Link>
                              {row.variante?.color ? (
                                <p className="mt-0.5 text-sm text-neutral-light">Color: {row.variante.color}</p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(row.productId, row.variante)}
                              className="shrink-0 rounded-lg border border-transparent p-2 text-neutral-light transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                              aria-label={`Quitar ${row.product.name.trim()}${row.variante?.color ? ` (${row.variante.color})` : ''} del carrito`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                            <span className="font-semibold text-accent">
                              {formatCurrency(row.price.amount, row.price.currency, config.locale)} c/u
                            </span>
                          </div>

                          {agotado ? (
                            <div className="mt-4 border-t border-dark-300 pt-4 text-sm">
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
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dark-300 pt-4">
                              <div className="flex items-center rounded-xl border border-dark-300 bg-dark p-1">
                                <button
                                  type="button"
                                  disabled={row.quantity <= 1}
                                  onClick={() => updateQuantity(row.productId, row.quantity - 1, row.variante)}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-light transition hover:bg-dark-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                  aria-label="Menos una unidad"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="min-w-[2.5rem] text-center font-mono text-sm font-bold tabular-nums text-white">
                                  {row.quantity}
                                </span>
                                <button
                                  type="button"
                                  disabled={!canInc}
                                  onClick={() =>
                                    updateQuantity(
                                      row.productId,
                                      Math.min(row.product.stock || 999, row.quantity + 1),
                                      row.variante
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-light transition hover:bg-dark-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                  aria-label="Más una unidad"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="font-heading text-2xl tracking-wide text-accent md:text-3xl">
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

            <aside className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-dark-300 bg-gradient-to-b from-dark-100 to-dark p-6 shadow-xl shadow-black/30 ring-1 ring-white/5">
                <h3 className="font-heading text-2xl tracking-wide text-white">Resumen</h3>
                <dl className="mt-6 space-y-3 text-sm">
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
                <div className="my-5 h-px bg-dark-300" />
                <div className="flex items-baseline justify-between gap-4 font-heading tracking-wide">
                  <span className="whitespace-nowrap text-xl text-neutral-light">Total de productos</span>
                  <span className="text-2xl tabular-nums text-accent">{dinero(subtotalConCombo)}</span>
                </div>
                {todoAgotado ? (
                  <>
                    <button
                      type="button"
                      disabled
                      className="mt-6 flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-accent py-3.5 text-center text-base font-bold text-dark opacity-40"
                    >
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
                    <Link
                      href="/checkout"
                      className="mt-5 flex w-full items-center justify-center rounded-xl bg-accent py-3.5 text-center text-base font-bold text-dark transition hover:bg-accent-dark"
                    >
                      Continuar con mi pedido
                    </Link>
                    <a
                      href={enlacePedido}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex w-full items-center justify-center rounded-xl border border-accent py-3 text-center text-sm font-bold text-accent transition hover:bg-accent/10"
                    >
                      Pedir directo por WhatsApp
                    </a>
                    <p className="mt-3 text-center text-sm leading-relaxed text-neutral-light">
                      Por WhatsApp, el mensaje sale con tu pedido ya escrito.
                    </p>
                  </>
                )}
                <Link
                  href="/"
                  className="mt-3 block text-center text-sm font-medium text-neutral-light underline-offset-4 hover:text-accent hover:underline"
                >
                  Agregar más productos
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}
