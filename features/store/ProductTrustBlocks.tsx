import Link from 'next/link'
import { CAMBIOS } from '@/shared/legal/cambios'
import { RUTAS } from '@/shared/legal/politicas'

const enlace = 'text-accent underline underline-offset-2 hover:text-white'

/**
 * Envío, pago, y cambios y garantía, en filas con líneas finas como /clase. Solo dice lo que hoy se cumple: los
 * textos de cambios y garantía salen de shared/legal (la misma fuente que /reembolso y /garantia).
 */
export default function ProductTrustBlocks() {
  return (
    <dl className="mt-8 max-w-lg rounded-2xl border border-dark-300 bg-dark-100">
      <div className="px-5 py-4">
        <dt className="text-sm text-neutral">Envío</dt>
        <dd className="mt-1 text-base text-white">
          Enviamos dentro del Perú. El costo y el plazo dependen de tu distrito y de la opción que elijas: te los
          confirmamos por WhatsApp antes de cobrarte.
        </dd>
      </div>
      <div className="border-t border-dark-300 px-5 py-4">
        <dt className="text-sm text-neutral">Pago</dt>
        <dd className="mt-1 text-base text-white">Lo coordinamos contigo por WhatsApp cuando confirmamos tu pedido.</dd>
      </div>
      <div className="border-t border-dark-300 px-5 py-4">
        <dt className="text-sm text-neutral">Cambios y garantía</dt>
        <dd className="mt-1 text-base text-white">
          Si tu producto llega fallado, dañado o no es el que pediste, tú eliges un cambio o la devolución de tu
          dinero, y los envíos los paga RR Boxing. {CAMBIOS.garantia}
          <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href={RUTAS.cambios} className={enlace}>
              Cambios y devoluciones
            </Link>
            <Link href={RUTAS.garantia} className={enlace}>
              Garantía de compra
            </Link>
          </span>
        </dd>
      </div>
    </dl>
  )
}
