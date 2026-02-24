'use client'

import { CourseButton, HighTicketButton } from './CTAButtons'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-2">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2070')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/85 to-dark"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
          Domina los Fundamentos
          <br />
          del Boxeo{' '}
          <span className="text-accent">en Solo 7 Días</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-neutral-light mb-10 animate-fade-in-up animate-delay-100">
          Sin gimnasio. Sin experiencia. Solo motivación.
        </p>

        {/* Price Box */}
        <div className="max-w-md mx-auto mb-8 animate-fade-in-up animate-delay-200">
          <div className="bg-dark-100/80 backdrop-blur-sm border-2 border-accent rounded-2xl p-6 md:p-8">
            <div className="bg-accent/20 text-accent text-sm font-bold py-2 px-4 rounded-full inline-block mb-4">
              Aprovecha el 40% de descuento por lanzamiento
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-neutral line-through text-xl">$79.99</span>
              <span className="text-4xl md:text-5xl font-bold text-accent">$47.99</span>
              <span className="text-neutral text-sm">USD</span>
            </div>

            <CourseButton size="lg" className="w-full flex items-center justify-center gap-2 text-lg">
              Inscríbete con descuento ahora
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </CourseButton>
          </div>
        </div>

        {/* High Ticket CTA */}
        <div className="mt-8 mb-16 md:mb-20 animate-fade-in-up animate-delay-400">
          <HighTicketButton size="lg" className="group inline-flex items-center gap-2 md:gap-3 py-3 px-6 md:py-4 md:px-8 rounded-full animate-pulse-slow">
            <span className="text-sm md:text-xl">🥊 Quiero clases personalizadas</span>
            <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </HighTicketButton>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce-slow">
        <div className="w-6 h-10 border-2 border-accent/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
