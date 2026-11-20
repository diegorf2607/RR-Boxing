// La vuelta de Mercado Pago después de pagar (back_urls success y pending de shared/lib/mercadopago.ts):
// /checkout/success?pedido=RR-XXXXXX[&estado=pendiente] y, de Mercado Pago, payment_id, status, external_reference…
// Si trae el número del pago, se confirma ahí mismo consultándolo a la API (por si el aviso del webhook todavía no
// llegó); nunca se confía en el «status» de la dirección. Muestra solo el número del pedido y si el pago se confirmó.
import type { Metadata } from 'next'
import Link from 'next/link'
import MainNav from '@/components/MainNav'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
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
      <div className="wrap pb-16 pt-8 text-white min-[900px]:pb-20 min-[900px]:pt-12">
        <div className="mx-auto w-full max-w-xl">
          <h1 className="page-title">Gracias por tu pedido</h1>

          {existe && numero ? (
            <dl className="filas mt-8">
              <div>
                <dt>Número de pedido</dt>
                <dd className="text-lg font-bold tracking-[0.04em] text-accent">{numero}</dd>
              </div>
              <div>
                <dt>Pago</dt>
                <dd>{pagado ? 'Confirmado' : 'Por confirmar'}</dd>
              </div>
            </dl>
          ) : null}

          <p className="mt-8 text-neutral-light">
            {pagado
              ? 'Ya recibimos tu pago. Te escribimos por WhatsApp para coordinar el envío.'
              : 'Si ya pagaste, Mercado Pago nos avisa en unos minutos. Escríbenos por WhatsApp para coordinar el envío o si tienes alguna duda.'}
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
