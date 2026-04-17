'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CourseButton } from './CTAButtons'

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
          <Image
            src="/rr-boxing-logo.png"
            alt="RR Boxing"
            width={56}
            height={56}
            className="w-12 h-12 md:w-14 md:h-14 transition-transform group-hover:scale-110"
          />
        </Link>

        {/* CTA Button */}
        <CourseButton size="sm" className="text-sm md:text-base px-4 py-2 md:px-6 md:py-3">
          Inscríbete Ahora
        </CourseButton>
      </div>
    </header>
  )
}
