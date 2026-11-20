'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

/**
 * Las fotos de los clientes (no son fotos de catálogo): se reconocen por el nombre del archivo («Guantes WSD CLIENTE
 * 3.jpeg»). Van sobre gris oscuro y sin fundirse con el fondo claro, que es solo para las fotos con fondo blanco.
 */
const esFotoDeCliente = (url: string) => {
  try {
    return /cliente/i.test(decodeURIComponent(url))
  } catch {
    return /cliente/i.test(url)
  }
}

/**
 * Fotos del producto (solo las suyas), como la galería de la maqueta de la línea A: la foto grande sobre el gris claro
 * (.tile, el blanco de la foto se funde con él) y debajo las miniaturas, también en el celular. En el celular la foto va
 * de borde a borde y se desliza con el dedo; desde 900 px es un cuadrado con bordes redondeados y la cambian las
 * miniaturas (o las flechas del teclado). Siempre enteras (contain): las fotos de clientes son verticales y se cortaban
 * en el cuadrado.
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
    // En el celular, de borde a borde: el margen negativo deshace el margen lateral del contenedor (.wrap)
    <div className="-mx-[var(--gut)] min-[900px]:mx-0">
      <div
        ref={pista}
        className={`flex aspect-[5/4] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] sm:aspect-[3/2] min-[900px]:aspect-square min-[900px]:overflow-hidden min-[900px]:rounded-2xl [&::-webkit-scrollbar]:hidden ${
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
        {imagenes.map((url, i) => {
          const deCliente = esFotoDeCliente(url)
          return (
            <div
              key={url}
              className={`relative h-full w-full shrink-0 snap-start snap-always ${deCliente ? 'bg-dark-200' : 'tile'}`}
            >
              <Image
                src={url}
                alt={varias ? `${nombre}, foto ${i + 1} de ${imagenes.length}` : nombre}
                fill
                priority={i === 0}
                sizes="(min-width: 1280px) 600px, (min-width: 900px) 50vw, 100vw"
                className={deCliente ? 'object-contain' : 'object-contain p-[6%]'}
              />
            </div>
          )
        })}
      </div>

      {varias ? (
        <div className="mt-3 flex gap-2.5 px-[var(--gut)] min-[900px]:px-0">
          {imagenes.map((url, i) => {
            const deCliente = esFotoDeCliente(url)
            return (
              <button
                key={url}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Ver la foto ${i + 1} de ${imagenes.length}`}
                aria-pressed={i === activa}
                className={`relative aspect-square w-14 shrink-0 overflow-hidden rounded-lg border border-dark-400 min-[900px]:w-[84px] ${
                  deCliente ? 'bg-dark-200' : 'tile'
                } ${i === activa ? 'outline outline-2 outline-offset-2 outline-white' : ''} focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-accent`}
              >
                <Image src={url} alt="" fill sizes="84px" className="object-cover" />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
