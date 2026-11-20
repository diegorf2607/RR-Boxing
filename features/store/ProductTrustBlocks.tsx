import Link from 'next/link'
import { CAMBIOS } from '@/shared/legal/cambios'
import { RUTAS } from '@/shared/legal/politicas'
import { TEXTO_PAGO_EN_LINEA } from '@/shared/config/pagos'

const enlace = 'font-medium text-white underline decoration-1 underline-offset-4 hover:text-accent'

/**
 * Envío, pago, cambios y garantía en la caja de filas de la línea A (.filas-texto: la etiqueta en una columna de 96 px y
 * el texto a la izquierda), debajo de los botones de compra, como en la maqueta. Solo dice lo que hoy se cumple: los
 * textos de cambios y garantía salen de shared/legal (la misma fuente que /reembolso y /garantia).
 * `pagoEnLinea` lo decide la página en el servidor con pagoEnLineaActivo() (shared/config/pagos.ts) y `tarifas` sale de
 * la misma lista de envíos de /checkout (textoTarifas en shared/config/envios.ts), para que digan lo mismo.
 */
export default function ProductTrustBlocks({ pagoEnLinea, tarifas }: { pagoEnLinea: boolean; tarifas: string }) {
  return (
    <dl className="filas filas-texto">
      <div>
        <dt>Envío</dt>
        <dd>
          Enviamos dentro del Perú. {tarifas}.{' '}
          {pagoEnLinea
            ? 'Si tu distrito tuviera otro costo, te avisamos antes de enviar y no te cobramos nada que no aceptes.'
            : 'Si tu distrito tuviera otro costo, te avisamos por WhatsApp antes de cobrarte.'}
        </dd>
      </div>
      <div>
        <dt>Pago</dt>
        <dd>{pagoEnLinea ? TEXTO_PAGO_EN_LINEA : 'Lo coordinamos contigo por WhatsApp cuando confirmamos tu pedido.'}</dd>
      </div>
      <div>
        <dt>Cambios</dt>
        <dd>
          Si tu producto llega fallado, dañado o no es el que pediste, tú eliges un cambio o la devolución de tu dinero, y
          los envíos los paga RR Boxing.{' '}
          <Link href={RUTAS.cambios} className={enlace}>
            Cambios y devoluciones
          </Link>
        </dd>
      </div>
      <div>
        <dt>Garantía</dt>
        <dd>
          {CAMBIOS.garantia}{' '}
          <Link href={RUTAS.garantia} className={enlace}>
            Garantía de compra
          </Link>
        </dd>
      </div>
    </dl>
  )
}
