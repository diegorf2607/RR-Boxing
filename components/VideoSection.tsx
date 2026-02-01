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
                    backgroundImage: `url('https://img.youtube.com/vi/vO3AeRbPqM0/maxresdefault.jpg')`,
                  }}
                >
                  <div className="absolute inset-0 bg-dark/40"></div>
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
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/vO3AeRbPqM0?autoplay=1&rel=0"
                title="RR Boxing Academy - Video de presentación"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>

          {/* High Ticket CTA */}
          <div className="mt-10 text-center">
            <div className="inline-block relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 animate-pulse"></div>
              
              <a
                href="#personalizadas"
                className="relative block bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:via-red-400 hover:to-orange-400 text-white rounded-2xl p-6 md:p-8 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/30"
              >
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <div className="text-4xl">🎯</div>
                  <div className="text-center md:text-left">
                    <p className="text-xl md:text-2xl font-bold mb-1">
                      Quiero clases más personalizadas
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
