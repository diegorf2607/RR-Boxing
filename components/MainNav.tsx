'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import CountrySelect from '@/components/CountrySelect'
import EnlaceClase from '@/components/EnlaceClase'

export default function MainNav() {
  const { count } = useCart()
  const { country, setCountry } = useCountry()

  return (
    <header className="sticky top-0 z-50 border-b border-dark-300 bg-dark/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4 md:py-3">
        <Link
          href="/"
          className="shrink-0 font-heading text-xl tracking-wide text-accent md:justify-self-start md:text-2xl"
        >
          RRBOXING
        </Link>

        <nav className="hidden items-center justify-center gap-5 md:flex md:justify-self-center lg:gap-8">
          <Link href="/" className="whitespace-nowrap text-sm font-medium text-white transition hover:text-accent">
            Tienda
          </Link>
          <Link
            href="/consulta"
            className="whitespace-nowrap text-sm font-medium text-neutral-light transition hover:text-white"
          >
            Clases 1 a 1
          </Link>
          <EnlaceClase className="whitespace-nowrap text-sm font-medium text-neutral-light transition hover:text-white">
            Clase virtual
          </EnlaceClase>
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 md:gap-3 md:justify-self-end">
          <Link
            href="/consulta"
            className="shrink-0 whitespace-nowrap rounded-lg border border-red-500/40 px-2 py-1.5 text-xs font-semibold text-orange-300 md:hidden"
          >
            Clases 1 a 1
          </Link>
          <CountrySelect
            value={country}
            onChange={setCountry}
            className="min-w-0 max-w-[140px] rounded-lg border border-dark-300 bg-dark-100 px-2 py-1 text-xs text-white sm:max-w-[200px] sm:text-sm md:max-w-[200px] xl:max-w-xs"
          />
          <Link
            href="/cart"
            aria-label={count > 0 ? `Carrito (${count})` : 'Carrito'}
            className="relative shrink-0 rounded-lg border border-dark-300 p-2 hover:bg-dark-100"
          >
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
