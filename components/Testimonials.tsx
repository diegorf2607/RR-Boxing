'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'
import { MENSAJE_CLASES_1A1 } from '@/shared/config/clases'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'

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
    <article className="relative w-[min(78vw,280px)] flex-shrink-0 snap-center md:w-auto">
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-[#1A1A1A]">
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
            {/* Cuadrado negro con el triángulo, como los botones de la tienda: sin círculo ni sombra */}
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-tinta text-white transition-colors group-hover:bg-accent group-hover:text-tinta">
              <Play className="ml-1 h-7 w-7" fill="currentColor" aria-hidden />
            </span>
          </button>
        )}
      </div>
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex min-h-[44px] items-center text-[15px] font-semibold text-white underline underline-offset-[3px] hover:decoration-2"
      >
        Abrir en YouTube
      </a>
    </article>
  )
}

/** Los testimonios en video de /consulta, en una banda negra; en el celular se deslizan de costado. */
export default function Testimonials() {
  return (
    <section id="testimonios" className="bg-tinta py-12 text-white md:py-[72px]">
      <div className="contenedor">
        <h2 className="section-title max-w-4xl">
          Lo que cuentan <span className="text-accent">quienes entrenan con nosotros</span>
        </h2>
        <p className="section-subtitle">Personas que entrenan con RR Boxing cuentan su experiencia en video.</p>

        {/* En el celular se deslizan de costado: la tarjeta siguiente asoma a la derecha */}
        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-2 md:overflow-visible md:px-0 md:pb-0">
          {testimonials.map((t) => (
            <TestimonialShortCard key={t.videoId} item={t} />
          ))}
        </div>

        <div className="mt-10 max-w-md">
          <p className="text-[17px] leading-relaxed text-claro">
            ¿Quieres clases 1 a 1? Escríbenos por WhatsApp y te contamos cómo serían según tus objetivos y tu tiempo.
          </p>
          <a href={WHATSAPP_CLASES} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 sm:inline-flex sm:w-auto">
            <IconoWhatsapp />
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
