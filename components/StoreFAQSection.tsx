'use client'

import { useCallback, useId, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { WHATSAPP_LEGIBLE, enlaceWhatsapp } from '@/shared/lib/whatsapp'
import { useClaseVigente } from '@/components/EnlaceClase'

type FaqItem = { id: string; question: string; answer: ReactNode }

const WHATSAPP_CONSULTA = enlaceWhatsapp('Hola, RR Boxing. Tengo una consulta sobre la tienda.')

const enlace = 'text-accent underline underline-offset-2 hover:text-white'

/** Frase de la clase virtual: solo sale mientras la clase no haya terminado. */
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
      con fecha y precio publicados.
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

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'pedido',
    question: '¿Cómo hago mi pedido?',
    answer: (
      <>
        Agrega tus productos al carrito y pídelos por WhatsApp: el mensaje sale con tu pedido ya escrito. Ahí nos
        dejas tu nombre, tu correo y la dirección de envío, y te confirmamos el envío y el total antes de cobrarte.
      </>
    ),
  },
  {
    id: 'envios',
    question: '¿A qué zonas envían y cuánto tarda?',
    answer: (
      <>
        Por ahora enviamos dentro del Perú. El costo y el plazo dependen de tu distrito: te los confirmamos por
        WhatsApp antes de cobrarte.
      </>
    ),
  },
  {
    id: 'pagos',
    question: '¿Cómo pago?',
    answer: (
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
    answer: <>Antes de cobrarte te confirmamos por WhatsApp que el producto está disponible.</>,
  },
  {
    id: 'garantia',
    question: '¿Qué cubre la garantía de 30 días?',
    answer: (
      <>
        Defectos de fabricación y daños del transporte hasta tu dirección. Avísanos por WhatsApp dentro de los 30
        días calendario desde la entrega, con fotos del producto y, si llegó dañado, también del empaque. El detalle
        está en{' '}
        <Link href="/garantia" className={enlace}>
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
        Si llegó fallado, dañado o no es lo que pediste, entra en la garantía de 30 días. Para cambiarlo por otro
        motivo, el producto debe estar sin uso y en su empaque original. En los dos casos, escríbenos por WhatsApp.
        Más detalle en la{' '}
        <Link href="/reembolso" className={enlace}>
          Política de reembolso
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
        Por ahora solo enviamos dentro del Perú y los precios están en soles. Si estás fuera, escríbenos por{' '}
        <WhatsappLink>WhatsApp</WhatsappLink> y te contamos si se puede.
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

export default function StoreFAQSection() {
  const baseId = useId()
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
      className="scroll-mt-24 border-t border-dark-300 bg-dark py-14 md:py-20"
      aria-labelledby={`${baseId}-heading`}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent">Dudas frecuentes</p>
          <h2 id={`${baseId}-heading`} className="font-heading text-3xl tracking-wide text-white md:text-4xl">
            Preguntas y respuestas
          </h2>
          <p className="mt-3 text-sm text-neutral-light md:text-base">
            Si no ves tu caso, escríbenos por <WhatsappLink>WhatsApp</WhatsappLink>.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openIds.has(item.id)
            const panelId = `${baseId}-panel-${item.id}`
            const buttonId = `${baseId}-btn-${item.id}`
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-colors ${
                  isOpen ? 'border-accent/40 bg-dark-100/90 ring-1 ring-accent/15' : 'border-dark-300 bg-dark/50'
                }`}
              >
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
                  className={isOpen ? 'border-t border-dark-300/80' : ''}
                >
                  {isOpen ? (
                    <p className="px-5 py-4 text-sm leading-relaxed text-neutral-light">{item.answer}</p>
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
