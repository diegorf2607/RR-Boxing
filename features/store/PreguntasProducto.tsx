import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { CAMBIOS } from '@/shared/legal/cambios'
import { RUTAS } from '@/shared/legal/politicas'
import { COMBO_MIN_UNITS } from '@/shared/lib/combo-promo'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

const enlace = 'font-medium text-white underline decoration-1 underline-offset-4 hover:text-accent'

/**
 * Las preguntas frecuentes de la tienda (components/StoreFAQSection.tsx) que sirven en la ficha, con el mismo texto,
 * en el acordeón de la línea A (.acordeon: líneas finas entre preguntas y la flecha a la derecha). La primera viene
 * abierta, como en la maqueta. El envío y el pago ya van en las filas de la caja de compra. Con <details>: funciona sin
 * JavaScript y con teclado. `pagoEnLinea` lo decide la página en el servidor con pagoEnLineaActivo()
 * (shared/config/pagos.ts).
 */
export default function PreguntasProducto({
  nombre,
  participaDelCombo,
  pagoEnLinea,
}: {
  nombre: string
  participaDelCombo: boolean
  pagoEnLinea: boolean
}) {
  const whatsapp = enlaceWhatsapp(`Hola, RR Boxing. Tengo una consulta sobre ${nombre.trim()}.`)

  const preguntas: { id: string; pregunta: string; respuesta: ReactNode }[] = [
    ...(participaDelCombo
      ? [
          {
            id: 'combo',
            pregunta: '¿Hay descuentos?',
            respuesta: (
              <>
                Sí, uno: llevando {COMBO_MIN_UNITS} o más unidades, aunque sean del mismo producto, tienes 10% de
                descuento sobre los productos. Se calcula solo en el carrito y va escrito en tu pedido.
              </>
            ),
          },
        ]
      : []),
    {
      id: 'stock',
      pregunta: '¿Cómo sé si hay stock?',
      respuesta: pagoEnLinea ? (
        <>
          La ficha dice si hay stock, pero lo actualizamos a mano. Si algo se agotara después de que pagaste, te
          avisamos por WhatsApp y te devolvemos lo que pagaste.
        </>
      ) : (
        <>Antes de cobrarte te confirmamos por WhatsApp que el producto está disponible.</>
      ),
    },
    {
      id: 'cambios',
      pregunta: '¿Puedo cambiar o devolver un producto?',
      respuesta: (
        <>
          {CAMBIOS.resumen} Más detalle en{' '}
          <Link href={RUTAS.cambios} className={enlace}>
            Cambios y devoluciones
          </Link>
          .
        </>
      ),
    },
    {
      id: 'pais',
      pregunta: '¿Puedo comprar desde otro país?',
      respuesta: (
        <>
          Por ahora solo enviamos dentro del Perú y los precios están en soles. Si tienes una duda, escríbenos por{' '}
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={enlace}>
            WhatsApp
          </a>
          .
        </>
      ),
    },
  ]

  return (
    <div>
      <div className="seccion-cab">
        <h2 id="preguntas-producto" className="section-title">
          Preguntas frecuentes
        </h2>
      </div>
      <div className="acordeon">
        {preguntas.map((p, i) => (
          <details key={p.id} open={i === 0}>
            <summary>
              {p.pregunta}
              <ChevronDown strokeWidth={1.6} aria-hidden />
            </summary>
            <p>{p.respuesta}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
