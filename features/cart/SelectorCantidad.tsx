'use client'

import { Minus, Plus } from 'lucide-react'

/** − 2 + : la cantidad con dos botones, como en el carrito. */
export default function SelectorCantidad({
  valor,
  min = 1,
  max,
  onCambiar,
  etiqueta = 'Cantidad',
  tamano = 'md',
}: {
  valor: number
  min?: number
  max: number
  onCambiar: (valor: number) => void
  /** Para lectores de pantalla: «Cantidad de Guantes de boxeo (Negro)» */
  etiqueta?: string
  tamano?: 'sm' | 'md'
}) {
  const boton =
    tamano === 'sm'
      ? 'flex h-8 w-8 items-center justify-center rounded-md'
      : 'flex h-11 w-11 items-center justify-center rounded-lg'
  return (
    <div role="group" aria-label={etiqueta} className="inline-flex items-center rounded-xl border border-dark-300 bg-dark p-1">
      <button
        type="button"
        disabled={valor <= min}
        onClick={() => onCambiar(Math.max(min, valor - 1))}
        className={`${boton} text-neutral-light transition hover:bg-dark-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Una unidad menos"
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <span
        className={`${tamano === 'sm' ? 'min-w-[2rem] text-sm' : 'min-w-[2.75rem] text-base'} text-center font-bold tabular-nums text-white`}
        aria-live="polite"
      >
        {valor}
      </span>
      <button
        type="button"
        disabled={valor >= max}
        onClick={() => onCambiar(Math.min(max, valor + 1))}
        className={`${boton} text-neutral-light transition hover:bg-dark-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Una unidad más"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
