import LegalPageShell from '@/components/LegalPageShell'
import type { Metadata } from 'next'
import { WHATSAPP_LEGIBLE, enlaceWhatsapp } from '@/shared/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Garantía de compra',
  description:
    'Garantía de 30 días, envíos dentro del Perú y cambios de los productos de la tienda de RR Boxing.',
}

const WHATSAPP_GARANTIA = enlaceWhatsapp('Hola, RR Boxing. Tengo una consulta sobre la garantía de mi pedido.')

export default function GarantiaPage() {
  return (
    <LegalPageShell title="Garantía de compra">
      <h2 className="text-xl font-bold text-white">1. Cómo se pide</h2>
      <p>
        Los productos de la tienda se piden por WhatsApp y se envían dentro del Perú. Por ahora la tienda no cobra en
        línea: cuando nos escribes con tu pedido, por WhatsApp te decimos cómo pagar.
      </p>

      <h2 className="!mt-8 text-xl font-bold text-white">2. Envío</h2>
      <p>
        El costo y el plazo del envío dependen de tu distrito. Te los confirmamos por WhatsApp antes de cobrarte.
      </p>

      <h2 className="!mt-8 text-xl font-bold text-white">3. Garantía de 30 días</h2>
      <p>
        Si el producto llega fallado, dañado o no es el que pediste, escríbenos por WhatsApp dentro de los{' '}
        <strong className="text-white">30 días calendario desde la entrega</strong> y lo vemos contigo. Vale aunque ya
        lo hayas abierto o probado, y no necesitas el empaque original. Mándanos fotos del producto para ver qué pasó.
      </p>
      <p>Esta garantía no limita los derechos que te da el Código de Protección y Defensa del Consumidor.</p>

      <h2 className="!mt-8 text-xl font-bold text-white">4. Cambios por otro motivo</h2>
      <p>
        Si quieres cambiar un producto por otro motivo, escríbenos por WhatsApp. Para estos cambios, el producto debe
        estar <strong className="text-white">sin uso y en su empaque</strong>.
      </p>

      <h2 className="!mt-8 text-xl font-bold text-white">5. Contacto</h2>
      <p>
        Escríbenos al WhatsApp{' '}
        <a
          href={WHATSAPP_GARANTIA}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 hover:text-white"
        >
          {WHATSAPP_LEGIBLE}
        </a>{' '}
        con tu nombre y lo que pediste.
      </p>
    </LegalPageShell>
  )
}
