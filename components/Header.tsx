'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-accent rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
              <svg viewBox="0 0 100 100" className="w-8 h-8 md:w-10 md:h-10">
                <text
                  x="50"
                  y="55"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-dark font-bold text-3xl"
                  style={{ fontFamily: 'Impact, sans-serif' }}
                >
                  RR
                </text>
              </svg>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <span className="text-[8px] md:text-[10px] font-bold text-accent tracking-wider">
                BOXING
              </span>
            </div>
          </div>
        </Link>

        {/* CTA Button */}
        <Link
          href="#pricing"
          className="btn-primary text-sm md:text-base"
        >
          Inscríbete Ahora
        </Link>
      </div>
    </header>
  )
}
