'use client'

import { Check, Lock } from 'lucide-react'
import { CourseButton } from './CTAButtons'

const features = [
  '7 días de contenido estructurado',
  'Acceso de por vida a todas las clases',
  'Videos en alta calidad',
  'Entrena a tu propio ritmo',
  'Acceso desde cualquier dispositivo',
  'Actualizaciones gratuitas del curso',
  'Comunidad privada de alumnos',
  'Certificado de finalización',
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-12 md:py-20 bg-dark">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="section-title">
          Únete al programa hoy
        </h2>
        <p className="section-subtitle">
          Inversión única con acceso de por vida. Descuento válido por tiempo limitado.
        </p>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-dark-100 border-2 border-accent rounded-3xl overflow-hidden shadow-2xl shadow-accent/10">
            {/* Badge */}
            <div className="bg-red-600 text-white text-center py-2 font-bold">
              40% OFF – Oferta de Pre-Lanzamiento
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title & Price Row */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold">RR Boxing Academy</h3>
                  <p className="text-neutral text-sm">Curso completo de boxeo para principiantes</p>
                </div>
                <div className="text-center md:text-right">
                  <span className="text-lg text-neutral line-through mr-2">$79.99</span>
                  <span className="text-3xl font-bold text-accent">$47.99</span>
                  <p className="text-neutral text-xs">USD – Pago único</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-neutral-light text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Security Badge */}
              <div className="bg-dark-200 rounded-lg p-3 mb-4 flex items-center gap-3">
                <Lock className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-bold text-white text-xs">Pago 100% seguro</p>
                  <p className="text-neutral text-xs">Procesado por Stripe. Acceso inmediato.</p>
                </div>
              </div>

              {/* CTA Button */}
              <CourseButton size="lg" className="w-full flex items-center justify-center gap-2 text-base py-3">
                Quiero unirme al curso ahora
              </CourseButton>

              <p className="text-center text-neutral text-xs mt-3">
                Acceso inmediato • Pago único
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
