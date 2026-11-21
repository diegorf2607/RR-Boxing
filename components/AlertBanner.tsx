'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { claseVigente } from '@/shared/lib/clase-virtual'

const ID_BARRA = 'barra-clase-virtual'

/**
 * Las páginas se generan de antemano, así que el servidor decide con la hora en que se armó la página.
 * Al hidratar, el navegador parte de lo mismo que pintó el servidor (si la barra está en el HTML, se
 * queda) para no dar error de hidratación; después el efecto vuelve a mirar la hora y la quita si la
 * clase ya terminó.
 */
function vigenciaInicial(): boolean {
  if (typeof document === 'undefined') return claseVigente()
  if (document.getElementById(ID_BARRA)) return true
  return claseVigente()
}

/** El aviso gris de arriba de todo, encima del menú negro: la clase virtual gratis y el enlace para inscribirse. */
export default function AlertBanner() {
  const [vigente, setVigente] = useState(vigenciaInicial)
  const [cerrada, setCerrada] = useState(false)

  useEffect(() => {
    if (!claseVigente()) setVigente(false)
  }, [])

  if (!vigente || cerrada) return null

  return (
    <div id={ID_BARRA} className="relative z-50 bg-gris text-tinta">
      <Link
        href="/clase"
        // Al menos 44 px de alto para el dedo; el texto va en un solo bloque para que siga en una línea corrida
        className="flex min-h-[44px] items-center justify-center px-12 py-2 text-center text-[13px] font-medium leading-snug transition-colors hover:bg-[#E6E6E6] sm:text-sm"
      >
        <span>
          <span className="sm:hidden">Clase virtual gratis: sáb 28 nov, 9 a. m. </span>
          <span className="hidden sm:inline">Clase virtual gratis: sábado 28 de noviembre, 9 a. m. (hora Perú). </span>
          <span className="font-bold underline underline-offset-[3px]">Inscríbete</span>
        </span>
      </Link>
      <button
        type="button"
        onClick={() => setCerrada(true)}
        // Toda la altura de la barra (44 px) y 44 px de ancho, para el dedo
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-suave hover:bg-[#E6E6E6] hover:text-tinta"
        aria-label="Cerrar aviso"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
