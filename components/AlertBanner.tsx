'use client'

import { useState, useEffect } from 'react'
import { Clock, X } from 'lucide-react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function AlertBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Calcular fecha objetivo: 15 días desde ahora a las 7 PM
    const now = new Date()
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + 15)
    targetDate.setHours(19, 0, 0, 0) // 7 PM

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!isVisible) return null

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white py-3 px-4 relative z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-sm md:text-base">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 animate-pulse" />
          <span className="font-medium text-xs sm:text-sm md:text-base">
            🚀 El curso se lanza en:
          </span>
        </div>
        
        {/* Contador */}
        {mounted && (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center bg-black/30 rounded-lg px-2 py-1 min-w-[40px] sm:min-w-[50px]">
              <span className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums">
                {formatNumber(timeLeft.days)}
              </span>
              <span className="text-[10px] sm:text-xs uppercase opacity-80">Días</span>
            </div>
            <span className="text-xl font-bold">:</span>
            <div className="flex flex-col items-center bg-black/30 rounded-lg px-2 py-1 min-w-[40px] sm:min-w-[50px]">
              <span className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums">
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="text-[10px] sm:text-xs uppercase opacity-80">Hrs</span>
            </div>
            <span className="text-xl font-bold">:</span>
            <div className="flex flex-col items-center bg-black/30 rounded-lg px-2 py-1 min-w-[40px] sm:min-w-[50px]">
              <span className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums">
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="text-[10px] sm:text-xs uppercase opacity-80">Min</span>
            </div>
            <span className="text-xl font-bold">:</span>
            <div className="flex flex-col items-center bg-black/30 rounded-lg px-2 py-1 min-w-[40px] sm:min-w-[50px]">
              <span className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums">
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="text-[10px] sm:text-xs uppercase opacity-80">Seg</span>
            </div>
          </div>
        )}

        <span className="hidden lg:inline text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
          ¡Aprovecha el 40% de descuento!
        </span>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Cerrar banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
