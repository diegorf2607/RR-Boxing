'use client'

import Image from 'next/image'
import Link from 'next/link'
import { HelpCircle, Lock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import CheckoutStripeEmbedded from '@/features/checkout/CheckoutStripeEmbedded'
import CountrySelect from '@/components/CountrySelect'
import type { CheckoutShippingMethod } from '@/shared/lib/cart-checkout'
import type { CurrencyCode, Product } from '@/shared/types/commerce'
import { formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'
import {
  GIFT_CLASS_PRICE_PEN,
  GIFT_GUIDE_PRICE_PEN,
  GIFT_THRESHOLD_PE_PEN,
  isGiftFreePePen,
} from '@/shared/constants/gift-pricing'

type Step = 'form' | 'pay'

const LIMA_DISTRITOS_URGENTE =
  'Miraflores, Surco, San Isidro, San Borja, Barranco, Jesús María, Pueblo Libre, La Molina, Surquillo, Cercado, San Luis, Breña, La Victoria, Rímac, Lince, San Miguel, Magdalena, El Agustino. Distritos fuera de la lista se entrega día hábil siguiente por la tarde.'

const REGIONES_PE = [
  'Lima (Metropolitana)',
  'Arequipa',
  'La Libertad',
  'Piura',
  'Cusco',
  'Junín',
  'Lambayeque',
  'Otra región',
]

function peShippingAmount(method: CheckoutShippingMethod): number {
  if (method === 'standard') return 0
  if (method === 'express') return 9.9
  return 14.9
}

function GiftMegaBanner({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-lg border-2 border-accent bg-dark-100 px-3 py-2.5 text-center shadow-lg shadow-accent/10">
        <p className="text-xs font-black uppercase tracking-wide text-accent sm:text-sm">
          Compra &gt; S/ {GIFT_THRESHOLD_PE_PEN} — regalo (PDF + clase){' '}
          <span className="text-white underline decoration-accent">GRATIS</span>
        </p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border-2 border-accent/80 bg-gradient-to-b from-dark-100 via-dark to-dark-100 px-3 py-5 text-center shadow-xl shadow-accent/15 ring-1 ring-accent/20 md:px-5 md:py-7">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent sm:text-xs">Ojo acá</p>
      <p className="mt-1 font-heading text-2xl font-black uppercase leading-[0.95] text-white sm:text-4xl md:text-5xl">
        Tu compra supera los S/ {GIFT_THRESHOLD_PE_PEN}
      </p>
      <p className="mt-3 font-heading text-3xl font-black uppercase leading-none text-accent sm:text-5xl md:text-6xl">
        El regalo va <span className="underline decoration-white decoration-4 underline-offset-4">100% gratis</span>
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm font-bold text-neutral-light sm:text-base">
        Guía PDF + clase virtual grabada: <span className="whitespace-nowrap text-accent">S/ 0.00</span> en este pedido.
        Diferencial RRBOXING sin un sol extra.
      </p>
    </div>
  )
}

function GiftBlock({
  compact,
  giftFree,
  appliesGift,
  giftPackOptIn,
}: {
  compact?: boolean
  giftFree: boolean
  appliesGift: boolean
  /** Perú PEN, subtotal sin umbral gratis: si el usuario marcó sumar el pack (solo lectura en paso “pago”). */
  giftPackOptIn?: boolean
}) {
  if (!appliesGift) {
    return (
      <div
        className={`rounded-xl border border-dark-300 bg-dark-100/90 p-4 text-neutral-light shadow-inner ${
          compact ? 'text-sm' : ''
        }`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-accent">Bienvenida RRBOXING</p>
        <p className={`mt-1 font-semibold text-white ${compact ? 'text-sm' : ''}`}>
          Tras pagar, en la confirmación accedés a la guía y material de apoyo según tu región.
        </p>
      </div>
    )
  }

  if (giftFree) {
    return (
      <div
        className={`rounded-xl border-2 border-accent/60 bg-gradient-to-br from-dark-100 to-dark p-4 shadow-lg shadow-accent/10 ${
          compact ? 'text-sm' : ''
        }`}
      >
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-accent">REGALO — sin cargo</p>
        <p className={`font-bold leading-snug text-white ${compact ? 'text-base' : 'text-lg'}`}>
          Guía PDF + clase virtual grabada: incluidas porque superaste S/ {GIFT_THRESHOLD_PE_PEN} en productos.
        </p>
        <p className={`mt-2 text-neutral-light ${compact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
          Mismo criterio técnico de la academia. Lo desbloqueás al confirmar el pago.
        </p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="rounded-xl border border-dark-300 bg-dark-100/90 p-3 text-xs text-neutral-light shadow-inner">
        {giftPackOptIn ? (
          <p>
            <span className="font-bold text-accent">Pack bienvenida</span> (PDF + clase grabada) incluido en este
            pago.
          </p>
        ) : (
          <p>Pedido sin pack digital opcional (guía + clase grabada).</p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border-2 border-accent/40 bg-dark-100 p-4 shadow-lg shadow-black/40">
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-accent">PACK DE BIENVENIDA — OPCIONAL</p>
      <p className="font-bold leading-snug text-white md:text-lg">
        Si tu compra es menor a S/ {GIFT_THRESHOLD_PE_PEN} en productos, podés sumar la guía en PDF y la clase grabada
        marcando la opción en el resumen (dos ítems en Stripe).
      </p>
      <div className="mt-3 space-y-1.5 rounded-lg border border-dark-300 bg-dark/80 px-3 py-2 text-sm font-semibold text-white">
        <div className="flex justify-between gap-2">
          <span className="text-neutral-light">Guía PDF — fundamentos</span>
          <span className="shrink-0 text-accent">{formatCurrency(GIFT_GUIDE_PRICE_PEN, 'PEN', 'es-PE')}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-neutral-light">Clase virtual grabada</span>
          <span className="shrink-0 text-accent">{formatCurrency(GIFT_CLASS_PRICE_PEN, 'PEN', 'es-PE')}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-neutral-light leading-relaxed">
        Si superás S/ {GIFT_THRESHOLD_PE_PEN} en productos, el mismo pack se incluye <strong className="text-accent">sin cargo</strong> automáticamente.
      </p>
    </div>
  )
}

export default function CheckoutClient() {
  const { items } = useCart()
  const { country, setCountry } = useCountry()
  const [products, setProducts] = useState<Product[]>([])

  const [email, setEmail] = useState('')
  const [newsletter, setNewsletter] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [apartment, setApartment] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('Lima (Metropolitana)')
  const [postal, setPostal] = useState('')
  const [phone, setPhone] = useState('')
  const [saveInfo, setSaveInfo] = useState(false)
  const [shippingMethod, setShippingMethod] = useState<CheckoutShippingMethod>('standard')
  const [discountCode, setDiscountCode] = useState('')
  const [discountMsg, setDiscountMsg] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  /** Perú PEN y subtotal bajo S/ 100: el cliente elige si paga el pack PDF + clase grabada. */
  const [includeGiftPack, setIncludeGiftPack] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
  }, [])

  const rows = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) return null
        const price = getPriceForCountry(product, country)
        return { ...item, product, price, lineTotal: price.amount * item.quantity }
      })
      .filter(Boolean) as Array<{
      productId: string
      quantity: number
      product: Product
      price: { amount: number; currency: string }
      lineTotal: number
    }>
  }, [items, products, country])

  const config = getCountryConfig(country)
  const subtotal = rows.reduce((acc, row) => acc + row.lineTotal, 0)
  const currency = (rows[0]?.price.currency ?? 'PEN') as CurrencyCode
  const appliesGift = country === 'PE' && currency === 'PEN'
  const giftFree = appliesGift && isGiftFreePePen(subtotal)
  const giftCharge =
    appliesGift && !giftFree && includeGiftPack ? GIFT_GUIDE_PRICE_PEN + GIFT_CLASS_PRICE_PEN : 0

  useEffect(() => {
    if (!appliesGift || giftFree) setIncludeGiftPack(false)
  }, [appliesGift, giftFree])

  const shippingAmount = useMemo(() => {
    if (country === 'PE' && rows[0]?.price.currency === 'PEN') return peShippingAmount(shippingMethod)
    return config.shippingFlatAmount
  }, [country, shippingMethod, config, rows])

  const total = subtotal + shippingAmount + giftCharge

  const fullName = `${firstName} ${lastName}`.trim()
  const fullAddress = useMemo(() => {
    const parts = [
      addressLine,
      apartment ? `Casa, dpto.: ${apartment}` : null,
      city,
      region,
      postal ? `Código postal: ${postal}` : null,
      phone ? `Teléfono: ${phone}` : null,
    ].filter(Boolean)
    return parts.join('\n')
  }, [addressLine, apartment, city, region, postal, phone])

  const disabled = useMemo(() => {
    if (items.length === 0 || rows.length === 0) return true
    if (!email || fullName.length < 3 || !addressLine.trim() || !city.trim() || !phone.trim()) return true
    return false
  }, [items.length, rows.length, email, fullName, addressLine, city, phone])

  const startEmbeddedCheckout = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout/embedded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: fullName,
          address: fullAddress,
          country,
          shippingMethod,
          phone,
          includeGiftPack,
          items,
        }),
      })
      const data = (await res.json()) as { clientSecret?: string; error?: string }
      if (!res.ok) {
        setError(
          typeof data.error === 'string'
            ? data.error
            : 'No se pudo iniciar el pago. Revisa Stripe y variables de entorno.'
        )
        return
      }
      if (!data.clientSecret) {
        setError('No se recibió la sesión de pago. Intenta de nuevo.')
        return
      }
      setClientSecret(data.clientSecret)
      setStep('pay')
    } catch {
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const backToForm = () => {
    setStep('form')
    setClientSecret(null)
    setError('')
  }

  const applyDiscount = () => {
    if (!discountCode.trim()) return
    setDiscountMsg('Los cupones estarán disponibles muy pronto.')
  }

  const labelClass = 'mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-light'
  const inputClass =
    'w-full rounded-lg border border-dark-300 bg-dark px-3 py-2.5 text-sm text-white placeholder:text-neutral focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50'

  if (step === 'pay' && clientSecret) {
    return (
      <div className="bg-dark px-4 py-8 md:py-10">
        <div className="mx-auto max-w-2xl">
          <p className="mb-1 font-heading text-xs tracking-widest text-accent">RRBOXING</p>
          <button
            type="button"
            onClick={backToForm}
            className="mb-4 text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            ← Volver a contacto y entrega
          </button>
          <h1 className="font-heading text-3xl font-bold tracking-wide text-white">Pago</h1>
          <p className="mt-1 text-sm text-neutral-light">Todas las transacciones son seguras y están encriptadas.</p>

          <div className="mt-6 space-y-6">
            {appliesGift && giftFree ? <GiftMegaBanner compact /> : null}
            <GiftBlock
              compact
              giftFree={giftFree}
              appliesGift={appliesGift}
              giftPackOptIn={includeGiftPack}
            />
            <div className="rounded-xl border-2 border-accent/70 bg-dark-100 p-1 shadow-xl shadow-black/50">
              <CheckoutStripeEmbedded clientSecret={clientSecret} />
            </div>
          </div>

          <nav className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-center text-sm text-accent">
            <Link href="/reembolso" className="hover:text-white hover:underline">
              Política de reembolso
            </Link>
            <Link href="/garantia" className="hover:text-white hover:underline">
              Envío
            </Link>
            <Link href="/privacidad" className="hover:text-white hover:underline">
              Política de privacidad
            </Link>
            <Link href="/terminos" className="hover:text-white hover:underline">
              Términos del servicio
            </Link>
            <Link href="/consulta" className="hover:text-white hover:underline">
              Contacto
            </Link>
          </nav>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark px-4 py-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="sr-only">Checkout RRBOXING</h1>
        <div className="mb-8 border-b border-dark-300 pb-6">
          <p className="font-heading text-xs tracking-[0.35em] text-accent">RRBOXING</p>
          <h2 className="mt-1 font-heading text-3xl font-bold tracking-wide text-white md:text-4xl">Checkout</h2>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-accent">
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
            Pago seguro procesado por Stripe
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-8">
          {/* Columna izquierda: contacto + entrega + envío */}
          <div className="space-y-8 rounded-2xl border border-dark-300 bg-dark-100 p-6 shadow-xl md:p-8">
            {/* Contacto */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Contacto</h2>
                <Link href="/login" className="text-sm text-accent hover:underline">
                  Iniciar sesión
                </Link>
              </div>
              <label htmlFor="co-email" className={labelClass}>
                Correo electrónico
              </label>
              <input
                id="co-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
              />
              <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-neutral-light">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-dark-300 bg-dark text-accent focus:ring-accent"
                />
                <span>Enviarme novedades y ofertas por correo electrónico</span>
              </label>
            </section>

            {/* Entrega */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">Entrega</h2>
              <label htmlFor="co-country" className={labelClass}>
                País / Región
              </label>
              <CountrySelect
                id="co-country"
                value={country}
                onChange={setCountry}
                className={`${inputClass} mb-4 text-white`}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="co-fn" className={labelClass}>
                    Nombre
                  </label>
                  <input id="co-fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} autoComplete="given-name" />
                </div>
                <div>
                  <label htmlFor="co-ln" className={labelClass}>
                    Apellidos
                  </label>
                  <input id="co-ln" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} autoComplete="family-name" />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="co-addr" className={labelClass}>
                  Dirección
                </label>
                <input id="co-addr" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className={inputClass} autoComplete="street-address" />
              </div>
              <div className="mt-4">
                <label htmlFor="co-apt" className={labelClass}>
                  Casa, apartamento, etc. (opcional)
                </label>
                <input id="co-apt" value={apartment} onChange={(e) => setApartment(e.target.value)} className={inputClass} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="co-city" className={labelClass}>
                    Ciudad
                  </label>
                  <input id="co-city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="co-region" className={labelClass}>
                    Región
                  </label>
                  <select id="co-region" value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass}>
                    {REGIONES_PE.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="co-postal" className={labelClass}>
                    Código postal (opcional)
                  </label>
                  <input id="co-postal" value={postal} onChange={(e) => setPostal(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="co-phone" className={`${labelClass} inline-flex items-center gap-1`}>
                  Teléfono
                  <span title="Solo te contactamos si hay un inconveniente con tu envío." className="inline-flex cursor-help">
                    <HelpCircle className="h-3.5 w-3.5 text-neutral" aria-hidden />
                  </span>
                </label>
                <input id="co-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} autoComplete="tel" />
              </div>
              <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-neutral-light">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-dark-300 bg-dark text-accent focus:ring-accent"
                />
                <span>Guardar mi información y consultar más rápidamente la próxima vez</span>
              </label>
            </section>

            {/* Métodos de envío */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">Métodos de envío</h2>
              <div className="divide-y divide-dark-300 rounded-xl border border-dark-300 bg-dark/80">
                <label className="flex cursor-pointer items-center justify-between gap-3 p-4 transition-colors hover:bg-dark-200/50">
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="ship"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="h-4 w-4 text-accent focus:ring-accent"
                    />
                    <span className="text-sm font-medium text-white">Standard 2+3 días hábiles</span>
                  </span>
                  <span className="text-sm font-semibold text-accent">GRATIS</span>
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-3 p-4 transition-colors hover:bg-dark-200/50">
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="ship"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="h-4 w-4 text-accent focus:ring-accent"
                    />
                    <span className="text-sm font-medium text-white">Express 24/48 horas</span>
                  </span>
                  <span className="text-sm font-semibold text-accent">S/ 9.90</span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-dark-200/50">
                  <input
                    type="radio"
                    name="ship"
                    checked={shippingMethod === 'urgent'}
                    onChange={() => setShippingMethod('urgent')}
                    className="mt-1 h-4 w-4 shrink-0 text-accent focus:ring-accent"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        Envío URGENTE 🔥 (Solo lima metropolitana)- Entrega el mismo día para compras realizadas entre-Lun
                        a Sab de 9am - 1pm.
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-neutral">{LIMA_DISTRITOS_URGENTE}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-accent sm:pt-0.5">S/ 14.90</span>
                  </div>
                </label>
              </div>
            </section>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="button"
              onClick={startEmbeddedCheckout}
              disabled={disabled || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-sm font-bold text-dark shadow-lg shadow-accent/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Lock className="h-4 w-4" aria-hidden />
              {loading ? 'Procesando…' : 'Continuar al pago'}
            </button>
          </div>

          {/* Columna derecha: resumen + regalo + cupón + totales */}
          <div className="h-fit space-y-6 rounded-2xl border border-dark-300 bg-dark-100 p-6 shadow-xl md:p-8">
            {rows.length === 0 ? (
              <p className="text-sm text-neutral-light">Tu carrito está vacío.</p>
            ) : (
              <>
                <ul className="space-y-5">
                  {rows.map((row) => {
                    const img = row.product.imageUrls[0]
                    return (
                      <li key={row.productId} className="flex gap-4">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-accent/40 bg-dark shadow-lg ring-1 ring-white/5">
                          {img ? (
                            <Image src={img} alt={row.product.name} fill className="object-cover" sizes="96px" />
                          ) : null}
                          <span className="absolute -right-1 -top-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-dark shadow-md">
                            {row.quantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                          <p className="text-sm font-semibold leading-snug text-white md:text-base">{row.product.name}</p>
                        </div>
                        <p className="shrink-0 pt-1 text-sm font-bold text-accent md:text-base">
                          {formatCurrency(row.lineTotal, row.price.currency as CurrencyCode, config.locale)}
                        </p>
                      </li>
                    )
                  })}
                </ul>

                {appliesGift && giftFree ? <GiftMegaBanner /> : null}
                <GiftBlock giftFree={giftFree} appliesGift={appliesGift} />

                {appliesGift && !giftFree ? (
                  <label className="flex cursor-pointer gap-3 rounded-xl border border-dark-300 bg-dark/50 p-4 transition hover:border-accent/45">
                    <input
                      type="checkbox"
                      checked={includeGiftPack}
                      onChange={(e) => setIncludeGiftPack(e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-dark-300 bg-dark text-accent focus:ring-2 focus:ring-accent/50"
                    />
                    <span className="text-sm leading-relaxed text-neutral-light">
                      <span className="font-bold text-white">Sumar pack de bienvenida</span> (opcional): guía PDF —
                      fundamentos ({formatCurrency(GIFT_GUIDE_PRICE_PEN, 'PEN', config.locale)}) + clase virtual grabada (
                      {formatCurrency(GIFT_CLASS_PRICE_PEN, 'PEN', config.locale)}).
                    </span>
                  </label>
                ) : null}

                <div>
                  <div className="flex gap-2">
                    <input
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Código de descuento"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={applyDiscount}
                      className="shrink-0 rounded-lg border border-accent/50 bg-dark px-4 py-2 text-sm font-semibold text-accent transition hover:bg-dark-200"
                    >
                      Aplicar
                    </button>
                  </div>
                  {discountMsg ? <p className="mt-2 text-xs text-neutral-light">{discountMsg}</p> : null}
                </div>

                <div className="space-y-2 border-t border-dark-300 pt-4 text-sm">
                  <div className="flex justify-between text-neutral-light">
                    <span>Subtotal</span>
                    <span className="font-medium text-white">{formatCurrency(subtotal, currency, config.locale)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-light">
                    <span className="inline-flex items-center gap-1">
                      Envío
                      <HelpCircle className="h-3.5 w-3.5 text-neutral" title="Según el método elegido a la izquierda." aria-hidden />
                    </span>
                    <span className="font-medium text-white">
                      {shippingAmount === 0 ? (
                        <span className="text-accent">GRATIS</span>
                      ) : (
                        formatCurrency(shippingAmount, currency, config.locale)
                      )}
                    </span>
                  </div>
                  {appliesGift && giftFree ? (
                    <div className="flex justify-between rounded-lg border border-accent/30 bg-dark/60 px-2 py-2 text-sm font-bold text-accent">
                      <span className="text-white">Pack bienvenida (PDF + clase grabada)</span>
                      <span>GRATIS</span>
                    </div>
                  ) : null}
                  {appliesGift && !giftFree && includeGiftPack ? (
                    <>
                      <div className="flex justify-between text-neutral-light">
                        <span className="pr-2">Guía PDF — fundamentos de boxeo</span>
                        <span className="shrink-0 font-semibold text-accent">
                          {formatCurrency(GIFT_GUIDE_PRICE_PEN, 'PEN', config.locale)}
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-light">
                        <span className="pr-2">Clase virtual grabada — primeros pasos</span>
                        <span className="shrink-0 font-semibold text-accent">
                          {formatCurrency(GIFT_CLASS_PRICE_PEN, 'PEN', config.locale)}
                        </span>
                      </div>
                    </>
                  ) : null}
                  <div className="flex items-baseline justify-between border-t border-dark-300 pt-4">
                    <span className="font-heading text-xl font-bold text-white">Total</span>
                    <p className="font-heading text-2xl font-bold tabular-nums text-accent md:text-3xl">
                      {formatCurrency(total, currency, config.locale)}
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-neutral">
                  Al completar el pago asegurás stock y accedés al material indicado en la confirmación.
                  {appliesGift && !giftFree ? (
                    <>
                      {' '}
                      Con subtotal mayor a S/ {GIFT_THRESHOLD_PE_PEN} en productos, el pack PDF + clase grabada va{' '}
                      <strong className="text-accent">GRATIS</strong> sin marcar nada.
                    </>
                  ) : null}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
