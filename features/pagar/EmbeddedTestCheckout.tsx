'use client'

import { useEffect, useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'

export default function EmbeddedTestCheckout() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null
    return loadStripe(publishableKey)
  }, [publishableKey])

  useEffect(() => {
    if (!publishableKey) {
      setError(
        'Falta la clave publicable. En Vercel define NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (o STRIPE_PUBLISHABLE_KEY; next.config la expone al cliente).'
      )
      return
    }

    let cancelled = false
    fetch('/api/checkout/embedded', { method: 'POST' })
      .then(async (res) => {
        const data = (await res.json()) as { clientSecret?: string; error?: string }
        if (!res.ok) throw new Error(data.error ?? 'No se pudo crear la sesión de pago')
        if (!data.clientSecret) throw new Error('Respuesta inválida del servidor')
        if (!cancelled) setClientSecret(data.clientSecret)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error de red')
      })

    return () => {
      cancelled = true
    }
  }, [publishableKey])

  if (error) {
    return <p className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">{error}</p>
  }

  if (!stripePromise || !clientSecret) {
    return (
      <div className="rounded-lg border border-dark-300 bg-dark-100 px-4 py-8 text-center text-sm text-neutral-light">
        Cargando checkout seguro de Stripe…
      </div>
    )
  }

  return (
    <div className="min-h-[480px] rounded-xl border border-dark-300 bg-dark-100 p-2 md:p-4">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
