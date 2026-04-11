'use client'

import { Calendar, Sparkles, X } from 'lucide-react'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const handleConsulta = () => {
    window.location.href = '/consulta'
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} aria-hidden />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-dark-100 via-dark-200 to-dark-100 shadow-2xl shadow-accent/20 animate-fade-in-up">
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 text-center sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-yellow-600">
            <Sparkles className="h-8 w-8 text-dark" />
          </div>

          <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">Clases personalizadas RRBOXING</h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-300">
            El entrenamiento 1 a 1 no se vende con precio fijo en la web: en una llamada corta alineamos objetivos y te
            contamos opciones y valores.
          </p>

          <button
            type="button"
            onClick={handleConsulta}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-red-500/30 transition-transform hover:scale-[1.02]"
          >
            <Calendar className="h-5 w-5" />
            Reservar mi llamada
          </button>

          <button type="button" onClick={onClose} className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-white">
            Seguir en la tienda
          </button>
        </div>
      </div>
    </div>
  )
}
