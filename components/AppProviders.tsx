'use client'

import { usePathname } from 'next/navigation'
import AlertBanner from '@/components/AlertBanner'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import { ModalProvider } from '@/components/ModalProvider'
import { CountryProvider } from '@/features/country/CountryProvider'
import { CartProvider } from '@/features/cart/CartProvider'

/** Páginas sueltas (como /clase) y del panel, que van sin la barra de la tienda ni el WhatsApp flotante. */
const RUTAS_SIN_EXTRAS = ['/clase', '/admin', '/login']
/** Páginas que ya tienen su propio botón de WhatsApp: el flotante taparía los botones en el celular. */
const RUTAS_SIN_FLOTANTE = ['/product', '/cart', '/consulta', '/checkout']

const coincide = (rutas: string[], pathname: string | null) =>
  rutas.some((ruta) => pathname === ruta || pathname?.startsWith(`${ruta}/`))

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const sinExtras = coincide(RUTAS_SIN_EXTRAS, pathname)
  const sinFlotante = sinExtras || coincide(RUTAS_SIN_FLOTANTE, pathname)

  return (
    <ModalProvider>
      {!sinExtras && <AlertBanner />}
      <CountryProvider>
        <CartProvider>
          {children}
          {!sinFlotante && <FloatingWhatsApp />}
        </CartProvider>
      </CountryProvider>
    </ModalProvider>
  )
}
