import type { Metadata } from 'next'
import MainNav from '@/components/MainNav'
import CheckoutClient from '@/features/checkout/CheckoutClient'
import { pagoEnLineaActivo } from '@/shared/config/pagos'
import { LISTA_ENVIOS } from '@/shared/lib/cart-checkout'

// Se arma en cada visita: si Diego carga MERCADOPAGO_ACCESS_TOKEN en Vercel, la opción de pagar en línea aparece sola.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tu pedido',
  robots: { index: false, follow: false },
}

/** La pantalla de datos del pedido. Las tarifas de envío y si hay pago en línea vienen del servidor. */
export default function CheckoutPage() {
  return (
    <>
      <MainNav />
      <main className="min-h-[70vh]">
        <CheckoutClient envios={LISTA_ENVIOS} pagoEnLinea={pagoEnLineaActivo()} />
      </main>
    </>
  )
}
