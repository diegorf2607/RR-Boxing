'use client'

import { useState } from 'react'
import { Clock, X } from 'lucide-react'

export default function AlertBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-red-500 text-white py-2.5 px-4 relative z-50">
      <div className="container mx-auto flex items-center justify-center gap-3 text-sm md:text-base">
        <Clock className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
        <p className="font-medium text-center">
          <span className="hidden sm:inline">⏰ Faltan 0d 0h 0m 0s para el lanzamiento oficial</span>
          <span className="sm:hidden">⏰ ¡Últimos días!</span>
          <span className="mx-2">•</span>
          <span className="font-bold">Aprovecha el descuento antes del 2 de noviembre</span>
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Cerrar banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
