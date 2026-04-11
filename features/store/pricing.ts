import type { CountryCode, Product } from '@/shared/types/commerce'
import { DEFAULT_COUNTRY, getCountryConfig } from '@/shared/lib/country'

export function getPriceForCountry(product: Product, country: CountryCode) {
  const config = getCountryConfig(country)

  const byCountry = product.prices.find((price) => price.country === country)
  if (byCountry) return byCountry

  const byCurrency = product.prices.find((price) => price.currency === config.currency)
  if (byCurrency) return byCurrency

  return (
    product.prices.find((price) => price.country === DEFAULT_COUNTRY) ?? product.prices[0]
  )
}
