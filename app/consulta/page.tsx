import type { Metadata } from 'next'
import Image from 'next/image'
import MainNav from '@/components/MainNav'
import Benefits from '@/components/Benefits'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import { enlaceWhatsapp, WHATSAPP_LEGIBLE } from '@/shared/lib/whatsapp'
import { IMAGEN_COMPARTIR } from '@/shared/config/imagen-compartir'
import { MENSAJE_CLASES_1A1 } from '@/shared/config/clases'
import IconoWhatsapp from '@/components/legal/IconoWhatsapp'

const DESCRIPCION =
  'Entrenamiento personalizado con Richard, enfocado en la salud y pensado para personas comunes. El horario y el precio se coordinan por WhatsApp.'

export const metadata: Metadata = {
  title: 'Clases 1 a 1 con Richard',
  description: DESCRIPCION,
  openGraph: {
    title: 'Clases 1 a 1 con Richard · RR Boxing',
    description: DESCRIPCION,
    type: 'website',
    images: [IMAGEN_COMPARTIR],
  },
}

const filas: { etiqueta: string; valor: string }[] = [
  { etiqueta: 'Con quién', valor: 'Richard Rodríguez' },
  { etiqueta: 'Para quién', valor: 'Personas comunes que quieren cuidar su salud' },
  // Dónde son y cuánto dura cada sesión todavía no está escrito en ningún lado: no se inventa, se coordina
  { etiqueta: 'Lugar, horario y precio', valor: 'Se coordinan por WhatsApp' },
]

/**
 * Clases 1 a 1, en la línea A: como la portada de la maqueta. En el celular, el título, la foto de Richard y el texto,
 * uno debajo del otro; desde 900 px, el título y el texto a la izquierda y la foto a la derecha. Abajo, qué ganas
 * (filas) y los testimonios en video.
 */
export default function ConsultaPage() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />

      <section className="pb-12 pt-7 text-white min-[900px]:pb-16 min-[900px]:pt-10">
        <div className="wrap grid grid-cols-1 gap-y-5 [grid-template-areas:'tit'_'foto'_'txt'] min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] min-[900px]:gap-x-16 min-[900px]:gap-y-0 min-[900px]:[grid-template-areas:'tit_foto'_'txt_foto']">
          <h1 className="hero-title self-end [grid-area:tit]">
            Clases 1 a 1 <span className="block text-accent">con Richard</span>
          </h1>

          <div className="relative aspect-[1319/1170] w-full overflow-hidden rounded-2xl border border-line [grid-area:foto]">
            <Image
              src="/Richard.jpeg"
              alt="Richard Rodríguez con manoplas durante un entrenamiento"
              fill
              priority
              sizes="(min-width: 1264px) 620px, (min-width: 900px) 52vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="[grid-area:txt] min-[900px]:mt-5">
            <p className="lead">
              Entrenamiento personalizado, enfocado en tu salud y pensado para personas comunes. Escríbenos y
              coordinamos contigo el lugar, el horario y el precio.
            </p>

            <dl className="filas mt-6">
              {filas.map((fila) => (
                <div key={fila.etiqueta}>
                  <dt className="shrink-0">{fila.etiqueta}</dt>
                  <dd>{fila.valor}</dd>
                </div>
              ))}
            </dl>

            <a
              href={enlaceWhatsapp(MENSAJE_CLASES_1A1)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-7 sm:inline-flex sm:w-auto"
            >
              <IconoWhatsapp />
              Escribir por WhatsApp
            </a>
            <p className="mt-3 text-sm text-neutral">
              O escribe al <span className="whitespace-nowrap font-semibold text-white">{WHATSAPP_LEGIBLE}</span>.
            </p>
          </div>
        </div>
      </section>

      <Benefits />
      <Testimonials />
      <Footer />
    </main>
  )
}
