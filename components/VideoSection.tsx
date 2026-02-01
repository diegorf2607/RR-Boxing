'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section className="py-20 bg-dark-100">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="section-title">
          ¿Qué aprenderás en este curso?
        </h2>
        <p className="section-subtitle">
          Mira el vídeo y descubre todo el contenido del programa.
        </p>

        {/* Video Container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-dark-200 to-dark-300 shadow-2xl">
            {!isPlaying ? (
              <>
                {/* Thumbnail/Placeholder */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1517438322307-e67111335449?q=80&w=2071')`,
                  }}
                >
                  <div className="absolute inset-0 bg-dark/60"></div>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-accent rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-accent/40">
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-dark ml-1" fill="currentColor" />
                  </div>
                </button>

                {/* Video Label */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <span className="text-accent text-sm md:text-base font-medium">
                    Video de presentación del curso
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-200">
                <p className="text-neutral">
                  [Video del curso - Integrar con YouTube/Vimeo]
                </p>
              </div>
            )}
          </div>

          {/* High Ticket CTA */}
          <div className="mt-10 text-center">
            <div className="inline-block relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 animate-pulse"></div>
              
              <a
                href="#personalizadas"
                className="relative block bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white rounded-2xl p-6 md:p-8 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/30"
              >
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <div className="text-4xl">🎯</div>
                  <div className="text-center md:text-left">
                    <p className="text-xl md:text-2xl font-bold mb-1">
                      ¿Quieres clases más personalizadas?
                    </p>
                    <p className="text-white/90 text-sm md:text-base">
                      Entrenamiento 1 a 1 con Richard Rodríguez • Resultados garantizados
                    </p>
                  </div>
                  <svg className="w-8 h-8 flex-shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
