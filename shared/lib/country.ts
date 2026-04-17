import type { CountryCode, CurrencyCode } from '@/shared/types/commerce'

export interface CountryConfig {
  code: CountryCode
  name: string
  currency: CurrencyCode
  locale: string
  shippingFlatAmount: number
}

export const COUNTRY_CONFIG: CountryConfig[] = [
  { code: 'PE', name: 'Perú', currency: 'PEN', locale: 'es-PE', shippingFlatAmount: 15 },
  { code: 'MX', name: 'Mexico', currency: 'MXN', locale: 'es-MX', shippingFlatAmount: 120 },
  { code: 'CO', name: 'Colombia', currency: 'COP', locale: 'es-CO', shippingFlatAmount: 25000 },
  { code: 'CL', name: 'Chile', currency: 'CLP', locale: 'es-CL', shippingFlatAmount: 6500 },
  { code: 'US', name: 'United States', currency: 'USD', locale: 'en-US', shippingFlatAmount: 10 },
]

export const DEFAULT_COUNTRY: CountryCode = 'PE'

export function getCountryConfig(country: CountryCode): CountryConfig {
  return COUNTRY_CONFIG.find((item) => item.code === country) ?? COUNTRY_CONFIG[0]
}

export function formatCurrency(amount: number, currency: CurrencyCode, locale = 'es-PE') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}
