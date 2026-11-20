'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { STORE_HERO_SLIDES } from '@/shared/config/store-hero-slides'

const AUTO_MS = 7000

/** true si el foco llegó con el teclado (o por código), no con un toque o un clic */
function focoConTeclado(el: Element): boolean {
  try {
    return el.matches(':focus-visible')
  } catch {
    return true
  }
}

/**
 * Carrusel de la portada. Cambia solo cada 7 s, salvo que: el mouse esté encima, el foco del teclado esté adentro,
 * la persona lo haya pausado con «Pausar» o el sistema pida menos movimiento (ahí no gira ni anima nada). Los
 * destacados ocultos van con inert: sus enlaces no reciben el foco ni los lee el lector de pantalla. Las flechas
 * ← → cambian de destacado solo con el foco en los controles del carrusel (antes escuchaban en toda la página y
 * movían el carrusel al mover el cursor en el buscador).
 */
export default function StoreHeroCarousel() {
  const slides = STORE_HERO_SLIDES
  const [active, setActive] = useState(0)
  // paused: mouse encima o foco adentro (vuelve a girar al salir); detenido: la persona tocó «Pausar»
  const [paused, setPaused] = useState(false)
  const [detenido, setDetenido] = useState(false)
  const [menosMovimiento, setMenosMovimiento] = useState(false)

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + slides.length) % slides.length)
    },
    [slides.length]
  )

  const goTo = useCallback((index: number) => {
    setActive(index)
  }, [])

  // Si el sistema pide menos movimiento, el carrusel no gira solo
  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const leer = () => setMenosMovimiento(consulta.matches)
    leer()
    consulta.addEventListener('change', leer)
    return () => consulta.removeEventListener('change', leer)
  }, [])

  const gira = slides.length > 1 && !menosMovimiento
  const quieto = paused || detenido || !gira

  useEffect(() => {
    if (quieto) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length)
    }, AUTO_MS)
    return () => clearInterval(id)
  }, [quieto, slides.length, active])

  return (
    <section
      className="relative w-full overflow-hidden bg-dark"
      aria-roledescription="carrusel"
      aria-label="Destacados RR Boxing"
      // Solo el mouse pausa: en el celular un toque no trae «salida» y el carrusel quedaba pausado.
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setPaused(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setPaused(false)
      }}
      // Con el foco del teclado adentro no gira: el enlace enfocado no desaparece
      onFocus={(e) => {
        if (focoConTeclado(e.target)) setPaused(true)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false)
      }}
      // Las flechas, solo desde los controles (puntos, Pausar, Anterior y Siguiente): desde un enlace del destacado,
      // ese enlace quedaría oculto (inert) y el foco se caería al <body>
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        if ((e.target as HTMLElement).closest('[data-destacado]')) return
        go(e.key === 'ArrowLeft' ? -1 : 1)
      }}
    >
      {/* Más bajo que antes (era 88 % de la pantalla): en el celular ya asoma el catálogo debajo */}
      <div className="relative h-[min(56svh,520px)] w-full md:h-[min(60vh,560px)]">
        {slides.map((slide, index) => {
          const isActive = index === active
          const alignRight = slide.align === 'right'
          const enlaceCatalogo = slide.href === '#catalogo'
          return (
            <div
              key={slide.id}
              data-destacado
              ref={(el) => {
                if (el) el.inert = !isActive
              }}
              className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                isActive ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Las fotos verticales, en escritorio, van en la mitad derecha: no se cortan ni quedan bajo el texto */}
              <div className={`absolute inset-y-0 right-0 ${slide.vertical ? 'left-0 md:left-1/2' : 'left-0'}`}>
                <Image
                  src={slide.imageUrl}
                  alt=""
                  fill
                  priority={index === 0}
                  className="object-cover"
                  style={{ objectPosition: slide.encuadre ?? 'center' }}
                  sizes={slide.vertical ? '(min-width: 768px) 50vw, 100vw' : '100vw'}
                />
              </div>
              {/* En el celular el texto ocupa todo el ancho: la capa es pareja para que se lea sobre cualquier foto.
                  En escritorio sigue el degradado de antes, más oscuro, para que el texto pase 4,5:1. */}
              <div
                className={`absolute inset-0 bg-black/70 md:bg-transparent ${
                  alignRight
                    ? 'md:bg-gradient-to-l md:from-black/90 md:via-black/70 md:to-black/30'
                    : 'md:bg-gradient-to-r md:from-black/90 md:via-black/70 md:to-black/30'
                }`}
              />
              <div className="absolute inset-0 flex items-center">
                {/* La misma columna que el menú y el catálogo (max-w-6xl); entre md y xl deja lugar a las flechas */}
                <div className="container mx-auto max-w-6xl px-4 pb-14 pt-8 md:px-20 md:pb-16 xl:px-4">
                  <div className={`max-w-xl ${alignRight ? 'ml-auto text-right' : ''}`}>
                    <p className="mb-2 text-sm font-medium text-accent">{slide.eyebrow}</p>
                    <h2 className="font-heading text-5xl leading-[0.95] text-accent md:text-6xl">{slide.headline}</h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-light md:text-lg">
                      {slide.text}
                    </p>
                    <div className={`mt-6 flex flex-wrap gap-3 ${alignRight ? 'justify-end' : ''}`}>
                      {slide.href.startsWith('#') ? (
                        <a href={slide.href} className="btn-primary inline-flex w-auto items-center justify-center">
                          {slide.cta}
                        </a>
                      ) : (
                        <Link href={slide.href} className="btn-primary inline-flex w-auto items-center justify-center">
                          {slide.cta}
                        </Link>
                      )}
                      {/* «Ver tienda» solo donde el botón principal lleva a otra parte: dos botones al mismo lugar confunden */}
                      {!enlaceCatalogo ? (
                        <a
                          href="#catalogo"
                          className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:border-accent hover:text-accent"
                        >
                          Ver tienda
                        </a>
                      ) : null}
                    </div>
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
              className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-lg border border-white/20 bg-black/60 p-2.5 text-white transition-colors hover:border-accent hover:text-accent md:left-4 md:block"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-lg border border-white/20 bg-black/60 p-2.5 text-white transition-colors hover:border-accent hover:text-accent md:right-4 md:block"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Indicadores + barra de progreso estilo ecommerce */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="h-1 w-full bg-white/15 motion-reduce:hidden">
            <div
              key={`${active}-${quieto ? 'p' : 'r'}`}
              className="h-full origin-left bg-accent"
              style={{
                animation: quieto ? 'none' : `storeHeroProgress ${AUTO_MS}ms linear forwards`,
              }}
            />
          </div>
          <div className="flex items-center justify-center">
            {/* Cada punto tiene 44 px de alto para el dedo; la barrita se dibuja adentro. */}
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                className="group flex h-11 min-w-[32px] items-center justify-center px-1"
                aria-label={`Ir al destacado ${i + 1}`}
                aria-current={i === active}
              >
                <span
                  aria-hidden
                  className={`block h-1.5 rounded-full transition-all motion-reduce:transition-none ${
                    i === active ? 'w-10 bg-accent' : 'w-1.5 bg-white/40 group-hover:bg-white/60'
                  }`}
                />
              </button>
            ))}
            {/* Lo que se mueve solo por más de 5 s necesita una forma de detenerlo (WCAG 2.2.2) */}
            {gira ? (
              <button
                type="button"
                onClick={() => setDetenido((d) => !d)}
                className="flex h-11 items-center px-3 text-sm text-white underline underline-offset-2"
              >
                {detenido ? 'Reanudar' : 'Pausar'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
