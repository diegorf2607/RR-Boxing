'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function AlertBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative z-50 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-2.5 text-white">
      <div className="container mx-auto flex items-center justify-center px-10 pr-12 text-center text-xs font-bold sm:text-sm">
        <span className="leading-snug">
          Hasta <span className="text-white">40% OFF</span> · el carrito no reserva stock
        </span>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/20 sm:right-3"
          aria-label="Cerrar banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
