// La vuelta de Mercado Pago cuando el pago no se completó (back_url failure de shared/lib/mercadopago.ts):
// /checkout/error?pedido=RR-XXXXXX. El pedido ya quedó registrado sin pagar: se termina por WhatsApp.
import type { Metadata } from 'next'
import Link from 'next/link'
import MainNav from '@/components/MainNav'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'

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
    <>
      <MainNav />
      <main className="min-h-[70vh]">
        <div className="contenedor pb-16 pt-6 md:pb-24 md:pt-10">
          <div className="max-w-[640px]">
            <h1 className="page-title">No se completó el pago</h1>

            {numero ? (
              <dl className="mt-8 border-t border-linea">
                <div className="flex items-baseline justify-between gap-4 border-b border-linea py-4">
                  <dt className="text-tinta-2">Número de pedido</dt>
                  <dd className="num bg-accent px-2.5 py-1 text-2xl leading-none tracking-wide">{numero}</dd>
                </div>
              </dl>
            ) : null}

            <p className="mt-8 text-[17px] leading-relaxed text-tinta-2">
              {numero ? 'Tu pedido quedó registrado, pero sin pagar. ' : ''}Escríbenos por WhatsApp y lo terminamos contigo.
              Si el cargo aparece como pendiente en tu banco, espera la confirmación antes de volver a pagar.
            </p>

            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 min-h-[58px] text-[17px]">
              <IconoWhatsapp />
              Escribir por WhatsApp
            </a>
            <Link
              href="/"
              className="mt-6 flex min-h-[44px] items-center justify-center text-[15px] font-semibold underline underline-offset-[3px] hover:decoration-2"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
