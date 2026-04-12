'use client'

import { Play } from 'lucide-react'

/** Shorts de testimonio (IDs de youtube.com/shorts/...). */
const TESTIMONIAL_YOUTUBE_IDS: [string, string, string] = [
  'lJtlyW-hU1Y',
  'tvStTwBAYZw',
  'SWoRQDhuK3s',
]

function VerticalTestimonialFrame({ youtubeId, index }: { youtubeId: string | null; index: number }) {
  if (youtubeId) {
    return (
      <div className="relative mx-auto aspect-[9/16] w-full max-w-[min(100%,280px)] overflow-hidden rounded-2xl border border-dark-300 bg-black shadow-lg">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title={`Testimonio ${index + 1}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div
      className="relative mx-auto flex aspect-[9/16] w-full max-w-[min(100%,280px)] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-dark-300 bg-gradient-to-b from-dark-200/90 to-dark bg-dark-100"
      aria-hidden
    >
      <Play className="mb-3 h-14 w-14 text-accent/35" strokeWidth={1.25} />
      <p className="px-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-neutral">
        Video próximamente
      </p>
    </div>
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

        <div className="mx-auto flex max-w-6xl justify-start gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-3 md:justify-center md:gap-8 md:overflow-visible md:pb-0">
          {TESTIMONIAL_YOUTUBE_IDS.map((youtubeId, index) => (
            <article
              key={index}
              className="card flex w-[min(85vw,280px)] flex-shrink-0 snap-center justify-center border-dark-300 bg-dark-100/50 p-4 md:w-auto md:max-w-none md:p-5"
            >
              <VerticalTestimonialFrame youtubeId={youtubeId} index={index} />
            </article>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-neutral md:hidden">← Desliza para ver más →</p>
      </div>
    </section>
  )
}
