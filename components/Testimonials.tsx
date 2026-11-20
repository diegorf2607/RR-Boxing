'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'
import { MENSAJE_CLASES_1A1 } from '@/shared/config/clases'
import IconoWhatsapp from '@/components/legal/IconoWhatsapp'

/** El mismo mensaje que el botón de arriba en /consulta */
const WHATSAPP_CLASES = enlaceWhatsapp(MENSAJE_CLASES_1A1)

/** IDs extraídos de los enlaces youtube.com/shorts/… */
const testimonials = [
  {
    videoId: 'lJtlyW-hU1Y',
    href: 'https://youtube.com/shorts/lJtlyW-hU1Y?si=9BYIkmVoIvUbVK2f',
  },
  {
    videoId: 'tvStTwBAYZw',
    href: 'https://youtube.com/shorts/tvStTwBAYZw?si=FDsmxZdYvuICyYk4',
  },
  {
    videoId: 'SWoRQDhuK3s',
    href: 'https://youtube.com/shorts/SWoRQDhuK3s?si=Y6VkokLRn07_9Yiw',
  },
]

/**
 * Cada video empieza como una portada (la miniatura vertical del short, servida desde este sitio). El reproductor de
 * YouTube, que pesa cerca de 1 MB y deja cookies, se carga solo cuando la persona toca «Ver».
 */
function TestimonialShortCard({ item }: { item: (typeof testimonials)[0] }) {
  const [reproduciendo, setReproduciendo] = useState(false)
  const embedSrc = `https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&playsinline=1&rel=0`

  return (
    <article className="relative w-[min(78%,280px)] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-dark-100 md:w-auto">
      <div className="relative aspect-[9/16] w-full bg-dark-200">
        {reproduciendo ? (
          <iframe
            src={embedSrc}
            title="Testimonio de RR Boxing en YouTube"
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setReproduciendo(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label="Ver el testimonio en video"
          >
            <Image
              src={`https://i.ytimg.com/vi/${item.videoId}/oardefault.jpg`}
              alt=""
              fill
              sizes="(min-width: 768px) 320px, 280px"
              className="object-cover"
            />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-dark/80 text-white transition-colors group-hover:border-white group-hover:bg-dark motion-reduce:transition-none">
              <Play className="ml-1 h-7 w-7" aria-hidden />
            </span>
          </button>
        )}
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 left-3 inline-flex min-h-[44px] items-center rounded-md bg-dark/80 px-3 text-[13px] font-semibold text-white underline decoration-neutral underline-offset-4 hover:decoration-white"
        >
          Abrir en YouTube
        </a>
      </div>
    </article>
  )
}

/**
 * Testimonios en video, en la línea A: la cabecera de sección de la maqueta, las tres portadas en cajas con línea fina
 * (en el celular se deslizan de costado, como la galería de la ficha) y, al final, la caja de cierre de la maqueta
 * («¿Recién empiezas?» en la ficha) con el botón de WhatsApp.
 */
export default function Testimonials() {
  return (
    <section id="testimonios" className="seccion bg-dark">
      <div className="wrap">
        <div className="seccion-cab">
          <h2 className="section-title">Lo que cuentan quienes entrenan con nosotros</h2>
          <p>Personas que entrenan con RR Boxing cuentan su experiencia en video.</p>
        </div>

        {/* En el celular se deslizan de costado, de borde a borde: la tarjeta siguiente asoma a la derecha */}
        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {testimonials.map((t) => (
            <TestimonialShortCard key={t.videoId} item={t} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-5 rounded-2xl border border-line bg-dark-100 p-5 md:p-6">
          <div className="max-w-[36em]">
            <h3 className="font-heading text-[28px] leading-[0.95] text-white">¿Quieres clases 1 a 1?</h3>
            <p className="mt-2 text-neutral-light">
              Escríbenos por WhatsApp y te contamos cómo serían según tus objetivos y tu tiempo.
            </p>
          </div>
          <a href={WHATSAPP_CLASES} target="_blank" rel="noopener noreferrer" className="btn-primary sm:inline-flex sm:w-auto">
            <IconoWhatsapp />
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
