import Link from 'next/link'
import { CAMBIOS } from '@/shared/legal/cambios'
import { RUTAS } from '@/shared/legal/politicas'
import { TEXTO_PAGO_EN_LINEA } from '@/shared/config/pagos'

/**
 * Envío, pago, y cambios y garantía, en filas con líneas finas bajo los botones de compra: el rótulo a la izquierda y
 * el texto a la derecha (uno sobre otro en el celular). Solo dice lo que hoy se cumple: los textos de cambios y
 * garantía salen de shared/legal (la misma fuente que /reembolso y /garantia).
 * `pagoEnLinea` lo decide la página en el servidor con pagoEnLineaActivo() (shared/config/pagos.ts) y `tarifas` sale de
 * la misma lista de envíos de /checkout (textoTarifas en shared/config/envios.ts), para que digan lo mismo.
 */
export default function ProductTrustBlocks({ pagoEnLinea, tarifas }: { pagoEnLinea: boolean; tarifas: string }) {
  const fila = 'grid gap-1 border-b border-linea py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4'
  return (
    <dl className="mt-7 border-t border-linea text-[15px] leading-relaxed">
      <div className={fila}>
        <dt className="font-bold">Envío</dt>
        <dd className="text-tinta-2">
          Enviamos dentro del Perú. {tarifas}.{' '}
          {pagoEnLinea
            ? 'Si tu distrito tuviera otro costo, te avisamos antes de enviar y no te cobramos nada que no aceptes.'
            : 'Si tu distrito tuviera otro costo, te avisamos por WhatsApp antes de cobrarte.'}
        </dd>
      </div>
      <div className={fila}>
        <dt className="font-bold">Pago</dt>
        <dd className="text-tinta-2">
          {pagoEnLinea ? TEXTO_PAGO_EN_LINEA : 'Lo coordinamos contigo por WhatsApp cuando confirmamos tu pedido.'}
        </dd>
      </div>
      <div className={fila}>
        <dt className="font-bold">Cambios y garantía</dt>
        <dd className="text-tinta-2">
          Si tu producto llega fallado, dañado o no es el que pediste, tú eliges un cambio o la devolución de tu
          dinero, y los envíos los paga RR Boxing. {CAMBIOS.garantia}
          <span className="mt-1 flex flex-wrap gap-x-5">
            <Link href={RUTAS.cambios} className="enlace inline-flex min-h-[44px] items-center text-tinta sm:min-h-0 sm:py-1">
              Cambios y devoluciones
            </Link>
            <Link href={RUTAS.garantia} className="enlace inline-flex min-h-[44px] items-center text-tinta sm:min-h-0 sm:py-1">
              Garantía de compra
            </Link>
          </span>
        </dd>
      </div>
    </dl>
  )
}
