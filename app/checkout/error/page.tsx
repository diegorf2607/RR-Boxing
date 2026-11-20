// La vuelta de Mercado Pago cuando el pago no se completó (back_url failure de shared/lib/mercadopago.ts):
// /checkout/error?pedido=RR-XXXXXX. El pedido ya quedó registrado sin pagar: se termina por WhatsApp.
import type { Metadata } from 'next'
import Link from 'next/link'
import MainNav from '@/components/MainNav'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
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
      <div className="wrap pb-16 pt-8 text-white min-[900px]:pb-20 min-[900px]:pt-12">
        <div className="mx-auto w-full max-w-xl">
          <h1 className="page-title">No se completó el pago</h1>

          {numero ? (
            <dl className="filas mt-8">
              <div>
                <dt>Número de pedido</dt>
                <dd className="text-lg font-bold tracking-[0.04em] text-accent">{numero}</dd>
              </div>
            </dl>
          ) : null}

          <p className="mt-8 text-neutral-light">
            {numero ? 'Tu pedido quedó registrado, pero sin pagar. ' : ''}Escríbenos por WhatsApp y lo terminamos contigo. Si el
            cargo aparece como pendiente en tu banco, espera la confirmación antes de volver a pagar.
          </p>

          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-xl mt-5"
          >
            <IconoWhatsapp />
            Escribir por WhatsApp
          </a>
          <Link
            href="/"
            className="mt-6 flex min-h-[44px] items-center justify-center text-sm font-medium text-neutral-light underline decoration-1 underline-offset-4 hover:text-white"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    </main>
  )
}
