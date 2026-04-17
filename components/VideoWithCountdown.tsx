'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoWithCountdownProps {
    onUnlock: () => void
}

const TOTAL_SECONDS = 60

export default function VideoWithCountdown({ onUnlock }: VideoWithCountdownProps) {
    const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS)
    const [unlocked, setUnlocked] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!)
                    setUnlocked(true)
                    onUnlock()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(intervalRef.current!)
    }, [onUnlock])

    const progress = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100
    const mins = Math.floor(secondsLeft / 60)
    const secs = secondsLeft % 60
    const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            {/* Video */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-accent/20 border border-accent/20">
                <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/vO3AeRbPqM0?autoplay=1&mute=1&rel=0&modestbranding=1"
                    title="RR Boxing Academy – Video de presentación"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>

            {/* Countdown Block */}
            {!unlocked && (
                <div className="mt-6 text-center animate-fade-in-up">
                    {/* Label */}
                    <p className="text-neutral-light text-sm md:text-base mb-3 tracking-wide uppercase font-semibold">
                        ⏳ Mira el video — el precio se desbloquea en
                    </p>

                    {/* Timer display */}
                    <div className="inline-flex items-center justify-center bg-dark-100 border-2 border-accent rounded-2xl px-8 py-4 shadow-lg shadow-accent/10 mb-4">
                        <span className="text-5xl md:text-6xl font-bold text-accent tabular-nums tracking-widest">
                            {display}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full max-w-lg mx-auto bg-dark-200 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="h-2.5 bg-accent rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Subtext */}
                    <p className="text-neutral text-xs mt-3">
                        El descuento del 40% se activará automáticamente cuando termines de ver el video
                    </p>
                </div>
            )}
        </div>
    )
}
