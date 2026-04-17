'use client'

import Link from 'next/link'

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

function TestimonialShortCard({ item }: { item: (typeof testimonials)[0] }) {
  const embedSrc = `https://www.youtube.com/embed/${item.videoId}`

  return (
    <article className="card relative w-[min(100%,280px)] flex-shrink-0 snap-center overflow-hidden p-0 md:w-auto">
      <div className="relative aspect-[9/16] w-full bg-dark-200">
        <iframe
          src={embedSrc}
          title={`Testimonio RRBOXING en YouTube (${item.videoId})`}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
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
          Quiénes respaldan
          <br />
          <span className="not-italic text-accent">las clases y el método</span>
        </h2>
        <p className="section-subtitle">
          Personas reales que entrenan con la visión RRBOXING: comunidad, técnica y, cuando aplica, acompañamiento 1 a 1.
        </p>

        <div className="mx-auto flex max-w-5xl snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {testimonials.map((t) => (
            <TestimonialShortCard key={t.videoId} item={t} />
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-neutral md:hidden">← Desliza para ver más →</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 px-2 text-center">
          <p className="max-w-md text-sm text-neutral-light">
            ¿Listo para hablar de objetivos, disponibilidad y cómo encajan las clases 1 a 1 con vos?
          </p>
          <Link
            href="/consulta"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-red-500/30 transition hover:scale-[1.02] hover:brightness-110"
          >
            Reservar mi llamada
          </Link>
        </div>
      </div>
    </section>
  )
}
