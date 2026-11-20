'use client'

import { Minus, Plus } from 'lucide-react'

/**
 * − 2 + : la cantidad con dos botones, como la caja «Cantidad» de la maqueta de la línea A (borde marcado de 10 px,
 * sin fondo). En el tope, el botón queda con aria-disabled y no con disabled: un botón deshabilitado suelta el foco (cae
 * al <body>) y quien usa teclado se queda fuera del carrito.
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
  // md: 48 px, como la maqueta; sm (carrito): 44 px, lo mínimo para el dedo
  const boton = tamano === 'sm' ? 'h-11 w-11' : 'h-12 w-12'
  const enMin = valor <= min
  const enMax = valor >= max
  const estilo = `${boton} flex items-center justify-center rounded-[9px] text-white transition-colors hover:bg-dark-200 motion-reduce:transition-none aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent`
  return (
    <div role="group" aria-label={etiqueta} className="inline-flex items-center rounded-lg border border-dark-400">
      <button
        type="button"
        aria-disabled={enMin || undefined}
        onClick={() => {
          if (!enMin) onCambiar(Math.max(min, valor - 1))
        }}
        className={estilo}
        aria-label="Una unidad menos"
      >
        <Minus className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
      <span
        className={`${tamano === 'sm' ? 'min-w-[2rem] text-[15px]' : 'min-w-[2.25rem] text-base'} text-center font-semibold tabular-nums text-white`}
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
        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  )
}
