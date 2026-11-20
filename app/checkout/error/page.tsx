// La vuelta de Mercado Pago cuando el pago no se completó (back_url failure de shared/lib/mercadopago.ts):
// /checkout/error?pedido=RR-XXXXXX. El pedido ya quedó registrado sin pagar: se termina por WhatsApp.
import type { Metadata } from 'next'
import Link from 'next/link'
import MainNav from '@/components/MainNav'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

export const metadata: Metadata = {
  title: 'No se completó el pago',
  robots: { index: false, follow: false },
}

const NUMERO = /^RR-[A-Z0-9]{6}$/

export default function CheckoutErrorPage({ searchParams }: { searchParams: { pedido?: string } }) {
  const numero = searchParams.pedido && NUMERO.test(searchParams.pedido) ? searchParams.pedido : null
  const whatsapp = enlaceWhatsapp(
    numero
      ? `Hola, RR Boxing. No pude pagar con Mercado Pago mi pedido ${numero}. ¿Me ayudan a terminarlo?`
      : 'Hola, RR Boxing. Tuve un problema al pagar mi pedido en la web.'
  )

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <div className="px-4 py-10 text-white sm:py-14">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="font-heading text-5xl leading-none text-white sm:text-6xl">No se completó el pago</h1>

          {numero ? (
            <dl className="mt-8 rounded-2xl border border-dark-300 bg-dark-100">
              <div className="flex items-baseline justify-between gap-4 px-5 py-4">
                <dt className="text-sm text-neutral">Número de pedido</dt>
                <dd className="text-right font-mono text-lg font-bold tracking-wide text-accent">{numero}</dd>
              </div>
            </dl>
          ) : null}

          <p className="mt-8 text-base leading-relaxed text-neutral-light">
            {numero ? 'Tu pedido quedó registrado, pero sin pagar. ' : ''}Escríbenos por WhatsApp y lo terminamos contigo. Si el
            cargo aparece como pendiente en tu banco, espera la confirmación antes de volver a pagar.
          </p>

          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 block rounded-lg bg-accent px-6 py-4 text-center text-lg font-bold text-dark transition-colors hover:bg-accent-dark"
          >
            Escribir por WhatsApp
          </a>
          <Link
            href="/"
            className="mt-6 block text-center text-sm text-neutral-light underline underline-offset-2 hover:text-accent"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    </main>
  )
}
