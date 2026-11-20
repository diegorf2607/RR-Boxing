'use client'

import { usePathname } from 'next/navigation'
import AlertBanner from '@/components/AlertBanner'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import RegistrarOrigen from '@/components/RegistrarOrigen'
import { CountryProvider } from '@/features/country/CountryProvider'
import { CartProvider } from '@/features/cart/CartProvider'

/** Páginas sueltas (como /clase) y del panel, que van sin la barra de la tienda ni el WhatsApp flotante. */
const RUTAS_SIN_EXTRAS = ['/clase', '/admin', '/login']
/** Páginas que ya tienen su propio botón de WhatsApp: el flotante taparía los botones en el celular. */
const RUTAS_SIN_FLOTANTE = ['/product', '/cart', '/consulta', '/checkout', '/libro-de-reclamaciones']
/** Donde se termina un pedido o se deja un reclamo, la barra roja de la clase no compite con la acción principal. */
const RUTAS_SIN_AVISO = ['/cart', '/checkout', '/libro-de-reclamaciones']
/** El panel no cuenta como visita: ahí no se guarda de dónde llegó la persona. */
const RUTAS_DEL_PANEL = ['/admin', '/login']

const coincide = (rutas: string[], pathname: string | null) =>
  rutas.some((ruta) => pathname === ruta || pathname?.startsWith(`${ruta}/`))

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const sinExtras = coincide(RUTAS_SIN_EXTRAS, pathname)
  const sinFlotante = sinExtras || coincide(RUTAS_SIN_FLOTANTE, pathname)
  const enElPanel = coincide(RUTAS_DEL_PANEL, pathname)

  return (
    <>
      {!enElPanel && <RegistrarOrigen />}
      {!sinExtras && !coincide(RUTAS_SIN_AVISO, pathname) && <AlertBanner />}
      <CountryProvider>
        <CartProvider>
          {children}
          {!sinFlotante && <FloatingWhatsApp />}
        </CartProvider>
      </CountryProvider>
    </>
  )
}
