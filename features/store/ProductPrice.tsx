'use client'

import type { Product } from '@/shared/types/commerce'
import { useCountry } from '@/features/country/CountryProvider'
import { formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'

/**
 * Precio del producto en la moneda del país elegido en la tienda, en Barlow Condensed (.num).
 * - `lg`: ficha de producto, grande y con «Precio final.» debajo (más la `aclaracion`, si la hay).
 * - `sm`: tarjetas cortas («Completa tu equipo»).
 */
export default function ProductPrice({
  product,
  size = 'lg',
  aclaracion,
}: {
  product: Product
  size?: 'lg' | 'sm'
  /** Lo que sigue a «Precio final.», por ejemplo el 10% del combo */
  aclaracion?: string
}) {
  const { country } = useCountry()
  const price = getPriceForCountry(product, country)
  const text = formatCurrency(price.amount, price.currency, getCountryConfig(country).locale)

  if (size === 'sm') {
    return <span className="num block whitespace-nowrap text-[26px] leading-none md:text-[30px]">{text}</span>
  }

  return (
    <div className="mt-[18px]">
      <p className="num text-[44px] leading-none md:text-[52px]">{text}</p>
      <p className="mt-1 text-[15px] text-suave">Precio final.{aclaracion ? ` ${aclaracion}` : ''}</p>
    </div>
  )
}
