import LegalPageShell from '@/components/LegalPageShell'
import { WHATSAPP_LEGIBLE, enlaceWhatsapp } from '@/shared/lib/whatsapp'

export const metadata = {
  title: 'Política de reembolso',
  description: 'Cambios y reembolsos de los productos de la tienda de RR Boxing.',
}

const WHATSAPP_REEMBOLSO = enlaceWhatsapp('Hola, RR Boxing. Quiero hacer un cambio o pedir un reembolso.')

export default function ReembolsoPage() {
  return (
    <LegalPageShell title="Política de reembolso">
      <p>
        Los productos de la tienda se piden por WhatsApp y se envían dentro del Perú. Por ahora la tienda no cobra en
        línea: por WhatsApp te decimos cómo pagar, y el costo y el plazo del envío te los confirmamos antes de
        cobrarte.
      </p>
      <p>
        Si el producto llega fallado, dañado o no es el que pediste, escríbenos por WhatsApp dentro de los 30 días
        calendario desde la entrega y lo vemos contigo, aunque ya lo hayas abierto o probado. Para esto no necesitas el
        empaque original.
      </p>
      <p>Si quieres cambiar un producto por otro motivo, el producto debe estar sin uso y en su empaque.</p>
      <p>Esta política no limita los derechos que te da el Código de Protección y Defensa del Consumidor.</p>
      <p>
        Para un cambio o un reembolso, escríbenos al WhatsApp{' '}
        <a
          href={WHATSAPP_REEMBOLSO}
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
