'use client'

import type { Product } from '@/shared/types/commerce'
import { useCountry } from '@/features/country/CountryProvider'
import { formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'

/**
 * Precio del producto en la moneda del país elegido en la tienda.
 * - `lg`: ficha de producto, grande y con «Precio final» debajo.
 * - `sm`: listas cortas (productos relacionados).
 */
export default function ProductPrice({ product, size = 'lg' }: { product: Product; size?: 'lg' | 'sm' }) {
  const { country } = useCountry()
  const price = getPriceForCountry(product, country)
  const text = formatCurrency(price.amount, price.currency, getCountryConfig(country).locale)

  if (size === 'sm') {
    return <p className="text-sm font-semibold text-accent">{text}</p>
  }

  return (
    <div className="mt-2">
      <p className="text-4xl font-bold leading-tight text-accent md:text-5xl">{text}</p>
      <p className="mt-1 text-sm text-neutral">Precio final</p>
    </div>
  )
}
