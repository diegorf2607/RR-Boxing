'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { HighTicketButton } from './CTAButtons'

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section className="py-12 md:py-20 bg-dark-100">
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
          <div className="mt-8 md:mt-10 text-center">
            <HighTicketButton size="lg" className="inline-flex items-center gap-3 rounded-xl p-4 md:p-6">
              <span className="text-2xl">🎯</span>
              <div className="text-left">
                <p className="text-base md:text-xl font-bold">
                  Quiero clases personalizadas
                </p>
                <p className="text-white/80 text-xs md:text-sm">
                  Agenda una llamada con Richard
                </p>
              </div>
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </HighTicketButton>
          </div>
        </div>
      </div>
    </section>
  )
}
