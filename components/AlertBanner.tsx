'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { CLASE, claseVigente } from '@/shared/lib/clase-virtual'

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

export default function AlertBanner() {
  const [vigente, setVigente] = useState(vigenciaInicial)
  const [cerrada, setCerrada] = useState(false)

  useEffect(() => {
    if (!claseVigente()) setVigente(false)
  }, [])

  if (!vigente || cerrada) return null

  return (
    <div id={ID_BARRA} className="relative z-50 bg-red-600 text-white">
      <Link
        href="/clase"
        className="block px-10 py-2.5 text-center text-xs font-medium leading-snug transition-colors hover:bg-red-700 sm:text-sm"
      >
        <span className="sm:hidden">Clase virtual gratis: sáb 28 nov, 9 a. m. · </span>
        <span className="hidden sm:inline">
          Clase virtual gratis: sábado 28 de noviembre, 9 a. m. (hora Perú) ·{' '}
        </span>
        <span className="font-semibold underline underline-offset-2">Inscríbete</span>
      </Link>
      <button
        type="button"
        onClick={() => setCerrada(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-white/20 sm:right-3"
        aria-label="Cerrar aviso"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
