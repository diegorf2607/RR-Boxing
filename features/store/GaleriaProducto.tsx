'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { datosDeFoto } from '@/shared/config/fotos-producto'

/** Desde aquí las fotos van en grilla de dos columnas; antes, en fila para deslizar con el dedo. */
const GRILLA = '(min-width: 1024px)'

/**
 * Fotos del producto, todas sobre gris claro: las del producto solo, enteras (contain) y con el blanco fundido en el
 * gris; las de ambiente (en uso, de una alumna), llenando el cuadro. En escritorio van en una grilla de dos columnas
 * (si son impares, la primera ocupa las dos). En el celular y la tableta se deslizan con el dedo, la siguiente asoma
 * a la derecha, y las rayitas de abajo dicen cuál se ve; con el teclado, las flechas pasan de una a otra.
 */
export default function GaleriaProducto({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const pista = useRef<HTMLDivElement>(null)
  const [activa, setActiva] = useState(0)
  const [enGrilla, setEnGrilla] = useState(false)
  const varias = imagenes.length > 1
  const impar = imagenes.length % 2 === 1

  // En la grilla no hay nada que deslizar: la fila deja de ser una región con foco
  useEffect(() => {
    const consulta = window.matchMedia(GRILLA)
    const alCambiar = () => setEnGrilla(consulta.matches)
    alCambiar()
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  /** La foto cuyo centro está más cerca del centro de la fila */
  const medir = useCallback(() => {
    const el = pista.current
    if (!el) return
    const centro = el.scrollLeft + el.clientWidth / 2
    let mejor = 0
    let distancia = Infinity
    Array.from(el.children).forEach((hijo, i) => {
      const h = hijo as HTMLElement
      const d = Math.abs(h.offsetLeft + h.offsetWidth / 2 - centro)
      if (d < distancia) {
        distancia = d
        mejor = i
      }
    })
    setActiva(mejor)
  }, [])

  // Al deslizar, la foto que quedó a la vista es la activa
  useEffect(() => {
    const el = pista.current
    if (!el || !varias) return
    let cuadro = 0
    const alDeslizar = () => {
      if (!cuadro)
        cuadro = requestAnimationFrame(() => {
          cuadro = 0
          medir()
        })
    }
    el.addEventListener('scroll', alDeslizar, { passive: true })
    return () => {
      el.removeEventListener('scroll', alDeslizar)
      if (cuadro) cancelAnimationFrame(cuadro)
    }
  }, [varias, medir])

  const ir = (i: number) => {
    const el = pista.current
    const hijo = el?.children[i] as HTMLElement | undefined
    if (!el || !hijo) return
    setActiva(i)
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: hijo.offsetLeft - (el.clientWidth - hijo.offsetWidth) / 2, behavior: suave ? 'smooth' : 'auto' })
  }

  if (imagenes.length === 0) return null
  const deslizable = varias && !enGrilla

  return (
    <div>
      <div
        ref={pista}
        className="relative -mx-4 flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] md:-mx-6 md:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-2 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
        aria-label={deslizable ? `Fotos de ${nombre}. Usa las flechas para pasar de una a otra.` : `Fotos de ${nombre}`}
        role="region"
        tabIndex={deslizable ? 0 : undefined}
        onKeyDown={(e) => {
          if (!deslizable) return
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            ir(Math.min(imagenes.length - 1, activa + 1))
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            ir(Math.max(0, activa - 1))
          }
        }}
      >
        {imagenes.map((url, i) => {
          const datos = datosDeFoto(url)
          const ambiente = datos?.tipo === 'ambiente'
          const ancha = i === 0 && impar
          return (
            <figure
              key={url}
              className={`relative aspect-square shrink-0 snap-center overflow-hidden bg-gris lg:basis-auto ${
                varias ? 'basis-[86%] md:basis-[55%]' : 'basis-full'
              } ${ancha ? 'lg:col-span-2' : ''}`}
            >
              <Image
                src={url}
                alt={datos?.alt ?? (varias ? `${nombre}, foto ${i + 1} de ${imagenes.length}` : nombre)}
                fill
                priority={i === 0}
                sizes={ancha ? '(min-width: 1024px) 54vw, (min-width: 768px) 55vw, 86vw' : '(min-width: 1024px) 27vw, (min-width: 768px) 55vw, 86vw'}
                className={ambiente ? 'object-cover' : 'object-contain mix-blend-multiply'}
              />
            </figure>
          )
        })}
      </div>

      {varias ? (
        <div className="relative z-10 -mt-2 flex justify-center gap-1 lg:hidden" aria-hidden>
          {imagenes.map((url, i) => (
            <span key={url} className={`h-[3px] w-5 transition-colors ${i === activa ? 'bg-tinta' : 'bg-[#D0D0D0]'}`} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
