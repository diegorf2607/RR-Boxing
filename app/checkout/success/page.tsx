import type { Metadata } from 'next'
import Link from 'next/link'
import ClearCartOnSuccess from '@/features/checkout/ClearCartOnSuccess'
import { getStripeClient } from '@/shared/lib/stripe'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Gracias por tu pedido',
  robots: { index: false, follow: false },
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id
  let paid = false

  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripeClient()
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      paid = session.payment_status === 'paid'
    } catch (e) {
      console.error('[checkout/success] No se pudo leer la sesión de pago', e)
      paid = false
    }
  }

  const whatsapp = enlaceWhatsapp('Hola, RR Boxing. Acabo de hacer un pedido en la web y quiero coordinar el envío.')

  return (
    <main className="min-h-screen bg-dark px-4 py-10 text-white sm:py-16">
      <ClearCartOnSuccess sessionId={sessionId} />
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-heading text-5xl leading-none text-white sm:text-6xl">Gracias por tu pedido</h1>

        {sessionId && process.env.STRIPE_SECRET_KEY ? (
          <dl className="mt-8 rounded-2xl border border-dark-300 bg-dark-100">
            <div className="flex items-baseline justify-between gap-4 px-5 py-4">
              <dt className="text-sm text-neutral">Pago</dt>
              <dd className="text-right text-base font-medium">{paid ? 'Confirmado' : 'Por confirmar'}</dd>
            </div>
          </dl>
        ) : null}

        <p className="mt-8 text-base leading-relaxed text-neutral-light">
          Escríbenos por WhatsApp para coordinar el envío o si tienes alguna duda sobre tu pedido.
        </p>

        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block rounded-lg bg-accent px-6 py-3.5 text-center font-bold text-dark transition-colors hover:bg-accent-dark"
        >
          Escribir por WhatsApp
        </a>
        <Link href="/" className="mt-4 block text-center text-sm text-neutral-light underline-offset-4 hover:text-accent hover:underline">
          Volver a la tienda
        </Link>
      </div>
    </main>
  )
}
