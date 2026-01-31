import { Check, Lock } from 'lucide-react'
import Link from 'next/link'

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
    <section id="pricing" className="py-20 bg-dark">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="section-title">
          Únete al programa hoy
        </h2>
        <p className="section-subtitle">
          Inversión única con acceso de por vida. Descuento válido hasta el 2 de noviembre.
        </p>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-dark-100 border-2 border-accent rounded-3xl overflow-hidden shadow-2xl shadow-accent/10">
            {/* Badge */}
            <div className="bg-red-600 text-white text-center py-2 font-bold">
              50% OFF – Oferta de Pre-Lanzamiento
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Title */}
              <h3 className="text-2xl font-bold text-center mb-2">RR Boxing Academy</h3>
              <p className="text-neutral text-center mb-6">
                Curso completo de boxeo para principiantes
              </p>

              {/* Price */}
              <div className="text-center mb-8">
                <span className="text-2xl text-neutral line-through mr-3">$49.99</span>
                <span className="text-5xl font-bold text-accent">$24.99</span>
                <p className="text-neutral text-sm mt-2">USD – Pago único</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-neutral-light">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Security Badge */}
              <div className="bg-dark-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-bold text-white text-sm">Pago 100% seguro</p>
                  <p className="text-neutral text-xs">
                    Procesado por Stripe. Acceso inmediato después del pago.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="#"
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
              >
                Quiero unirme al curso ahora
              </Link>

              <p className="text-center text-neutral text-sm mt-4">
                Acceso inmediato • Pago único
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
