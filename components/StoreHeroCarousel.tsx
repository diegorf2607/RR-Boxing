'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { STORE_HERO_SLIDES } from '@/shared/config/store-hero-slides'

const AUTO_MS = 7000

export default function StoreHeroCarousel() {
  const slides = STORE_HERO_SLIDES
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + slides.length) % slides.length)
    },
    [slides.length]
  )

  const goTo = useCallback((index: number) => {
    setActive(index)
  }, [])

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length)
    }, AUTO_MS)
    return () => clearInterval(id)
  }, [paused, slides.length, active])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const wa = process.env.NEXT_PUBLIC_WHATSAPP_URL

  return (
    <section
      className="relative w-full overflow-hidden bg-dark"
      aria-roledescription="carrusel"
      aria-label="Destacados RRBOXING"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[min(88vh,820px)] w-full md:h-[min(85vh,760px)]">
        {slides.map((slide, index) => {
          const isActive = index === active
          const alignRight = slide.align === 'right'
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                isActive ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.imageUrl}
                alt=""
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
              <div
                className={`absolute inset-0 ${
                  alignRight
                    ? 'bg-gradient-to-l from-black/85 via-black/45 to-transparent'
                    : 'bg-gradient-to-r from-black/85 via-black/45 to-transparent'
                }`}
              />
              <div
                className={`absolute inset-0 flex items-center ${
                  alignRight ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`container mx-auto max-w-2xl px-5 pb-24 pt-16 md:px-8 md:pb-28 ${
                    alignRight ? 'text-right md:pr-16' : 'md:pl-16'
                  }`}
                >
                  <p className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.35em] text-accent/95">
                    {slide.eyebrow}
                  </p>
                  <h2
                    className="font-hero-script max-w-xl text-5xl font-semibold leading-[0.95] text-accent drop-shadow-lg sm:text-6xl md:text-7xl lg:text-8xl"
                  >
                    {slide.headline}
                  </h2>
                  <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-neutral-light md:text-lg">
                    {slide.text}
                  </p>
                  <div className={`mt-8 flex flex-wrap gap-3 ${alignRight ? 'justify-end' : ''}`}>
                    <Link
                      href={slide.href}
                      className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-dark shadow-lg shadow-accent/30 transition hover:bg-accent-light"
                    >
                      {slide.cta}
                    </Link>
                    <Link
                      href="/#catalogo"
                      className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-accent/60 hover:text-accent"
                    >
                      Ver tienda
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md transition hover:border-accent/50 hover:bg-black/60 md:left-4"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md transition hover:border-accent/50 hover:bg-black/60 md:right-4"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Indicadores + barra de progreso estilo ecommerce */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="h-1 w-full bg-white/15">
            <div
              key={`${active}-${paused ? 'p' : 'r'}`}
              className="h-full origin-left bg-accent"
              style={{
                animation: paused ? 'none' : `storeHeroProgress ${AUTO_MS}ms linear forwards`,
              }}
            />
          </div>
          <div className="flex justify-center gap-2 py-4">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-10 bg-accent' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Ir a slide ${i + 1}`}
                aria-current={i === active}
              />
            ))}
          </div>
        </div>

        {/* Insignia decorativa */}
        <div
          className="pointer-events-none absolute right-6 top-24 z-20 hidden md:block"
          aria-hidden
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent/80 bg-accent/10 text-2xl shadow-lg shadow-accent/20">
            ★
          </div>
        </div>
      </div>

      {/* Flotante: WhatsApp si hay URL; si no, contacto por consulta */}
      <div className="pointer-events-none fixed bottom-6 left-6 z-[60] flex flex-col gap-3">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition hover:scale-105"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-7 w-7" />
          </a>
        ) : (
          <Link
            href="/consulta"
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-accent/40 bg-dark/90 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:border-accent hover:text-accent"
          >
            <MessageCircle className="h-5 w-5 text-accent" />
            <span className="hidden sm:inline">Agenda tu clase</span>
          </Link>
        )}
      </div>
    </section>
  )
}
