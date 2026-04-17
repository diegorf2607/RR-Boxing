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
      <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        Falta la clave publicable de Stripe (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY o STRIPE_PUBLISHABLE_KEY en Vercel).
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-accent/30 bg-white shadow-lg shadow-black/40">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
