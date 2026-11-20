'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

/**
 * Fotos del producto (solo las suyas). En el celular se deslizan con el dedo y los puntos de abajo dicen cuál se ve;
 * en escritorio, las miniaturas cambian la foto grande. Siempre enteras (contain) sobre blanco: las fotos de clientes
 * son verticales y se cortaban en el cuadrado.
 */
export default function GaleriaProducto({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const pista = useRef<HTMLDivElement>(null)
  const [activa, setActiva] = useState(0)
  const activaRef = useRef(activa)
  activaRef.current = activa
  const varias = imagenes.length > 1

  // Al deslizar, la foto que quedó a la vista es la activa
  useEffect(() => {
    const el = pista.current
    if (!el || !varias) return
    let cuadro = 0
    const medir = () => {
      cuadro = 0
      if (el.clientWidth > 0) setActiva(Math.round(el.scrollLeft / el.clientWidth))
    }
    const alDeslizar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir)
    }
    el.addEventListener('scroll', alDeslizar, { passive: true })
    return () => {
      el.removeEventListener('scroll', alDeslizar)
      if (cuadro) cancelAnimationFrame(cuadro)
    }
  }, [varias])

  // Si cambia el ancho (girar el celular, pasar a escritorio), la foto activa se queda en su lugar
  useEffect(() => {
    const el = pista.current
    if (!el || !varias || typeof ResizeObserver === 'undefined') return
    const ajustar = new ResizeObserver(() => {
      el.scrollTo({ left: activaRef.current * el.clientWidth })
    })
    ajustar.observe(el)
    return () => ajustar.disconnect()
  }, [varias])

  const ir = (i: number) => {
    setActiva(i)
    const el = pista.current
    if (!el) return
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: i * el.clientWidth, behavior: suave ? 'smooth' : 'auto' })
  }

  if (imagenes.length === 0) return null

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-dark-300 bg-white">
        <div
          ref={pista}
          className={`flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:aspect-square md:overflow-hidden [&::-webkit-scrollbar]:hidden ${
            varias ? '' : 'overflow-hidden'
          }`}
          aria-label={varias ? `Fotos de ${nombre}` : undefined}
          role={varias ? 'region' : undefined}
          tabIndex={varias ? 0 : undefined}
          onKeyDown={(e) => {
            if (!varias) return
            if (e.key === 'ArrowRight') ir(Math.min(imagenes.length - 1, activa + 1))
            if (e.key === 'ArrowLeft') ir(Math.max(0, activa - 1))
          }}
        >
          {imagenes.map((url, i) => (
            <div key={url} className="relative h-full w-full shrink-0 snap-center snap-always">
              <Image
                src={url}
                alt={varias ? `${nombre}, foto ${i + 1} de ${imagenes.length}` : nombre}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {varias ? (
        <>
          <div className="flex justify-center gap-2 md:hidden" aria-hidden>
            {imagenes.map((url, i) => (
              <span
                key={url}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${i === activa ? 'bg-accent' : 'bg-dark-400'}`}
              />
            ))}
          </div>
          <div className="hidden md:grid md:grid-cols-3 md:gap-3">
            {imagenes.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Ver la foto ${i + 1} de ${imagenes.length}`}
                aria-pressed={i === activa}
                className={`relative aspect-square overflow-hidden rounded-lg border bg-white transition ${
                  i === activa ? 'border-accent' : 'border-dark-300 opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={url} alt="" fill sizes="(min-width: 768px) 16vw, 20vw" className="object-contain" />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
