import Link from 'next/link'
import MainNav from '@/components/MainNav'
import { PAGO_EN_LINEA_ACTIVO } from '@/shared/config/pagos'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

export default function CheckoutErrorPage() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="card max-w-lg text-center">
          <h1 className="mb-3 text-2xl font-bold text-red-400">Error en el pago</h1>
          <p className="text-neutral-light">
            No pudimos completar el pago. Escríbenos por WhatsApp y te ayudamos a terminar tu pedido. Si el cargo
            aparece como pendiente en tu banco, espera la confirmación o contacta a tu entidad.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={enlaceWhatsapp('Hola, RR Boxing. Tuve un problema al pagar mi pedido en la web.')}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-accent px-4 py-2 font-semibold text-dark"
            >
              Escribir por WhatsApp
            </a>
            {PAGO_EN_LINEA_ACTIVO ? (
              <Link href="/checkout" className="rounded-lg border border-accent px-4 py-2 font-semibold text-accent">
                Reintentar el pago
              </Link>
            ) : null}
            <Link href="/cart" className="rounded-lg border border-accent px-4 py-2 font-semibold text-accent">
              Ver carrito
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
