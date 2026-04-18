'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Product } from '@/shared/types/commerce'
import { useCountry } from '@/features/country/CountryProvider'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'
import { useCart } from '@/features/cart/CartProvider'
import { getProductStockUrgency } from '@/features/store/stockUrgency'

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const { country } = useCountry()
  const { addItem, replaceCartWith } = useCart()
  const price = getPriceForCountry(product, country)
  const locale = getCountryConfig(country).locale
  const urgency = getProductStockUrgency(product.stock)
  const out = product.stock <= 0
  const ctaAdd = urgency?.ctaUrgent
    ? 'rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-3 py-2 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-red-900/30 ring-1 ring-red-400/40 transition hover:brightness-110'
    : 'rounded-lg bg-accent px-3 py-2 text-sm font-bold text-dark hover:bg-accent-dark'
  const ctaBuy = urgency?.ctaUrgent
    ? 'rounded-lg border-2 border-red-400 bg-red-500/15 px-3 py-2 text-sm font-black uppercase tracking-wide text-red-200 transition hover:bg-red-500/25'
    : 'rounded-lg border border-accent px-3 py-2 text-sm font-bold text-accent hover:bg-accent/10'

  return (
    <article className="card flex h-full flex-col">
      <Link href={`/product/${product.slug}`} className="relative mb-4 block aspect-square overflow-hidden rounded-xl">
        <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover" />
        {urgency ? (
          <span
            className={`absolute left-2 top-2 z-10 max-w-[85%] truncate rounded-md px-2 py-1 text-[10px] uppercase leading-tight sm:left-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-xs ${urgency.pillClass} ${urgency.level === 'critical' && product.stock <= 3 ? 'animate-pulse' : ''}`}
          >
            {urgency.label}
          </span>
        ) : null}
      </Link>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-block rounded-full bg-dark-300 px-2 py-1 text-xs text-neutral-light">
          {product.category}
        </span>
        {product.comboEligible !== false ? (
          <span className="inline-block rounded-full border border-accent/50 bg-dark px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            Disponible para combo
          </span>
        ) : null}
      </div>
      <h3 className="mb-2 text-lg font-bold">{product.name}</h3>
      <p className="mb-4 text-sm text-neutral-light">{product.description}</p>
      <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xl font-bold text-accent">
            {formatCurrency(price.amount, price.currency, locale)}
          </p>
          {price.compareAtAmount && (
            <p className="text-sm text-neutral line-through">
              {formatCurrency(price.compareAtAmount, price.currency, locale)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={out}
            onClick={() => addItem(product.id)}
            className={`${ctaAdd} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {out ? 'Agotado' : urgency?.ctaUrgent ? 'Agregar ya' : 'Agregar'}
          </button>
          <button
            type="button"
            disabled={out}
            onClick={() => {
              replaceCartWith(product.id, 1)
              router.push('/checkout')
            }}
            className={`${ctaBuy} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Comprar ahora
          </button>
        </div>
      </div>
    </article>
  )
}
