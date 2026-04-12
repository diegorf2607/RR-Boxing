'use client'

import Link from 'next/link'
import { Calendar, ShoppingCart } from 'lucide-react'
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
        <div className="container relative mx-auto flex items-center gap-2 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link href="/" className="font-heading text-xl tracking-wide text-accent md:text-2xl">
              RRBOXING
            </Link>
          </div>
          <nav
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 md:flex"
            aria-label="Principal"
          >
            <Link href="/" className="text-sm font-medium whitespace-nowrap text-white hover:text-accent">
              Tienda
            </Link>
            <Link href="/consulta" className="text-sm whitespace-nowrap text-neutral-light hover:text-white">
              Clases personalizadas
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-3">
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

      {/* Móvil: acceso a clases sin solapar país/carrito (antes estaba en el header) */}
      <Link
        href="/consulta"
        className="fixed bottom-5 right-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-accent/50 bg-accent py-3 pl-4 pr-4 text-xs font-bold uppercase tracking-wide text-dark shadow-xl shadow-black/50 transition hover:bg-accent-light md:hidden"
        aria-label="Ir a clases personalizadas 1 a 1"
      >
        <Calendar className="h-4 w-4 shrink-0" aria-hidden />
        <span>Clases 1 a 1</span>
      </Link>
    </>
  )
}
