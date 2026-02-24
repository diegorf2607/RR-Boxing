'use client'

import { useState, useEffect, useRef } from 'react'
import { Lock, Calendar, CheckCircle } from 'lucide-react'

export default function VideoGatedCalendly() {
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Countdown starts automatically on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsUnlocked(true)
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return {
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    }
  }

  const time = formatTime(timeRemaining)

  return (
    <section className="min-h-screen bg-gradient-to-b from-dark via-dark-100 to-dark py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent text-sm font-medium py-2 px-4 rounded-full mb-4">
            <Calendar className="w-4 h-4" />
            Llamada de Consultoria GRATIS
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Clases Personalizadas <span className="text-accent">1 a 1</span>
          </h1>
          <p className="text-neutral-light text-lg max-w-2xl mx-auto">
            Mira el video completo para desbloquear tu agenda con Richard
          </p>
        </div>

        {/* Video YouTube — autoplay */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-dark-400">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/vO3AeRbPqM0?autoplay=1&mute=1&rel=0&modestbranding=1"
              title="RR Boxing Academy – Video de presentación"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Countdown Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-dark-100 border border-dark-400 rounded-2xl p-6 text-center">
            <p className="text-neutral-light mb-4 text-base md:text-lg">
              {isUnlocked
                ? '¡Ya puedes agendar tu llamada!'
                : '(El siguiente paso se desbloqueará cuando el cronómetro llegue a cero)'
              }
            </p>

            <div className="flex items-center justify-center gap-4 md:gap-8">
              {/* Horas */}
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-bold text-dark-300 tabular-nums">0</span>
                <span className="text-sm text-neutral mt-1">horas</span>
              </div>

              {/* Minutos */}
              <div className="flex flex-col items-center">
                <span className={`text-4xl md:text-5xl font-bold tabular-nums ${isUnlocked ? 'text-green-500' : 'text-accent'}`}>
                  {time.minutes}
                </span>
                <span className="text-sm text-neutral mt-1">minutos</span>
              </div>

              {/* Segundos */}
              <div className="flex flex-col items-center">
                <span className={`text-4xl md:text-5xl font-bold tabular-nums ${isUnlocked ? 'text-green-500' : 'text-accent'}`}>
                  {time.seconds}
                </span>
                <span className="text-sm text-neutral mt-1">segundos</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 max-w-md mx-auto">
              <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-green-500' : 'bg-accent'}`}
                  style={{ width: `${((60 - timeRemaining) / 60) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calendly Section */}
        <div className="max-w-5xl mx-auto">
          <div className={`relative transition-all duration-500 ${!isUnlocked ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Lock overlay */}
            {!isUnlocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark/60 backdrop-blur-sm rounded-2xl">
                <div className="text-center">
                  <Lock className="w-16 h-16 text-neutral mx-auto mb-4" />
                  <p className="text-neutral-light text-lg font-medium">
                    Mira el video para desbloquear
                  </p>
                </div>
              </div>
            )}

            {/* Calendly Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="text-center py-4 border-b border-gray-200">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Agenda Una Llamada
                </h2>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-8 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-800 font-medium">Llene el formulario</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-400">Reserva tu evento</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left - Form Info */}
                <div className="p-6 md:p-8 border-r border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    Llamada de Consultoria |
                  </h3>
                  <p className="text-blue-600 font-semibold mb-4">RR Boxing Academy</p>

                  <p className="text-gray-600 mb-6">
                    3 puntos <span className="font-bold">IMPORTANTES</span> antes de agendar
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">Te contactaremos por WhatsApp</span> para confirmar tu sesión.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <p className="text-gray-600">
                        Recibimos +20 solicitudes diarias y priorizamos a personas realmente comprometidas. Conéctate desde una <span className="font-semibold text-gray-800">computadora</span> en un <span className="font-semibold text-gray-800">lugar tranquilo</span> (no un carro o un restaurante)
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">Respeto mutuo:</span> Si aplicas con seriedad, te ayudaremos al máximo (trabajemos juntos o no)
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    {/* Phone */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-3 bg-gray-50 border-r border-gray-300">
                        <span className="text-sm">PE</span>
                        <span className="text-gray-600">▼</span>
                        <span className="text-gray-800 font-medium">+51</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="Número de teléfono"
                        className="flex-1 px-4 py-3 outline-none text-gray-800"
                        disabled={!isUnlocked}
                      />
                    </div>

                    {/* Name */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <input
                        type="text"
                        placeholder="Nombre *"
                        className="w-full px-4 py-3 outline-none text-gray-800"
                        disabled={!isUnlocked}
                      />
                    </div>

                    {/* Terms */}
                    <p className="text-sm text-gray-500">
                      Al introducir su información, usted da su consentimiento para que sus datos sean guardados de acuerdo con nuestra{' '}
                      <a href="#" className="text-blue-600 underline">Términos</a> &{' '}
                      <a href="#" className="text-blue-600 underline">política de privacidad</a>.
                    </p>

                    {/* Submit Button */}
                    <button
                      className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${isUnlocked
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      disabled={!isUnlocked}
                      onClick={() => window.open('https://calendly.com/rrboxingperu/30min', '_blank')}
                    >
                      Continuar
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right - Calendar */}
                <div className="p-6 md:p-8 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">febrero 2026</h4>
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Days header */}
                    {['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'].map((day) => (
                      <div key={day} className="text-xs text-gray-500 font-medium py-2">
                        {day}
                      </div>
                    ))}

                    {/* Calendar days */}
                    {[
                      1, 2, 3, 4, 5, 6, 7,
                      8, 9, 10, 11, 12, 13, 14,
                      15, 16, 17, 18, 19, 20, 21,
                      22, 23, 24, 25, 26, 27, 28
                    ].map((day) => (
                      <button
                        key={day}
                        className={`py-2 rounded-lg text-sm transition-all ${day === 21
                            ? 'bg-blue-600 text-white font-bold'
                            : day === 22 || day === 23
                              ? 'text-blue-600 font-medium hover:bg-blue-50'
                              : 'text-gray-400'
                          }`}
                        disabled={!isUnlocked || (day !== 21 && day !== 22 && day !== 23)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {/* Message */}
                  <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-center text-sm">
                      {isUnlocked
                        ? 'Selecciona una fecha disponible para tu llamada'
                        : 'Por favor complete el formulario antes de elegir su franja horaria.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Powered by <span className="font-semibold">Calendly</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 text-neutral">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Sin compromiso</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>100% Gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>30 minutos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
