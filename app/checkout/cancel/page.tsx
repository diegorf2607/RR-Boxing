import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="card max-w-lg text-center">
        <h1 className="mb-3 text-3xl font-bold">Pago cancelado</h1>
        <p className="text-neutral-light">Tu pedido no se completo. Puedes intentarlo de nuevo cuando quieras.</p>
        <Link href="/cart" className="mt-6 inline-block rounded-lg border border-accent px-4 py-2 font-semibold text-accent">
          Volver al carrito
        </Link>
      </div>
    </main>
  )
}
