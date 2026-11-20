'use client'

import type { Product } from '@/shared/types/commerce'
import { useCountry } from '@/features/country/CountryProvider'
import { formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'

/**
 * Precio del producto en la moneda del país elegido en la tienda, en blanco y con cifras de ancho fijo (.precio), como
 * en la maqueta de la línea A: el amarillo queda para los botones y lo que se ahorra.
 * - `lg`: ficha de producto, de 34 px, con «Precio final» al lado (y el estado del stock, si se pasa en `detalle`).
 * - `sm`: tarjetas de otros productos (17 px en el celular, 21 px desde 900 px).
 */
export default function ProductPrice({
  product,
  size = 'lg',
  detalle,
}: {
  product: Product
  size?: 'lg' | 'sm'
  /** Lo que va después de «Precio final»: «Disponible», «Quedan 3 unidades»… */
  detalle?: string
}) {
  const { country } = useCountry()
  const price = getPriceForCountry(product, country)
  const text = formatCurrency(price.amount, price.currency, getCountryConfig(country).locale)

  if (size === 'sm') {
    return <p className="precio text-[17px] min-[900px]:text-[21px]">{text}</p>
  }

  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="precio text-[34px] leading-tight">{text}</span>
      <span className="text-sm text-neutral">
        Precio final
        {detalle ? ` · ${detalle}` : ''}
      </span>
    </p>
  )
}
