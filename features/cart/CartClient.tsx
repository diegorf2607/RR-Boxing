'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Lock, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import type { CurrencyCode, Product } from '@/shared/types/commerce'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'
import {
  computeComboDiscountAmount,
  subtotalAfterComboDiscount,
} from '@/shared/lib/combo-promo'

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
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoaded, setProductsLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setProductsLoaded(true))
  }, [])

  const rows = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) return null
        const price = getPriceForCountry(product, country)
        return {
          ...item,
          product,
          price,
          lineTotal: price.amount * item.quantity,
        }
      })
      .filter(Boolean)
  }, [items, products, country]) as Array<{
    productId: string
    quantity: number
    product: Product
    price: { amount: number; currency: CurrencyCode; compareAtAmount?: number }
    lineTotal: number
  }>

  const config = getCountryConfig(country)
  const subtotal = rows.reduce((acc, row) => acc + row.lineTotal, 0)
  const itemCount = rows.reduce((acc, row) => acc + row.quantity, 0)
  const comboDiscount = computeComboDiscountAmount(subtotal, itemCount)
  const subtotalConCombo = subtotalAfterComboDiscount(subtotal, itemCount)

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
                {itemCount === 1 ? '1 artículo' : `${itemCount} artículos`} · Envío y pack opcional se eligen en el checkout
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
              Sumá equipamiento oficial o revisá el catálogo. Lo que guardes acá queda listo para el checkout.
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
              Hay productos en tu carrito que ya no están disponibles. Volvé a la tienda y agregalos de nuevo.
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
                const atStockCap = row.product.stock > 0 && row.quantity >= row.product.stock
                const canInc = row.product.stock > 0 && row.quantity < row.product.stock

                return (
                  <li key={row.productId}>
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
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(row.productId)}
                              className="shrink-0 rounded-lg border border-transparent p-2 text-neutral-light transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                              aria-label={`Quitar ${row.product.name} del carrito`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                            <span className="font-semibold text-accent">
                              {formatCurrency(row.price.amount, row.price.currency, config.locale)} c/u
                            </span>
                            {row.price.compareAtAmount != null && row.price.compareAtAmount > row.price.amount && (
                              <span className="text-neutral line-through">
                                {formatCurrency(row.price.compareAtAmount, row.price.currency, config.locale)}
                              </span>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dark-300 pt-4">
                            <div className="flex items-center rounded-xl border border-dark-300 bg-dark p-1">
                              <button
                                type="button"
                                disabled={row.quantity <= 1}
                                onClick={() => updateQuantity(row.productId, row.quantity - 1)}
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
                                    Math.min(row.product.stock || 999, row.quantity + 1)
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

                          {row.product.stock > 0 && (
                            <p className="mt-2 text-xs text-neutral">
                              {atStockCap ? (
                                <span className="text-amber-400/90">Stock máximo para este producto.</span>
                              ) : (
                                <>Disponible: {row.product.stock} u.</>
                              )}
                            </p>
                          )}
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
                    <dt>Subtotal productos</dt>
                    <dd className="font-semibold text-white">{formatCurrency(subtotal, config.currency, config.locale)}</dd>
                  </div>
                  {comboDiscount > 0 ? (
                    <div className="flex justify-between gap-4 rounded-lg border border-accent/25 bg-accent/5 px-2 py-2 text-accent">
                      <dt className="font-semibold">Promo combo (10%) + regalo</dt>
                      <dd className="font-bold tabular-nums">−{formatCurrency(comboDiscount, config.currency, config.locale)}</dd>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral">
                      Agregá otro artículo y activá <strong className="text-accent">10% OFF</strong> + regalo en el checkout.
                    </p>
                  )}
                </dl>
                <div className="my-5 h-px bg-dark-300" />
                <div className="flex justify-between gap-4 font-heading text-2xl tracking-wide">
                  <span className="text-neutral-light">Total estimado</span>
                  <span className="text-accent">{formatCurrency(subtotalConCombo, config.currency, config.locale)}</span>
                </div>
                <p className="mt-4 flex items-start gap-2 rounded-lg border border-dark-300 bg-dark/60 px-3 py-2.5 text-xs leading-relaxed text-neutral-light">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                  <span>
                    Acá solo sumamos productos. El envío (puede ser gratis según método) y el pack opcional se ven en el
                    checkout. Pago seguro con Stripe.
                  </span>
                </p>
                <Link
                  href="/checkout"
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-accent py-3.5 text-center text-base font-bold text-dark shadow-lg shadow-accent/20 transition hover:bg-accent-dark hover:shadow-accent/30"
                >
                  Ir al checkout
                </Link>
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
