import Link from 'next/link'
import EmbeddedTestCheckout from '@/features/pagar/EmbeddedTestCheckout'

export const metadata = {
  title: 'Pago de prueba',
}

export default function PagarPage() {
  return (
    <main className="min-h-screen bg-dark text-white">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="mb-6 inline-block text-sm text-accent hover:underline">
          ← Volver al inicio
        </Link>
        <h1 className="mb-2 font-heading text-3xl font-bold tracking-wide">Pago de prueba (Stripe)</h1>
        <p className="mb-2 text-sm text-neutral-light">
          Checkout embebido en tu web. Usa el modo <strong className="text-white">prueba</strong> de Stripe (tarjetas de
          test).
        </p>
        <p className="mb-8 text-sm text-neutral-400">
          Producto de ejemplo: <span className="text-white">Plan Básico</span> — USD 10.00 (1000 centavos)
        </p>
        <EmbeddedTestCheckout />
      </div>
    </main>
  )
}
