import Link from 'next/link'
import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { CAMBIOS } from '@/shared/legal/cambios'
import { RUTAS } from '@/shared/legal/politicas'
import { COMBO_MIN_UNITS } from '@/shared/lib/combo-promo'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

const enlace = 'enlace text-tinta'

/**
 * Las preguntas frecuentes de la tienda (components/StoreFAQSection.tsx) que sirven en la ficha, con el mismo texto.
 * El envío y el pago ya van en las filas de la caja de compra. Acordeón con <details>: funciona sin JavaScript y con
 * teclado. Como en la portada: el título a la izquierda y las preguntas a la derecha, con líneas finas y un «+» que
 * gira al abrir. `children` va debajo del título (la ficha pone ahí el enlace a las clases).
 * `pagoEnLinea` lo decide la página en el servidor con pagoEnLineaActivo() (shared/config/pagos.ts).
 */
export default function PreguntasProducto({
  nombre,
  participaDelCombo,
  pagoEnLinea,
  children,
}: {
  nombre: string
  participaDelCombo: boolean
  pagoEnLinea: boolean
  children?: ReactNode
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
    <section
      className="mt-14 grid gap-7 border-t border-linea pt-10 lg:mt-[88px] lg:grid-cols-[1fr_1.4fr] lg:gap-14"
      aria-labelledby="preguntas-producto"
    >
      <div>
        <h2 id="preguntas-producto" className="titulo-bloque">
          Preguntas frecuentes
        </h2>
        {children}
      </div>
      <div>
        {preguntas.map((p) => (
          <details key={p.id} className="group border-b border-linea first:border-t">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold md:text-lg [&::-webkit-details-marker]:hidden">
              <span>{p.pregunta}</span>
              <Plus
                className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                strokeWidth={2}
                aria-hidden
              />
            </summary>
            <p className="pb-[22px] pr-10 leading-relaxed text-tinta-2">{p.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
