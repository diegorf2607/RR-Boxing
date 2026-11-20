import type { Metadata } from 'next'
import Image from 'next/image'
import MainNav from '@/components/MainNav'
import Benefits from '@/components/Benefits'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import { enlaceWhatsapp, WHATSAPP_LEGIBLE } from '@/shared/lib/whatsapp'
import { IMAGEN_COMPARTIR } from '@/shared/config/imagen-compartir'
import { MENSAJE_CLASES_1A1 } from '@/shared/config/clases'

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

export default function ConsultaPage() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />

      <section className="py-10 text-white sm:py-16">
        <div className="container mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:gap-12">
          <div className="mx-auto w-full max-w-md md:mx-0 md:max-w-none">
            <h1 className="font-heading text-5xl leading-none text-white sm:text-6xl">
              Clases 1 a 1 <span className="block text-accent">con Richard</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-neutral-light">
              Entrenamiento personalizado, enfocado en tu salud y pensado para personas comunes. Escríbenos y
              coordinamos contigo el lugar, el horario y el precio.
            </p>

            <dl className="mt-8 rounded-2xl border border-dark-300 bg-dark-100">
              {filas.map((fila, i) => (
                <div
                  key={fila.etiqueta}
                  className={`flex items-baseline justify-between gap-4 px-5 py-4 ${
                    i > 0 ? 'border-t border-dark-300' : ''
                  }`}
                >
                  <dt className="shrink-0 text-sm text-neutral">{fila.etiqueta}</dt>
                  <dd className="text-right text-base font-medium">{fila.valor}</dd>
                </div>
              ))}
            </dl>

            <a
              href={enlaceWhatsapp(MENSAJE_CLASES_1A1)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6"
            >
              Escribir por WhatsApp
            </a>
            <p className="mt-3 text-center text-sm text-neutral">
              O escribe al <span className="whitespace-nowrap font-semibold text-white">{WHATSAPP_LEGIBLE}</span>.
            </p>
          </div>

          <div className="relative mx-auto aspect-[1319/1170] w-full max-w-md overflow-hidden rounded-2xl border border-dark-300 md:max-w-none">
            <Image
              src="/Richard.jpeg"
              alt="Richard Rodríguez con manoplas durante un entrenamiento"
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <Benefits />
      <Testimonials />
      <Footer />
    </main>
  )
}
