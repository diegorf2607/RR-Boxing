'use client'

import { Star, Quote } from 'lucide-react'

/** Mismos nombres que subiste; deben vivir en `public/clases-personalizadas/` (no en `app/`). */
const TESTIMONIAL_VIDEOS = [
  'WhatsApp Video 2026-04-11 at 5.16.18 PM.mp4',
  'WhatsApp Video 2026-04-11 at 5.16.26 PM.mp4',
  'WhatsApp Video 2026-04-11 at 5.16.33 PM.mp4',
] as const

function testimonialVideoSrc(filename: string) {
  return `/clases-personalizadas/${encodeURIComponent(filename)}`
}

const testimonials = [
  {
    name: 'Carlos M.',
    age: 29,
    rating: 5,
    quote:
      'Llevaba años sin deporte. Con RRBOXING entendí la técnica desde cero y en las clases 1 a 1 me corrigen cosas que en un gimnasio general ni miran.',
    videoFile: TESTIMONIAL_VIDEOS[0],
  },
  {
    name: 'Laura P.',
    age: 26,
    rating: 5,
    quote:
      'Sigo el contenido en redes hace tiempo; reservé la llamada y el plan personalizado me encajó con mi trabajo. Se nota que hay método detrás.',
    videoFile: TESTIMONIAL_VIDEOS[1],
  },
  {
    name: 'Diego S.',
    age: 33,
    rating: 5,
    quote:
      'Ya boxeaba pero quería técnica fina. La combinación de lo que comparten online más el seguimiento directo me subió un nivel.',
    videoFile: TESTIMONIAL_VIDEOS[2],
  },
]

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

        <div className="mx-auto flex max-w-5xl gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {testimonials.map((t, index) => (
            <article
              key={index}
              className="card relative w-[300px] flex-shrink-0 snap-center overflow-hidden p-0 md:w-auto"
            >
              <div className="relative h-44 w-full bg-dark md:h-52">
                <video
                  className="h-full w-full object-cover"
                  src={testimonialVideoSrc(t.videoFile)}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Video testimonio de ${t.name}`}
                />
                <Quote
                  className="pointer-events-none absolute right-3 top-3 z-10 h-8 w-8 text-accent/80 drop-shadow-md"
                  aria-hidden
                />
              </div>
              <div className="p-4 md:p-5">
                <div className="mb-2 flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-neutral-light">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-bold text-white">{t.name}</p>
                <p className="text-sm text-neutral">{t.age} años · Alumno RRBOXING</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-neutral md:hidden">← Desliza para ver más →</p>
      </div>
    </section>
  )
}
