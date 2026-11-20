import Link from 'next/link'
import type { Product } from '@/shared/types/commerce'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

/** Envío y cambios en filas con líneas finas, como /clase. Solo dice lo que hoy se cumple. */
export default function ProductTrustBlocks({ product }: { product: Product }) {
  const whatsappCambio = enlaceWhatsapp(
    `Hola, RR Boxing. Quiero hacer un cambio de mi pedido de ${product.name.trim()}.`
  )

  return (
    <dl className="mt-8 rounded-2xl border border-dark-300 bg-dark-100">
      <div className="px-5 py-4">
        <dt className="text-sm text-neutral">Envío</dt>
        <dd className="mt-1 text-base text-white">
          Envíos dentro del Perú. Te confirmamos el costo y el plazo por WhatsApp antes de pagar.
        </dd>
      </div>
      <div className="border-t border-dark-300 px-5 py-4">
        <dt className="text-sm text-neutral">Cambios</dt>
        <dd className="mt-1 text-base text-white">
          Si tu producto llega fallado o no es el que pediste, lo cambiamos.{' '}
          <a
            href={whatsappCambio}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:text-white"
          >
            Escríbenos por WhatsApp
          </a>
          .{' '}
          <Link href="/garantia" className="text-neutral-light underline underline-offset-2 hover:text-white">
            Ver la garantía
          </Link>
        </dd>
      </div>
    </dl>
  )
}
