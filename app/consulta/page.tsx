import type { Metadata } from 'next'
import Image from 'next/image'
import MainNav from '@/components/MainNav'
import Benefits from '@/components/Benefits'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import { enlaceWhatsapp, WHATSAPP_LEGIBLE } from '@/shared/lib/whatsapp'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
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
    <>
      <MainNav />
      <main>
        {/* Como «Clases 1 a 1» de la portada: la foto de Richard a la izquierda y el texto a la derecha (en el celular,
            el texto primero) */}
        <section className="py-10 md:py-[72px]">
          <div className="contenedor grid items-center gap-8 md:grid-cols-2 md:gap-14">
            <div className="md:order-2">
              <h1 className="font-heading text-[64px] leading-[0.9] md:text-[80px] xl:text-[96px]">
                Clases 1 a 1 <span className="block">con Richard</span>
              </h1>

              <p className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-tinta-2 md:text-[19px]">
                Entrenamiento personalizado, enfocado en tu salud y pensado para personas comunes. Escríbenos y
                coordinamos contigo el lugar, el horario y el precio.
              </p>

              <dl className="filas mt-7 max-w-[520px]">
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
                className="btn-negro mt-7 md:inline-flex md:w-auto"
              >
                <IconoWhatsapp />
                Escribir por WhatsApp
              </a>
              <p className="mt-3 text-[15px] text-tinta-2">
                O escribe al <span className="whitespace-nowrap font-semibold text-tinta">{WHATSAPP_LEGIBLE}</span>.
              </p>
            </div>

            <div className="relative aspect-[5/4] w-full overflow-hidden bg-gris md:order-1">
              <Image
                src="/Richard.jpeg"
                alt="Richard Rodríguez con manoplas durante un entrenamiento"
                fill
                priority
                sizes="(min-width: 1320px) 636px, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <Benefits />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}
