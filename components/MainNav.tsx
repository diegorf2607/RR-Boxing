'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import type { CountryCode } from '@/shared/types/commerce'
import { COUNTRY_CONFIG } from '@/shared/lib/country'

const COUNTRY_NAV_GROUPS: { label: string; codes: CountryCode[] }[] = [
  {
    label: 'Sudamérica',
    codes: ['AR', 'BO', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'],
  },
  { label: 'México', codes: ['MX'] },
  { label: 'Centroamérica (USD)', codes: ['CAM'] },
  { label: 'Estados Unidos', codes: ['US'] },
]

export default function MainNav() {
  const { count } = useCart()
  const { country, setCountry } = useCountry()

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-dark-300 bg-dark/95 backdrop-blur supports-[backdrop-filter]:bg-dark/80">
        <div className="container mx-auto flex items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="font-heading text-xl tracking-wide text-accent md:text-2xl">
            RRBOXING
          </Link>
          <Link
            href="/consulta"
            className="rounded-lg border border-red-500/40 px-2 py-1.5 text-xs font-semibold text-orange-300 md:hidden"
          >
            Clases 1 a 1
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-white hover:text-accent">
              Tienda
            </Link>
            <Link href="/consulta" className="text-sm text-neutral-light hover:text-white">
              Clases personalizadas
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <select
              className="rounded-lg border border-dark-300 bg-dark-100 px-2 py-1 text-sm"
              value={country}
              onChange={(e) => setCountry(e.target.value as typeof country)}
              aria-label="Seleccionar país"
            >
              {COUNTRY_NAV_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.codes.map((code) => {
                    const item = COUNTRY_CONFIG.find((c) => c.code === code)
                    if (!item) return null
                    return (
                      <option key={item.code} value={item.code}>
                        {item.name} ({item.code})
                      </option>
                    )
                  })}
                </optgroup>
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
      {/* Reserva altura para que el contenido no quede bajo la barra fija */}
      <div className="h-14 shrink-0 md:h-16" aria-hidden />
    </>
  )
}
