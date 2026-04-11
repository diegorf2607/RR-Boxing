import type { CountryCode, CurrencyCode } from '@/shared/types/commerce'

export interface CountryConfig {
  code: CountryCode
  name: string
  currency: CurrencyCode
  locale: string
  /** Monto fijo de envío en la moneda del país (o USD si aplica). */
  shippingFlatAmount: number
}

/**
 * Sudamérica (sin Brasil) con su moneda; México; Centroamérica agrupada en USD;
 * Estados Unidos. Brasil no incluido.
 */
export const COUNTRY_CONFIG: CountryConfig[] = [
  { code: 'AR', name: 'Argentina', currency: 'ARS', locale: 'es-AR', shippingFlatAmount: 8500 },
  { code: 'BO', name: 'Bolivia', currency: 'BOB', locale: 'es-BO', shippingFlatAmount: 45 },
  { code: 'CL', name: 'Chile', currency: 'CLP', locale: 'es-CL', shippingFlatAmount: 6500 },
  { code: 'CO', name: 'Colombia', currency: 'COP', locale: 'es-CO', shippingFlatAmount: 25000 },
  { code: 'EC', name: 'Ecuador', currency: 'USD', locale: 'es-EC', shippingFlatAmount: 8 },
  { code: 'GY', name: 'Guyana', currency: 'GYD', locale: 'en-GY', shippingFlatAmount: 2500 },
  { code: 'PY', name: 'Paraguay', currency: 'PYG', locale: 'es-PY', shippingFlatAmount: 55000 },
  { code: 'PE', name: 'Perú', currency: 'PEN', locale: 'es-PE', shippingFlatAmount: 15 },
  { code: 'SR', name: 'Surinam', currency: 'SRD', locale: 'nl-SR', shippingFlatAmount: 90 },
  { code: 'UY', name: 'Uruguay', currency: 'UYU', locale: 'es-UY', shippingFlatAmount: 320 },
  /** USD en checkout: Stripe no cobra de forma estable en bolívares (VES). */
  { code: 'VE', name: 'Venezuela', currency: 'USD', locale: 'es-VE', shippingFlatAmount: 10 },
  { code: 'MX', name: 'México', currency: 'MXN', locale: 'es-MX', shippingFlatAmount: 120 },
  {
    code: 'CAM',
    name: 'Centroamérica (USD)',
    currency: 'USD',
    locale: 'es-GT',
    shippingFlatAmount: 12,
  },
  { code: 'US', name: 'Estados Unidos', currency: 'USD', locale: 'en-US', shippingFlatAmount: 10 },
]

export const DEFAULT_COUNTRY: CountryCode = 'PE'

export function getCountryConfig(country: CountryCode): CountryConfig {
  return COUNTRY_CONFIG.find((item) => item.code === country) ?? COUNTRY_CONFIG[0]
}

export function isValidCountryCode(value: string): value is CountryCode {
  return COUNTRY_CONFIG.some((item) => item.code === value)
}

/** Monedas que conviene mostrar sin decimales en UI (aprox.). */
const CURRENCY_INTEGER_DISPLAY = new Set<CurrencyCode>(['CLP', 'PYG', 'COP', 'ARS'])

export function formatCurrency(amount: number, currency: CurrencyCode, locale = 'es-PE') {
  const maxFractionDigits = CURRENCY_INTEGER_DISPLAY.has(currency) ? 0 : 2
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  }).format(amount)
}
