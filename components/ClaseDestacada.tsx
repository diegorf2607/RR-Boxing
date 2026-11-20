'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CLASE, claseVigente } from '@/shared/lib/clase-virtual'

const filas: { etiqueta: string; valor: string; nota?: string }[] = [
  { etiqueta: 'Día', valor: CLASE.dia },
  { etiqueta: 'Hora', valor: CLASE.hora },
  { etiqueta: 'Dónde', valor: CLASE.donde },
  { etiqueta: 'Precio', valor: CLASE.precio, nota: CLASE.precioFuera },
]

/**
 * Aviso de la clase virtual en el inicio. La página decide en el servidor si se muestra; si la página
 * se armó antes de la clase y alguien la abre después, aquí se esconde al cargar.
 */
export default function ClaseDestacada() {
  const [vigente, setVigente] = useState(true)

  useEffect(() => {
    if (!claseVigente()) setVigente(false)
  }, [])

  if (!vigente) return null

  return (
    <section aria-labelledby="clase-destacada-titulo" className="border-b border-dark-300 bg-dark py-12 text-white md:py-16">
      <div className="container mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2 md:items-center md:gap-12">
        <div>
          <h2 id="clase-destacada-titulo" className="font-heading text-5xl leading-none text-white sm:text-6xl">
            Clase virtual <span className="block text-accent">RR Boxing</span>
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-neutral-light">
            Te inscribes, pagas con Mercado Pago, mandas tu comprobante por WhatsApp y te enviamos el link de la clase.
          </p>
        </div>

        <div>
          <dl className="rounded-2xl border border-dark-300 bg-dark-100">
            {filas.map((fila, i) => (
              <div
                key={fila.etiqueta}
                className={`flex items-baseline justify-between gap-4 px-5 py-4 ${
                  i > 0 ? 'border-t border-dark-300' : ''
                }`}
              >
                <dt className="text-sm text-neutral">{fila.etiqueta}</dt>
                <dd className="text-right text-base font-medium">
                  {fila.valor}
                  {fila.nota && <span className="block text-sm font-normal text-neutral">{fila.nota}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href="/clase"
            className="mt-5 block rounded-lg bg-red-600 px-6 py-3.5 text-center font-bold text-white transition-colors hover:bg-red-700"
          >
            Inscribirme
          </Link>
        </div>
      </div>
    </section>
  )
}
