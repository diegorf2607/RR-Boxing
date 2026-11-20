'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

const WHATSAPP_CLASES = enlaceWhatsapp('Hola, RR Boxing. Quiero información de las clases 1 a 1.')

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
    <article className="card relative w-[min(100%,280px)] flex-shrink-0 snap-center overflow-hidden p-0 md:w-auto">
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
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/60 text-white transition-colors group-hover:border-accent group-hover:text-accent">
              <Play className="ml-1 h-7 w-7" aria-hidden />
            </span>
          </button>
        )}
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 rounded bg-dark/90 px-2 py-1 text-[10px] font-medium text-accent underline-offset-2 hover:text-white md:text-xs"
        >
          Abrir en YouTube
        </a>
      </div>
    </article>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonios" className="bg-dark-100 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-center text-3xl font-bold italic md:text-4xl lg:text-5xl">
          Lo que cuentan
          <br />
          <span className="not-italic text-accent">quienes entrenan con nosotros</span>
        </h2>
        <p className="section-subtitle">Personas que entrenan con RR Boxing cuentan su experiencia en video.</p>

        <div className="mx-auto flex max-w-5xl snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {testimonials.map((t) => (
            <TestimonialShortCard key={t.videoId} item={t} />
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-neutral md:hidden">← Desliza para ver más →</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 px-2 text-center">
          <p className="max-w-md text-sm text-neutral-light">
            ¿Quieres clases 1 a 1? Escríbenos por WhatsApp y te contamos cómo serían según tus objetivos y tu tiempo.
          </p>
          <a
            href={WHATSAPP_CLASES}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-red-500/30 transition hover:scale-[1.02] hover:brightness-110"
          >
            Clases 1 a 1 por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
