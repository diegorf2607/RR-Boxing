'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CLASE, claseVigente } from '@/shared/lib/clase-virtual'

const filas: { etiqueta: string; valor: string }[] = [
  { etiqueta: 'Hora', valor: CLASE.hora },
  { etiqueta: 'Dónde', valor: CLASE.donde },
  { etiqueta: 'Precio', valor: 'Gratis, solo te inscribes' },
  { etiqueta: 'El link', valor: 'Te lo mandamos por WhatsApp' },
]

/** «Sábado 28 de noviembre» → «Sábado 28» y «de noviembre», para partir el título en dos líneas como en la maqueta. */
const [DIA, MES] = (() => {
  const corte = CLASE.dia.indexOf(' de ')
  return corte > 0 ? [CLASE.dia.slice(0, corte), CLASE.dia.slice(corte + 1)] : [CLASE.dia, '']
})()

/**
 * La banda negra de la clase virtual gratis en el inicio. La página decide en el servidor si se muestra; si la página
 * se armó antes de la clase y alguien la abre después, aquí se esconde al cargar.
 */
export default function ClaseDestacada() {
  const [vigente, setVigente] = useState(true)

  useEffect(() => {
    if (!claseVigente()) setVigente(false)
  }, [])

  if (!vigente) return null

  return (
    <section
      id="clase"
      aria-labelledby="clase-destacada-titulo"
      className="scroll-mt-20 bg-tinta py-12 text-white md:scroll-mt-24 md:py-[72px]"
    >
      <div className="contenedor grid gap-7 md:gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
        <div>
          <p className="mb-3.5 text-lg font-bold text-accent">Clase virtual gratis</p>
          <h2 id="clase-destacada-titulo" className="font-heading text-[60px] leading-[0.9] md:text-[88px] xl:text-[120px]">
            {DIA}
            {MES ? (
              <>
                <br />
                {MES}
              </>
            ) : null}
          </h2>
        </div>

        <div>
          <dl className="filas">
            {filas.map((fila) => (
              <div key={fila.etiqueta}>
                <dt>{fila.etiqueta}</dt>
                <dd>{fila.valor}</dd>
              </div>
            ))}
          </dl>
          <Link href="/clase" className="btn-primary mt-7">
            Inscribirme gratis
          </Link>
        </div>
      </div>
    </section>
  )
}
