'use client'

import { CourseButton } from './CTAButtons'

export default function FinalCTA() {
  return (
    <section className="py-12 md:py-20 bg-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-yellow-600/40 via-amber-500/20 to-dark-100 rounded-3xl p-8 md:p-12 text-center border border-accent/40">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            ¿Listo para dar
            <br />
            tu primer golpe?
          </h2>
          
          <p className="text-neutral-light text-lg mb-8 max-w-xl mx-auto">
            Empieza hoy y entrena desde casa con RR Boxing Academy. Aprende las técnicas 
            correctas desde el principio y transforma tu condición física en solo 7 días.
          </p>

          <CourseButton size="lg" className="inline-flex items-center gap-2 text-lg bg-dark-300 text-white border border-accent/50 hover:bg-dark-200">
            Sí, quiero comenzar mi entrenamiento
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </CourseButton>

          <p className="text-neutral text-sm mt-6">
            Acceso inmediato • Pago único de $47.99 USD
          </p>
        </div>
      </div>
    </section>
  )
}
