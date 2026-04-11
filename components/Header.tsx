'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HighTicketButton } from './CTAButtons'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-dark/90 shadow-lg backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/rr-boxing-logo.png"
            alt="RRBOXING"
            width={56}
            height={56}
            className="h-12 w-12 transition-transform group-hover:scale-110 md:h-14 md:w-14"
          />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden rounded-lg border border-dark-300 px-3 py-2 text-sm text-white hover:bg-dark-100 md:inline-block"
          >
            Tienda
          </Link>
          <HighTicketButton size="sm" className="px-3 py-2 text-sm">
            Clases personalizadas
          </HighTicketButton>
        </div>
      </div>
    </header>
  )
}
