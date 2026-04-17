import type { CountryCode, Product } from '@/shared/types/commerce'
import { DEFAULT_COUNTRY } from '@/shared/lib/country'

export function getPriceForCountry(product: Product, country: CountryCode) {
  return (
    product.prices.find((price) => price.country === country) ??
    product.prices.find((price) => price.country === DEFAULT_COUNTRY) ??
    product.prices[0]
  )
}
