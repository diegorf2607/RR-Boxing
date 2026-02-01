'use client'

import { CheckCircle, Star, Users, Calendar, MessageCircle } from 'lucide-react'
import Link from 'next/link'

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
    <section id="personalizadas" className="py-20 bg-dark relative overflow-hidden">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-dark-100/80 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 text-center hover:border-red-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-neutral">{feature.description}</p>
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
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white text-center py-4">
                <p className="font-bold text-lg">🔥 CUPOS LIMITADOS - Solo 10 alumnos por mes</p>
              </div>

              {/* Content */}
              <div className="p-8">
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
                <Link
                  href="https://wa.me/51986964194?text=Hola%20Richard,%20quiero%20información%20sobre%20las%20clases%20personalizadas"
                  target="_blank"
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:via-red-400 hover:to-orange-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/30 text-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Quiero más información por WhatsApp
                </Link>

                <p className="text-center text-neutral text-sm mt-4">
                  Respuesta en menos de 24 horas • Sin compromiso
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
