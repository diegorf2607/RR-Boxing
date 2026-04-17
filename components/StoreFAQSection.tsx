'use client'

import { useCallback, useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FaqItem = { id: string; question: string; answer: string }

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'envios',
    question: '¿A qué zonas envían y cuánto tarda?',
    answer:
      'Por ahora operamos envíos dentro de Perú. En el checkout eliges Standard (2–3 días hábiles, gratis), Express (24–48 h) o Urgente en Lima metropolitana según las condiciones indicadas allí. El coste y la opción elegida quedan reflejados antes de pagar.',
  },
  {
    id: 'pagos',
    question: '¿Cómo pago y es seguro?',
    answer:
      'El cobro online es con tarjeta a través de Stripe (datos encriptados; no pasan por nuestros servidores). En el checkout verás otras formas de pago como referencia para el futuro; hoy solo se completa el pedido con la opción Tarjeta/Stripe.',
  },
  {
    id: 'stock',
    question: '¿El stock que veo es real?',
    answer:
      'Sí. Las etiquetas de urgencia y los números de inventario salen del stock configurado para cada producto. Hasta que no completes el pago, otro cliente podría llevarse la última unidad: por eso recomendamos no demorar si ya decidiste.',
  },
  {
    id: 'garantia',
    question: '¿Qué cubre la garantía de 30 días?',
    answer:
      'Defectos de fábrica o daños ocasionados en el transporte hasta la entrega. Debes avisarnos con fotos y el número de pedido dentro de los 30 días, conservando el empaque cuando sea posible. El detalle legal está en términos y política de reembolso.',
  },
  {
    id: 'devoluciones',
    question: '¿Puedo cambiar o devolver un producto?',
    answer:
      'Sí, en los casos previstos en política: producto sin uso, empaque original y solicitud por los canales indicados en tu correo de confirmación o cuenta. Los complementos digitales (PDF, clase grabada) tienen reglas distintas por ser contenido descargable o en video.',
  },
  {
    id: 'clases',
    question: '¿La tienda incluye clases de boxeo?',
    answer:
      'La tienda es equipamiento y productos oficiales RRBOXING. Las clases personalizadas 1 a 1 son un servicio aparte: cotización y agenda en la sección Consulta / clases personalizadas, no en el carrito de la tienda.',
  },
  {
    id: 'complementos',
    question: '¿Qué son el PDF y la clase grabada que aparecen en el checkout?',
    answer:
      'Son complementos opcionales cuando llevas una sola línea de producto en el carrito: un PDF de inicio en boxeo y/o una clase en video con lo básico. Solo se cobran si los marcas antes de pagar; se suman al total en soles.',
  },
  {
    id: 'pais',
    question: '¿Puedo comprar desde otro país?',
    answer:
      'Hoy la tienda y el checkout están configurados solo para Perú (soles y dirección de envío en Perú). Más países pueden sumarse más adelante; mientras tanto, escríbenos por redes si necesitas una excepción comercial.',
  },
  {
    id: 'contacto',
    question: '¿Cómo los contacto si hay un problema con mi pedido?',
    answer:
      'Responde al correo de confirmación del pedido o escríbenos por Instagram @rrboxingperu con tu número de orden. El detalle de garantía está en la página Garantía de compra (enlace en el pie del sitio).',
  },
]

export default function StoreFAQSection() {
  const baseId = useId()
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(['envios']))

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
            Respuestas rápidas antes de comprar. Si no ves tu caso, escríbenos por Instagram o desde el correo de tu
            pedido.
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
