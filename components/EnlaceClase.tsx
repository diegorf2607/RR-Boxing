'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { claseVigente } from '@/shared/lib/clase-virtual'

/**
 * true mientras la clase virtual no haya terminado. Arranca con `inicial` (lo que calculó el servidor,
 * o true) para que el HTML del servidor y el primer render del navegador coincidan, y al cargar se
 * apaga si la clase ya pasó (por si la página se armó antes de la clase).
 */
export function useClaseVigente(inicial = true): boolean {
  const [vigente, setVigente] = useState(inicial)

  useEffect(() => {
    if (!claseVigente()) setVigente(false)
  }, [])

  return vigente
}

/** Muestra `abierta` mientras la clase siga vigente y `cerrada` cuando ya terminó. */
export function SegunClaseVigente({
  inicial,
  abierta,
  cerrada,
}: {
  inicial: boolean
  abierta: ReactNode
  cerrada: ReactNode
}) {
  const vigente = useClaseVigente(inicial)
  return <>{vigente ? abierta : cerrada}</>
}

/** Enlace a /clase que desaparece cuando la clase virtual ya terminó. */
export default function EnlaceClase({ className, children }: { className?: string; children: ReactNode }) {
  const vigente = useClaseVigente()
  if (!vigente) return null

  return (
    <Link href="/clase" className={className}>
      {children}
    </Link>
  )
}
