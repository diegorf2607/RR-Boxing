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
 * La caja de la clase virtual, al lado de las clases 1 a 1 en «Clases con Richard» (components/ClassesPromoSection.tsx).
 * La página decide en el servidor si se muestra; si la página se armó antes de la clase y alguien la abre después,
 * aquí se esconde al cargar (y la caja de las 1 a 1 pasa a ocupar el ancho).
 */
export default function ClaseDestacada() {
  const [vigente, setVigente] = useState(true)

  useEffect(() => {
    if (!claseVigente()) setVigente(false)
  }, [])

  if (!vigente) return null

  return (
    <article
      aria-labelledby="clase-destacada-titulo"
      className="flex flex-col overflow-hidden rounded-2xl border border-dark-300 bg-dark-100"
    >
      <div className="flex flex-1 flex-col gap-3.5 p-5 min-[900px]:p-6">
        <h3 id="clase-destacada-titulo" className="card-title">
          Clase virtual
        </h3>
        <p className="text-neutral-light">Es gratis: te inscribes y te mandamos el link de la clase por WhatsApp.</p>
        <dl className="filas filas-hundidas">
          {filas.map((fila) => (
            <div key={fila.etiqueta}>
              <dt>{fila.etiqueta}</dt>
              <dd>
                {fila.valor}
                {fila.nota && <small>{fila.nota}</small>}
              </dd>
            </div>
          ))}
        </dl>
        <Link href="/clase" className="btn-primary mt-auto">
          Inscribirme gratis
        </Link>
      </div>
    </article>
  )
}
