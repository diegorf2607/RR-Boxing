// La vuelta de Mercado Pago después de pagar (back_urls success y pending de shared/lib/mercadopago.ts):
// /checkout/success?pedido=RR-XXXXXX[&estado=pendiente] y, de Mercado Pago, payment_id, status, external_reference…
// Si trae el número del pago, se confirma ahí mismo consultándolo a la API (por si el aviso del webhook todavía no
// llegó); nunca se confía en el «status» de la dirección. Muestra solo el número del pedido y si el pago se confirmó.
import type { Metadata } from 'next'
import Link from 'next/link'
import MainNav from '@/components/MainNav'
import ClearCartOnSuccess from '@/features/checkout/ClearCartOnSuccess'
import { getOrderById } from '@/shared/lib/data-store'
import { mercadoPagoListo } from '@/shared/lib/mercadopago'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'
import { confirmarPagoMercadoPago } from '@/app/api/mercadopago/confirmar-pago'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gracias por tu pedido',
  robots: { index: false, follow: false },
}

const NUMERO = /^RR-[A-Z0-9]{6}$/

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { pedido?: string; payment_id?: string; collection_id?: string }
}) {
  const numero = searchParams.pedido && NUMERO.test(searchParams.pedido) ? searchParams.pedido : null
  const pagoId = searchParams.payment_id ?? searchParams.collection_id
  let pagado = false
  let existe = false

  if (numero) {
    if (pagoId && /^\d{1,20}$/.test(pagoId) && mercadoPagoListo()) {
      try {
        await confirmarPagoMercadoPago(pagoId)
      } catch (e) {
        console.error('checkout/success: no se pudo revisar el pago', numero, e instanceof Error ? e.message : 'error')
      }
    }
    try {
      const pedido = await getOrderById(numero)
      existe = !!pedido
      pagado = pedido?.paymentStatus === 'paid'
    } catch {
      existe = false
    }
  }

  const whatsapp = enlaceWhatsapp(
    existe && numero
      ? pagado
        ? `Hola, RR Boxing. Pagué con Mercado Pago el pedido ${numero}. ¿Me confirman el envío?`
        : `Hola, RR Boxing. Hice el pedido ${numero} en la web y quiero coordinar el pago y el envío.`
      : 'Hola, RR Boxing. Acabo de hacer un pedido en la web y quiero coordinar el envío.'
  )

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <ClearCartOnSuccess pedido={existe && numero ? numero : undefined} />
      <div className="px-4 py-10 text-white sm:py-14">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="font-heading text-5xl leading-none text-white sm:text-6xl">Gracias por tu pedido</h1>

          {existe && numero ? (
            <dl className="mt-8 rounded-2xl border border-dark-300 bg-dark-100">
              <div className="flex items-baseline justify-between gap-4 px-5 py-4">
                <dt className="text-sm text-neutral">Número de pedido</dt>
                <dd className="text-right font-mono text-lg font-bold tracking-wide text-accent">{numero}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-dark-300 px-5 py-4">
                <dt className="text-sm text-neutral">Pago</dt>
                <dd className="text-right text-base font-medium">{pagado ? 'Confirmado' : 'Por confirmar'}</dd>
              </div>
            </dl>
          ) : null}

          <p className="mt-8 text-base leading-relaxed text-neutral-light">
            {pagado
              ? 'Ya recibimos tu pago. Te escribimos por WhatsApp para coordinar el envío.'
              : 'Si ya pagaste, Mercado Pago nos avisa en unos minutos. Escríbenos por WhatsApp para coordinar el envío o si tienes alguna duda.'}
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
