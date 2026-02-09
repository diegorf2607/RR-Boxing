'use client';

import { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const goals = [
  'Aprender desde cero (fundamentos)',
  'Mejorar condición física / cardio',
  'Ganar confianza y seguridad',
  'Desarrollar una habilidad concreta',
  'Otro',
];

const obstacles = [
  '',
  'No sé por dónde empezar',
  'Me falta constancia',
  'Me falta tiempo',
  'Tengo dolor o molestias',
  'Me falta dinero',
];

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+51');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedObstacle, setSelectedObstacle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validación básica
    if (!name.trim()) {
      alert('Por favor ingresa tu nombre');
      setIsSubmitting(false);
      return;
    }

    if (!email.trim()) {
      alert('Por favor ingresa tu correo electrónico');
      setIsSubmitting(false);
      return;
    }

    if (!phone.trim()) {
      alert('Por favor ingresa tu número de celular');
      setIsSubmitting(false);
      return;
    }

    if (selectedGoals.length === 0) {
      alert('Por favor selecciona al menos un objetivo');
      setIsSubmitting(false);
      return;
    }

    // Aquí podrías enviar los datos a un backend o servicio
    // Por ahora, guardamos en localStorage y redirigimos
    const formData = {
      name,
      email,
      phone: `${countryCode}${phone}`,
      goals: selectedGoals,
      obstacle: selectedObstacle,
      timestamp: new Date().toISOString(),
    };

    console.log('Form submitted:', formData);
    
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 500));

    // Redirigir a página de pago (por ahora alert)
    alert('¡Gracias por tu interés! Serás redirigido a la página de pago.');
    // window.location.href = '/checkout'; // Descomentar cuando tengas la página de pago

    setIsSubmitting(false);
    onClose();
    
    // Resetear formulario
    setName('');
    setEmail('');
    setPhone('');
    setSelectedGoals([]);
    setSelectedObstacle('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-dark-200 border border-dark-300 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 p-4 sm:p-6 border-b border-dark-300 bg-gradient-to-r from-accent/20 to-yellow-600/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 className="text-xl sm:text-2xl font-bold text-white pr-8">
            🥊 Inscríbete al Curso
          </h2>
          <p className="text-gray-300 text-sm mt-1">
            Completa tus datos para acceder al curso
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nombre completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Correo electrónico *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          {/* Celular */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Número de celular *
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 px-2 py-3 bg-dark-300 border border-dark-400 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
              >
                <option value="+51">🇵🇪 +51</option>
                <option value="+52">🇲🇽 +52</option>
                <option value="+54">🇦🇷 +54</option>
                <option value="+56">🇨🇱 +56</option>
                <option value="+57">🇨🇴 +57</option>
                <option value="+58">🇻🇪 +58</option>
                <option value="+34">🇪🇸 +34</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+593">🇪🇨 +593</option>
                <option value="+591">🇧🇴 +591</option>
                <option value="+595">🇵🇾 +595</option>
                <option value="+598">🇺🇾 +598</option>
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="999 999 999"
                className="flex-1 px-4 py-3 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
          </div>

          {/* Pregunta 1: Objetivos */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ¿Qué es lo que más te gustaría lograr con el curso / entrenamiento? *
              <span className="block text-xs text-gray-500 mt-0.5">Puedes elegir más de uno</span>
            </label>
            <div className="space-y-2">
              {goals.map((goal) => (
                <label
                  key={goal}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedGoals.includes(goal)
                      ? 'bg-accent/10 border-accent/50'
                      : 'bg-dark-300 border-dark-400 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                    className="sr-only"
                  />
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedGoals.includes(goal)
                      ? 'bg-accent border-accent'
                      : 'border-gray-500'
                  }`}>
                    {selectedGoals.includes(goal) && (
                      <svg className="w-3 h-3 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="text-gray-200 text-sm">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pregunta 2: Obstáculos (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              ¿Qué es lo que más te frena hoy para avanzar?
            </label>
            <select
              value={selectedObstacle}
              onChange={(e) => setSelectedObstacle(e.target.value)}
              className="w-full px-4 py-3 bg-dark-300 border border-dark-400 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Selecciona una opción</option>
              {obstacles.filter(o => o !== '').map((obstacle) => (
                <option key={obstacle} value={obstacle}>{obstacle}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-accent via-yellow-500 to-amber-500 text-dark shadow-lg shadow-accent/30"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </span>
            ) : (
              '🥊 Ir al Pago'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Al continuar, aceptas nuestros términos y condiciones y política de privacidad.
          </p>
        </form>
      </div>
    </div>
  );
}
