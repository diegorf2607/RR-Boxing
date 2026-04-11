/**
 * Cliente Stripe en servidor (singleton).
 * La implementación vive en `shared/lib/stripe.ts`; este archivo la reexporta
 * para rutas que prefieren importar desde `@/lib/stripe`.
 */
export { getStripeClient } from '@/shared/lib/stripe'
