'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, X } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Calcular fecha objetivo: 15 días desde ahora a las 7 PM
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 15);
    targetDate.setHours(19, 0, 0, 0); // 7 PM

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCalendlyClick = () => {
    window.location.href = '/consulta';
    onClose();
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay con efecto blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-dark-100 via-dark-200 to-dark-100 border border-accent/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-accent/20 animate-fade-in-up">
        {/* Efecto de brillo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contenido */}
        <div className="p-6 sm:p-8 text-center">
          {/* Icono animado */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-accent to-yellow-600 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-dark" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            ¡Estamos casi listos! 🥊
          </h2>
          
          <p className="text-gray-300 mb-6 text-base leading-relaxed">
            El curso aún no está disponible, pero <span className="text-accent font-semibold">¡falta muy poco!</span>
          </p>

          {/* Contador en el modal */}
          {mounted && (
            <div className="bg-dark-300/50 rounded-2xl p-4 mb-6 border border-dark-400">
              <p className="text-sm text-gray-400 mb-3">El curso se lanza en:</p>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="flex flex-col items-center bg-dark/60 rounded-xl px-3 py-2 min-w-[55px]">
                  <span className="text-2xl sm:text-3xl font-bold text-accent tabular-nums">
                    {formatNumber(timeLeft.days)}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase">Días</span>
                </div>
                <span className="text-2xl font-bold text-accent">:</span>
                <div className="flex flex-col items-center bg-dark/60 rounded-xl px-3 py-2 min-w-[55px]">
                  <span className="text-2xl sm:text-3xl font-bold text-accent tabular-nums">
                    {formatNumber(timeLeft.hours)}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase">Hrs</span>
                </div>
                <span className="text-2xl font-bold text-accent">:</span>
                <div className="flex flex-col items-center bg-dark/60 rounded-xl px-3 py-2 min-w-[55px]">
                  <span className="text-2xl sm:text-3xl font-bold text-accent tabular-nums">
                    {formatNumber(timeLeft.minutes)}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase">Min</span>
                </div>
              </div>
            </div>
          )}

          {/* Separador con texto */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-400"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-dark-200 px-4 text-sm text-gray-400">
                Pero mientras tanto...
              </span>
            </div>
          </div>

          {/* Opción de clases personalizadas */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-500/20 rounded-2xl p-5 border border-red-500/30 mb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">Disponible ahora</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Clases Personalizadas 1 a 1
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Entrena directamente conmigo y recibe atención personalizada para alcanzar tus objetivos más rápido.
            </p>
            <button
              onClick={handleCalendlyClick}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 flex items-center justify-center gap-3"
            >
              <Calendar className="w-5 h-5" />
              Agenda tu clase ahora
            </button>
          </div>

          {/* Botón secundario */}
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Esperaré al lanzamiento del curso
          </button>
        </div>
      </div>
    </div>
  );
}
