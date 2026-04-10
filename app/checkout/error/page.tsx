import Link from 'next/link'
import MainNav from '@/components/MainNav'

export default function CheckoutErrorPage() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="card max-w-lg text-center">
          <h1 className="mb-3 text-2xl font-bold text-red-400">Error en el pago</h1>
          <p className="text-neutral-light">
            No pudimos completar el proceso. Vuelve al carrito o al checkout e inténtalo de nuevo. Si el cargo aparece
            como pendiente en tu banco, espera la confirmación o contacta a tu entidad.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/checkout" className="rounded-lg bg-accent px-4 py-2 font-semibold text-dark">
              Reintentar checkout
            </Link>
            <Link href="/cart" className="rounded-lg border border-accent px-4 py-2 font-semibold text-accent">
              Ver carrito
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
