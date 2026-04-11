'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Lock, Package, Sparkles } from 'lucide-react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import { COUNTRY_CONFIG, formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'
import type { CountryCode, CurrencyCode, Product } from '@/shared/types/commerce'
import CheckoutStripeEmbedded from '@/features/checkout/CheckoutStripeEmbedded'

export default function CheckoutClient() {
  const { items } = useCart()
  const { country: ctxCountry, setCountry: setCtxCountry } = useCountry()
  const [country, setCountry] = useState<CountryCode>(ctxCountry)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [catalog, setCatalog] = useState<Product[]>([])
  const [catalogLoaded, setCatalogLoaded] = useState(false)
  const [phase, setPhase] = useState<'details' | 'payment'>('details')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setCountry(ctxCountry)
  }, [ctxCountry])

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d: { products?: Product[] }) => {
        setCatalog(Array.isArray(d.products) ? d.products : [])
      })
      .catch(() => setCatalog([]))
      .finally(() => setCatalogLoaded(true))
  }, [])

  const countryConfig = getCountryConfig(country)

  const lines = useMemo(() => {
    return items
      .map((item) => {
        const product = catalog.find((p) => p.id === item.productId)
        if (!product) return null
        const price = getPriceForCountry(product, country)
        return {
          product,
          quantity: item.quantity,
          unitAmount: price.amount,
          currency: price.currency,
          lineTotal: price.amount * item.quantity,
        }
      })
      .filter(Boolean) as {
      product: Product
      quantity: number
      unitAmount: number
      currency: CurrencyCode
      lineTotal: number
    }[]
  }, [items, catalog, country])

  const subtotal = useMemo(() => lines.reduce((acc, l) => acc + l.lineTotal, 0), [lines])
  const shipping = countryConfig.shippingFlatAmount
  const firstCurrency = lines[0]?.currency
  const total = subtotal + shipping

  const formValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    name.trim().length >= 2 &&
    address.trim().length >= 5 &&
    items.length > 0 &&
    lines.length === items.length

  const handleContinueToPayment = async () => {
    setError('')
    setSessionLoading(true)
    try {
      const res = await fetch('/api/checkout/embedded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, address, country, items }),
      })
      const data = (await res.json()) as { clientSecret?: string; error?: string }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo iniciar el pago.')
        return
      }
      if (!data.clientSecret) {
        setError('Respuesta inválida del servidor.')
        return
      }
      setCtxCountry(country)
      setClientSecret(data.clientSecret)
      setPhase('payment')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setSessionLoading(false)
    }
  }

  if (!catalogLoaded) {
    return (
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full border-2 border-accent/30 border-t-accent" />
        <p className="mt-4 text-center text-sm text-neutral-light">Cargando tu pedido…</p>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="container mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-dark-300 bg-dark-100">
          <Package className="h-10 w-10 text-neutral" />
        </div>
        <h1 className="mb-3 font-heading text-4xl tracking-wide text-white md:text-5xl">Checkout</h1>
        <p className="mb-8 text-neutral-light">Tu carrito está vacío. Agrega productos para pagar con Stripe.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3 font-bold text-dark transition hover:bg-accent-light"
        >
          Ir a la tienda
        </Link>
      </section>
    )
  }

  if (lines.length !== items.length) {
    return (
      <section className="container mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="mb-3 font-heading text-4xl text-white">Checkout</h1>
        <p className="mb-6 text-neutral-light">
          Algunos productos ya no están disponibles. Vuelve al carrito y actualízalo.
        </p>
        <Link href="/cart" className="text-accent underline hover:text-accent-light">
          Ver carrito
        </Link>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden pb-20 pt-6 md:pt-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,215,0,0.12),transparent)]" />
      <div className="container relative mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">RRBOXING</p>
            <h1 className="font-heading text-5xl tracking-wide text-white md:text-6xl">Checkout</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-neutral-light">
              <Lock className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              Pago seguro procesado por Stripe
            </p>
          </div>
          {phase === 'payment' && (
            <button
              type="button"
              onClick={() => {
                setPhase('details')
                setClientSecret(null)
              }}
              className="self-start text-sm text-accent underline-offset-4 hover:underline"
            >
              ← Editar datos de envío
            </button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Resumen */}
          <aside className="lg:col-span-5">
            <div className="sticky top-24 space-y-4 rounded-3xl border border-dark-300/80 bg-gradient-to-b from-dark-100 to-dark p-6 shadow-xl shadow-black/40 ring-1 ring-accent/10">
              <div className="flex items-center gap-2 border-b border-dark-300 pb-4">
                <Sparkles className="h-5 w-5 text-accent" />
                <h2 className="font-heading text-2xl tracking-wide text-white">Tu pedido</h2>
              </div>
              <ul className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
                {lines.map(({ product, quantity, unitAmount, currency, lineTotal }) => (
                  <li key={product.id} className="flex gap-4 rounded-xl border border-dark-300/60 bg-dark/50 p-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-dark-200">
                      {product.imageUrls[0] ? (
                        <Image
                          src={product.imageUrls[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug text-white">{product.name}</p>
                      <p className="mt-1 text-xs text-neutral">
                        {quantity} × {formatCurrency(unitAmount, currency, countryConfig.locale)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-accent">
                        {formatCurrency(lineTotal, currency, countryConfig.locale)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 border-t border-accent/20 pt-4 text-sm">
                <div className="flex justify-between text-neutral-light">
                  <span>Subtotal</span>
                  <span>
                    {firstCurrency ? formatCurrency(subtotal, firstCurrency, countryConfig.locale) : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-light">
                  <span>Envío ({countryConfig.name})</span>
                  <span>
                    {firstCurrency
                      ? formatCurrency(shipping, firstCurrency, countryConfig.locale)
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-dark-300 pt-3 font-heading text-xl tracking-wide text-white">
                  <span>Total</span>
                  <span className="text-accent">
                    {firstCurrency ? formatCurrency(total, firstCurrency, countryConfig.locale) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Formulario + Stripe */}
          <div className="lg:col-span-7">
            {phase === 'details' && (
              <div className="rounded-3xl border border-dark-300/80 bg-dark-100/80 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur-sm md:p-8">
                <h2 className="mb-6 font-heading text-2xl tracking-wide text-white">Datos de envío</h2>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="co-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-light">
                      Nombre completo
                    </label>
                    <input
                      id="co-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="w-full rounded-xl border border-dark-300 bg-dark px-4 py-3.5 text-white placeholder:text-neutral-dark outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                      placeholder="Como figura en el envío"
                    />
                  </div>
                  <div>
                    <label htmlFor="co-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-light">
                      Correo electrónico
                    </label>
                    <input
                      id="co-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      className="w-full rounded-xl border border-dark-300 bg-dark px-4 py-3.5 text-white placeholder:text-neutral-dark outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                      placeholder="para el comprobante y seguimiento"
                    />
                  </div>
                  <div>
                    <label htmlFor="co-country" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-light">
                      País / región
                    </label>
                    <select
                      id="co-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value as CountryCode)}
                      className="w-full rounded-xl border border-dark-300 bg-dark px-4 py-3.5 text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      {COUNTRY_CONFIG.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} — {c.currency}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="co-address" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-light">
                      Dirección de entrega
                    </label>
                    <textarea
                      id="co-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      autoComplete="street-address"
                      className="w-full resize-none rounded-xl border border-dark-300 bg-dark px-4 py-3.5 text-white placeholder:text-neutral-dark outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                      placeholder="Calle, número, distrito, referencias…"
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-5 rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  disabled={!formValid || sessionLoading}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 text-base font-bold text-dark shadow-lg shadow-accent/25 transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sessionLoading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-dark/30 border-t-dark" />
                      Preparando pago…
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Continuar al pago con Stripe
                    </>
                  )}
                </button>
              </div>
            )}

            {phase === 'payment' && clientSecret && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-accent/25 bg-accent/5 px-4 py-3 text-sm text-neutral-light">
                  Completa el pago en el formulario de Stripe. Al terminar volverás a nuestra página de confirmación.
                </div>
                <CheckoutStripeEmbedded clientSecret={clientSecret} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
