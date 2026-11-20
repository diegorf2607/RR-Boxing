'use client'

import { useCallback, useId, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { WHATSAPP_LEGIBLE, enlaceWhatsapp } from '@/shared/lib/whatsapp'
import { useClaseVigente } from '@/components/EnlaceClase'
import { CAMBIOS } from '@/shared/legal/cambios'
import { GARANTIA_DIAS, RUTAS } from '@/shared/legal/politicas'
import { TEXTO_PAGO_EN_LINEA } from '@/shared/config/pagos'
import { CLASE } from '@/shared/lib/clase-virtual'

type FaqItem = { id: string; question: string; answer: ReactNode }

const WHATSAPP_CONSULTA = enlaceWhatsapp('Hola, RR Boxing. Tengo una consulta sobre la tienda.')

const enlace = 'text-accent underline underline-offset-2 hover:text-white'

/** Frase de la clase virtual: solo sale mientras la clase no haya terminado. La clase es gratis desde el 20 nov. */
function FraseClaseVirtual() {
  const vigente = useClaseVigente()
  if (!vigente) return null
  return (
    <>
      {' '}
      También hay una{' '}
      <Link href="/clase" className={enlace}>
        clase virtual
      </Link>{' '}
      gratis, el {CLASE.dia.toLocaleLowerCase('es-PE')}.
    </>
  )
}

/** Para quien está fuera del Perú: solo mientras haya una clase virtual publicada. */
function FraseClaseDesdeFuera() {
  const vigente = useClaseVigente()
  if (!vigente) return null
  return (
    <>
      {' '}
      La{' '}
      <Link href="/clase" className={enlace}>
        clase virtual
      </Link>{' '}
      sí la puedes tomar desde otro país.
    </>
  )
}

function WhatsappLink({ children }: { children: ReactNode }) {
  return (
    <a href={WHATSAPP_CONSULTA} target="_blank" rel="noopener noreferrer" className={enlace}>
      {children}
    </a>
  )
}

/**
 * Las preguntas. Las del envío, el pago y el stock cambian si hay pago en línea (lo decide el servidor). `tarifas` son
 * las de /checkout en una frase (textoTarifas en shared/config/envios.ts): la ficha dice lo mismo.
 */
const preguntas = (pagoEnLinea: boolean, tarifas: string): FaqItem[] => [
  {
    id: 'pedido',
    question: '¿Cómo hago mi pedido?',
    answer: (
      <>
        Agrega tus productos al carrito y toca «Continuar con mi pedido». Ahí nos dejas tu nombre, tu correo, tu
        WhatsApp y la dirección de envío, y eliges el envío. Si prefieres, desde el carrito también puedes pedir
        directo por WhatsApp: el mensaje sale con tu pedido ya escrito.
      </>
    ),
  },
  {
    id: 'envios',
    question: '¿A qué zonas envían y cuánto tarda?',
    answer: pagoEnLinea ? (
      <>
        Por ahora enviamos dentro del Perú. {tarifas}. Si tu distrito tuviera otro costo, te avisamos antes de enviar
        y no te cobramos nada que no aceptes.
      </>
    ) : (
      <>
        Por ahora enviamos dentro del Perú. {tarifas}. Si tu distrito tuviera otro costo, te avisamos por WhatsApp
        antes de cobrarte.
      </>
    ),
  },
  {
    id: 'pagos',
    question: '¿Cómo pago?',
    answer: pagoEnLinea ? (
      <>
        {TEXTO_PAGO_EN_LINEA} Mercado Pago cobra en su propia página: nosotros no vemos los datos de tu tarjeta.
      </>
    ) : (
      <>
        Por ahora los productos de la tienda no se pagan en la web. Cuando nos escribes por WhatsApp con tu pedido,
        te decimos cómo pagar.
      </>
    ),
  },
  {
    id: 'combo',
    question: '¿Hay descuentos?',
    answer: (
      <>
        Sí, uno: llevando 2 o más unidades, aunque sean del mismo producto, tienes 10% de descuento sobre los
        productos. Se calcula solo en el carrito y va escrito en tu pedido.
      </>
    ),
  },
  {
    id: 'stock',
    question: '¿Cómo sé si hay stock?',
    answer: pagoEnLinea ? (
      <>
        La ficha dice si hay stock, pero lo actualizamos a mano. Si algo se agotara después de que pagaste, te
        avisamos por WhatsApp y te devolvemos lo que pagaste.
      </>
    ) : (
      <>Antes de cobrarte te confirmamos por WhatsApp que el producto está disponible.</>
    ),
  },
  {
    id: 'garantia',
    question: `¿Qué cubre la garantía de ${GARANTIA_DIAS} días?`,
    answer: (
      <>
        Los productos que llegan fallados, dañados o que no son los que pediste, y los defectos de fabricación.
        Avísanos por WhatsApp dentro de los {GARANTIA_DIAS} días calendario desde la entrega: tú eliges un cambio o
        la devolución de tu dinero, y los envíos los paga RR Boxing. El detalle está en{' '}
        <Link href={RUTAS.garantia} className={enlace}>
          Garantía de compra
        </Link>
        .
      </>
    ),
  },
  {
    id: 'devoluciones',
    question: '¿Puedo cambiar o devolver un producto?',
    answer: (
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
    id: 'clases',
    question: '¿La tienda incluye clases de boxeo?',
    answer: (
      <>
        No, las clases son aparte. Las{' '}
        <Link href="/consulta" className={enlace}>
          clases 1 a 1
        </Link>{' '}
        con Richard se piden por WhatsApp.
        <FraseClaseVirtual />
      </>
    ),
  },
  {
    id: 'pais',
    question: '¿Puedo comprar desde otro país?',
    answer: (
      <>
        Por ahora solo enviamos dentro del Perú y los precios están en soles.
        <FraseClaseDesdeFuera /> Si tienes una duda, escríbenos por <WhatsappLink>WhatsApp</WhatsappLink>.
      </>
    ),
  },
  {
    id: 'contacto',
    question: '¿Cómo los contacto si hay un problema con mi pedido?',
    answer: (
      <>
        Escríbenos al WhatsApp <WhatsappLink>{WHATSAPP_LEGIBLE}</WhatsappLink> con tu nombre y lo que pediste.
      </>
    ),
  },
]

/**
 * Preguntas frecuentes del inicio. `pagoEnLinea` viene de la página (servidor) con pagoEnLineaActivo()
 * (shared/config/pagos.ts): en el navegador no se puede saber.
 */
export default function StoreFAQSection({ pagoEnLinea, tarifas }: { pagoEnLinea: boolean; tarifas: string }) {
  const baseId = useId()
  const items = preguntas(pagoEnLinea, tarifas)
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(['pedido']))

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <section
      id="preguntas-frecuentes"
      className="scroll-mt-24 border-t border-dark-300 bg-dark py-12 md:py-16"
      aria-labelledby={`${baseId}-heading`}
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="max-w-3xl">
          <h2 id={`${baseId}-heading`} className="section-title">
            Preguntas frecuentes
          </h2>
          <p className="section-subtitle">
            Si no ves tu caso, escríbenos por <WhatsappLink>WhatsApp</WhatsappLink>.
          </p>
        </div>

        {/* Una sola caja con filas finas, como las preguntas de la ficha (features/store/PreguntasProducto.tsx) */}
        <div className="mt-8 max-w-3xl rounded-2xl border border-dark-300 bg-dark-100">
          {items.map((item) => {
            const isOpen = openIds.has(item.id)
            const panelId = `${baseId}-panel-${item.id}`
            const buttonId = `${baseId}-btn-${item.id}`
            return (
              <div key={item.id} className="border-t border-dark-300 first:border-t-0">
                <h3 className="text-base font-medium leading-snug">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(item.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-white transition hover:text-accent"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-accent transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  {isOpen ? (
                    <p className="px-5 pb-4 text-sm leading-relaxed text-neutral-light">{item.answer}</p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
