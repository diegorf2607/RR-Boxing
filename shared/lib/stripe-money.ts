/**
 * Stripe `unit_amount` en la menor unidad de la moneda.
 * Ver: https://docs.stripe.com/currencies#zero-decimal
 */
const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
])

export function toStripeUnitAmount(amount: number, currency: string): number {
  const code = currency.toLowerCase()
  if (ZERO_DECIMAL_CURRENCIES.has(code)) {
    return Math.round(amount)
  }
  return Math.round(amount * 100)
}
