'use client'

import { usePathname } from 'next/navigation'
import AlertBanner from '@/components/AlertBanner'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import { ModalProvider } from '@/components/ModalProvider'
import { CountryProvider } from '@/features/country/CountryProvider'
import { CartProvider } from '@/features/cart/CartProvider'

/** Páginas sueltas (como /clase) que van sin el banner de la tienda ni el WhatsApp flotante. */
const RUTAS_SIN_EXTRAS = ['/clase']

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const sinExtras = RUTAS_SIN_EXTRAS.some((ruta) => pathname === ruta || pathname?.startsWith(`${ruta}/`))

  return (
    <ModalProvider>
      {!sinExtras && <AlertBanner />}
      <CountryProvider>
        <CartProvider>
          {children}
          {!sinExtras && <FloatingWhatsApp />}
        </CartProvider>
      </CountryProvider>
    </ModalProvider>
  )
}
