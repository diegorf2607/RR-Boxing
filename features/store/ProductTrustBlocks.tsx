import Link from 'next/link'
import { CAMBIOS } from '@/shared/legal/cambios'
import { RUTAS } from '@/shared/legal/politicas'
import { TEXTO_PAGO_EN_LINEA } from '@/shared/config/pagos'

const enlace = 'text-accent underline underline-offset-2 hover:text-white'

/**
 * Envío, pago, y cambios y garantía, en filas con líneas finas como /clase. Solo dice lo que hoy se cumple: los
 * textos de cambios y garantía salen de shared/legal (la misma fuente que /reembolso y /garantia).
 * `pagoEnLinea` lo decide la página en el servidor con pagoEnLineaActivo() (shared/config/pagos.ts) y `tarifas` sale de
 * la misma lista de envíos de /checkout (textoTarifas en shared/config/envios.ts), para que digan lo mismo.
 */
export default function ProductTrustBlocks({ pagoEnLinea, tarifas }: { pagoEnLinea: boolean; tarifas: string }) {
  return (
    <dl className="mt-8 max-w-lg rounded-2xl border border-dark-300 bg-dark-100">
      <div className="px-5 py-4">
        <dt className="text-sm text-neutral">Envío</dt>
        <dd className="mt-1 text-base text-white">
          Enviamos dentro del Perú. {tarifas}.{' '}
          {pagoEnLinea
            ? 'Si tu distrito tuviera otro costo, te avisamos antes de enviar y no te cobramos nada que no aceptes.'
            : 'Si tu distrito tuviera otro costo, te avisamos por WhatsApp antes de cobrarte.'}
        </dd>
      </div>
      <div className="border-t border-dark-300 px-5 py-4">
        <dt className="text-sm text-neutral">Pago</dt>
        <dd className="mt-1 text-base text-white">
          {pagoEnLinea ? TEXTO_PAGO_EN_LINEA : 'Lo coordinamos contigo por WhatsApp cuando confirmamos tu pedido.'}
        </dd>
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
