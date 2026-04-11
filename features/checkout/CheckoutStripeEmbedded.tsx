'use client'

import { useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'

type Props = {
  clientSecret: string
}

export default function CheckoutStripeEmbedded({ clientSecret }: Props) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null
    return loadStripe(publishableKey)
  }, [publishableKey])

  if (!publishableKey || !stripePromise) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-200">
        Falta la clave publicable de Stripe (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY o STRIPE_PUBLISHABLE_KEY en Vercel).
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-dark-300 bg-white shadow-2xl shadow-black/50 ring-1 ring-white/10">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
