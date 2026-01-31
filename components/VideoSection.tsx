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
        </div>
      </div>
    </section>
  )
}
