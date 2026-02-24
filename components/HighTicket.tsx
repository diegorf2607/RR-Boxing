'use client'

import { CheckCircle, Star, Users, Calendar, MessageCircle } from 'lucide-react'
import { HighTicketButton } from './CTAButtons'

const features = [
  {
    icon: Users,
    title: 'Entrenamiento 1 a 1',
    description: 'Sesiones privadas en vivo con Richard Rodríguez',
  },
  {
    icon: Calendar,
    title: 'Horarios flexibles',
    description: 'Agenda tus clases cuando mejor te convenga',
  },
  {
    icon: MessageCircle,
    title: 'Soporte directo',
    description: 'WhatsApp directo con tu entrenador',
  },
]

const benefits = [
  'Plan de entrenamiento 100% personalizado',
  'Corrección de técnica en tiempo real',
  'Seguimiento semanal de tu progreso',
  'Acceso al curso online incluido',
  'Videos de tus sesiones para practicar',
  'Comunidad VIP de alumnos premium',
]

export default function HighTicket() {
  return (
    <section id="personalizadas" className="py-12 md:py-20 bg-dark relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-dark to-orange-900/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm font-bold py-2 px-6 rounded-full">
            <Star className="w-4 h-4 fill-white" />
            PROGRAMA PREMIUM
            <Star className="w-4 h-4 fill-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
          Clases{' '}
          <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Personalizadas
          </span>
        </h2>
        <p className="text-neutral-light text-center max-w-2xl mx-auto mb-12 text-lg">
          ¿Quieres resultados más rápidos? Entrena directamente conmigo en sesiones 
          privadas y lleva tu boxeo al siguiente nivel.
        </p>

        {/* Features Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mb-8 md:mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-dark-100/80 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 md:p-6 text-center hover:border-red-500/60 transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-1 text-white">{feature.title}</h3>
              <p className="text-neutral text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-3xl blur-lg opacity-30"></div>
            
            <div className="relative bg-dark-100 border-2 border-red-500/50 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white text-center py-3 px-4">
                <p className="font-bold text-sm md:text-lg">🔥 CUPOS LIMITADOS - Solo 10 alumnos por mes</p>
              </div>

              {/* Content */}
              <div className="p-5 md:p-8">
                <h3 className="text-2xl font-bold text-center mb-2">Entrenamiento Personal VIP</h3>
                <p className="text-neutral text-center mb-8">
                  Programa completo de 4 semanas con Richard Rodríguez
                </p>

                {/* Benefits List */}
                <ul className="space-y-3 mb-8">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-red-600 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-neutral-light">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <HighTicketButton size="lg" className="w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-4 md:px-8 text-sm md:text-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Agendar mi llamada con Richard
                </HighTicketButton>

                <p className="text-center text-neutral text-sm mt-4">
                  Llamada de 30 minutos gratis • Sin compromiso
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
