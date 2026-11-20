import Image from 'next/image'
import SocialProof from '@/components/SocialProof'

/** Para quién es, en filas como las de /clase (sin cifras ni promesas que no se puedan respaldar). */
const PARA_QUIEN: { etiqueta: string; valor: string }[] = [
  { etiqueta: 'Si recién empiezas', valor: 'No necesitas experiencia' },
  { etiqueta: 'Si pasas el día sentado', valor: 'Te mueves desde tu casa' },
  { etiqueta: 'Si quieres cuidarte', valor: 'Entrenas a tu ritmo' },
]

/**
 * La portada fija de la línea A (reemplaza al carrusel): el titular, la foto de Richard, para quién es, los dos
 * botones (la tienda y las clases, en esta misma página) y los seguidores. En escritorio la foto va a la derecha y
 * ocupa el alto del titular y del texto; en el celular va entre el titular y el texto.
 */
export default function StoreHero() {
  return (
    <section aria-labelledby="portada-titulo" className="pb-12 pt-7 min-[900px]:pb-16 min-[900px]:pt-10">
      <div className="wrap grid grid-cols-1 items-start gap-y-5 min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] min-[900px]:gap-x-16 min-[900px]:gap-y-0">
        <div className="self-end min-[900px]:col-start-1 min-[900px]:row-start-1">
          <h1 id="portada-titulo" className="hero-title">
            Boxeo para tu salud, <span className="block text-accent">con Richard Rodríguez.</span>
          </h1>
        </div>

        <figure className="min-[900px]:col-start-2 min-[900px]:row-span-2 min-[900px]:row-start-1">
          <Image
            src="/Richard.jpeg"
            alt="Richard Rodríguez con una manopla de entrenamiento"
            width={1319}
            height={1170}
            priority
            sizes="(min-width: 1264px) 620px, (min-width: 900px) 55vw, 100vw"
            className="h-auto w-full rounded-2xl border border-dark-300"
          />
          <figcaption className="mt-2.5 text-[13.5px] text-neutral">Richard Rodríguez, el profe de RR Boxing.</figcaption>
        </figure>

        <div className="min-[900px]:col-start-1 min-[900px]:row-start-2">
          <p className="lead min-[900px]:mt-5">
            No es para pelear: es para moverte y cuidarte. Guantes, vendas y cuerda para empezar en casa, y clases 1 a 1
            para aprender a tu ritmo.
          </p>

          <dl className="filas mt-6">
            {PARA_QUIEN.map((fila) => (
              <div key={fila.etiqueta}>
                <dt>{fila.etiqueta}</dt>
                <dd>{fila.valor}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#catalogo" className="btn-primary inline-flex w-auto">
              Ver la tienda
            </a>
            <a href="#clases" className="btn-secondary inline-flex w-auto">
              Clases con Richard
            </a>
          </div>

          <SocialProof />
        </div>
      </div>
    </section>
  )
}
