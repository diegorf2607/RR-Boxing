'use client'

import { Minus, Plus } from 'lucide-react'

/**
 * − 2 + : la cantidad con dos botones, como en el carrito. En el tope, el botón queda con aria-disabled y no con
 * disabled: un botón deshabilitado suelta el foco (cae al <body>) y quien usa teclado se queda fuera del carrito.
 */
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
  // Los dos tamaños miden 44 px para el dedo; el sm solo tiene el número más chico
  const boton =
    tamano === 'sm'
      ? 'flex h-11 w-11 items-center justify-center rounded-md'
      : 'flex h-11 w-11 items-center justify-center rounded-lg'
  const enMin = valor <= min
  const enMax = valor >= max
  const estilo = `${boton} text-neutral-light transition hover:bg-dark-200 hover:text-white aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent aria-disabled:hover:text-neutral-light`
  return (
    <div role="group" aria-label={etiqueta} className="inline-flex items-center rounded-xl border border-dark-300 bg-dark p-1">
      <button
        type="button"
        aria-disabled={enMin || undefined}
        onClick={() => {
          if (!enMin) onCambiar(Math.max(min, valor - 1))
        }}
        className={estilo}
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
        aria-disabled={enMax || undefined}
        onClick={() => {
          if (!enMax) onCambiar(Math.min(max, valor + 1))
        }}
        className={estilo}
        aria-label="Una unidad más"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
