'use client'

import { Minus, Plus } from 'lucide-react'

/**
 * − 2 + : la cantidad con dos botones dentro de un cuadro con línea gris, como en la ficha y el carrito. En el tope,
 * el botón queda con aria-disabled y no con disabled: un botón deshabilitado suelta el foco (cae al <body>) y quien usa
 * teclado se queda fuera del carrito.
 * - `md` (ficha): 52 px de alto. `sm` (carrito): 46 px. Los dos dejan botones de 44 px o más para el dedo.
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
  const chico = tamano === 'sm'
  const enMin = valor <= min
  const enMax = valor >= max
  const estilo = `flex shrink-0 items-center justify-center text-tinta transition-colors hover:bg-gris aria-disabled:cursor-not-allowed aria-disabled:text-[#9A9A9A] aria-disabled:hover:bg-transparent ${
    chico ? 'h-11 w-11' : 'h-[50px] w-[52px]'
  }`
  return (
    <div
      role="group"
      aria-label={etiqueta}
      className={`inline-flex items-center border border-linea-fuerte bg-white ${chico ? 'h-[46px]' : 'h-[52px]'}`}
    >
      <button
        type="button"
        aria-disabled={enMin || undefined}
        onClick={() => {
          if (!enMin) onCambiar(Math.max(min, valor - 1))
        }}
        className={estilo}
        aria-label="Una unidad menos"
      >
        <Minus className={chico ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={2} aria-hidden />
      </button>
      <span
        className={`${chico ? 'min-w-[2rem] text-[15px]' : 'min-w-[2.5rem] text-base'} text-center font-bold tabular-nums`}
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
        <Plus className={chico ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={2} aria-hidden />
      </button>
    </div>
  )
}
