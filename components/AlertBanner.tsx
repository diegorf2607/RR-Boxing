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
        <p className="font-medium text-center text-xs sm:text-sm md:text-base pr-6">
          <span className="hidden md:inline">⏰ Faltan 20 días para el lanzamiento oficial • </span>
          <span className="md:hidden">⏰ </span>
          <span className="font-bold">Aprovecha el 40% de descuento</span>
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
