'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import { COUNTRY_CONFIG } from '@/shared/lib/country'

export default function MainNav() {
  const { count } = useCart()
  const { country, setCountry } = useCountry()

  return (
    <header className="sticky top-0 z-50 border-b border-dark-300 bg-dark/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-heading text-2xl tracking-wide text-accent">
          RRBOXING
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm text-neutral-light hover:text-white">
            Inicio
          </Link>
          <Link href="/store" className="text-sm text-neutral-light hover:text-white">
            Tienda
          </Link>
          <Link href="/consulta" className="text-sm text-neutral-light hover:text-white">
            Clases personalizadas
          </Link>
          <Link href="/account" className="text-sm text-neutral-light hover:text-white">
            Mi cuenta
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <select
            className="rounded-lg border border-dark-300 bg-dark-100 px-2 py-1 text-sm"
            value={country}
            onChange={(e) => setCountry(e.target.value as typeof country)}
            aria-label="Seleccionar país"
          >
            {COUNTRY_CONFIG.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name} ({item.code})
              </option>
            ))}
          </select>
          <Link href="/cart" className="relative rounded-lg border border-dark-300 p-2 hover:bg-dark-100">
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-accent px-1.5 text-xs font-bold text-dark">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
