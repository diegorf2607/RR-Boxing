import { redirect } from 'next/navigation'
import MainNav from '@/components/MainNav'
import CheckoutClient from '@/features/checkout/CheckoutClient'
import { PAGO_EN_LINEA_ACTIVO } from '@/shared/config/pagos'

export default function CheckoutPage() {
  // Sin pasarela que funcione en Perú, el pedido se hace por WhatsApp desde el carrito.
  if (!PAGO_EN_LINEA_ACTIVO) redirect('/cart')

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <CheckoutClient />
    </main>
  )
}
