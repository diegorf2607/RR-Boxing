import Link from 'next/link'
import ClearCartOnSuccess from '@/features/checkout/ClearCartOnSuccess'
import { getStripeClient } from '@/shared/lib/stripe'

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
    } catch {
      paid = false
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-dark px-4">
      <ClearCartOnSuccess sessionId={sessionId} />
      <div className="card max-w-lg text-center">
        <h1 className="mb-3 text-3xl font-bold text-accent">Gracias por tu compra</h1>
        {sessionId && process.env.STRIPE_SECRET_KEY && (
          <p className="mb-2 text-sm text-neutral-light">
            Estado del pago: {paid ? 'confirmado' : 'pendiente de verificación'}
          </p>
        )}
        <p className="text-neutral-light">
          RRBOXING procesa tu pedido con el mismo estándar que aplicamos al entrenamiento: disciplina y claridad.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-dark">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </main>
  )
}
