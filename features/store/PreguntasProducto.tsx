import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { CAMBIOS } from '@/shared/legal/cambios'
import { RUTAS } from '@/shared/legal/politicas'
import { COMBO_MIN_UNITS } from '@/shared/lib/combo-promo'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

const enlace = 'text-accent underline underline-offset-2 hover:text-white'

/**
 * Las preguntas frecuentes de la tienda (components/StoreFAQSection.tsx) que sirven en la ficha, con el mismo texto.
 * El envío y el pago ya van en las filas de arriba. Acordeón con <details>: funciona sin JavaScript y con teclado.
 * `pagoEnLinea` lo decide la página en el servidor con pagoEnLineaActivo() (shared/config/pagos.ts).
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
    <section className="mt-8 max-w-lg" aria-labelledby="preguntas-producto">
      <h2 id="preguntas-producto" className="text-lg font-semibold text-white">
        Preguntas frecuentes
      </h2>
      <div className="mt-3 rounded-2xl border border-dark-300 bg-dark-100">
        {preguntas.map((p, i) => (
          <details key={p.id} className={`group ${i > 0 ? 'border-t border-dark-300' : ''}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base text-white transition hover:text-accent [&::-webkit-details-marker]:hidden">
              <span>{p.pregunta}</span>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-accent transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="px-5 pb-4 text-sm leading-relaxed text-neutral-light">{p.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
