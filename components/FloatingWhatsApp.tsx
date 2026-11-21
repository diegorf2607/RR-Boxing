'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function resolveWhatsAppHref(): string {
  const url = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim()
  if (url) return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
  const message = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE?.trim() || 'Hola, RR Boxing. Quiero información.'
  return enlaceWhatsapp(message)
}

const CELULAR = '(max-width: 767px)'

/**
 * En el celular se esconde mientras esté a la vista algo marcado con data-ocultar-whatsapp (los botones de la portada):
 * en pantallas bajas (360×640) quedaba encima de «Ver la tienda» y al tocar su borde se abría WhatsApp.
 */
function useOcultoEnCelular(): boolean {
  const ruta = usePathname()
  const [oculto, setOculto] = useState(false)
  useEffect(() => {
    const objetivo = document.querySelector('[data-ocultar-whatsapp]')
    if (!objetivo || !('IntersectionObserver' in window)) {
      setOculto(false)
      return
    }
    const celular = window.matchMedia(CELULAR)
    let aLaVista = false
    const actualizar = () => setOculto(aLaVista && celular.matches)
    const observador = new IntersectionObserver(([entrada]) => {
      aLaVista = entrada.isIntersecting
      actualizar()
    })
    observador.observe(objetivo)
    celular.addEventListener('change', actualizar)
    return () => {
      observador.disconnect()
      celular.removeEventListener('change', actualizar)
    }
  }, [ruta])
  return oculto
}

export default function FloatingWhatsApp() {
  const href = resolveWhatsAppHref()
  const oculto = useOcultoEnCelular()

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // Cuadrado negro con el ícono blanco, como los botones de la tienda: sin sombra ni círculo verde. El borde gris
      // lo separa cuando pasa por encima de una franja negra (la clase, el pie).
      className={`fixed bottom-4 right-4 z-[65] flex h-14 w-14 items-center justify-center border border-[#4A4A4A] bg-tinta text-white transition-[color,background-color,border-color,opacity] hover:border-accent hover:bg-accent hover:text-tinta md:bottom-6 md:right-6 ${
        oculto ? 'invisible opacity-0' : 'visible opacity-100'
      }`}
      aria-label="WhatsApp: escríbenos para comprar o resolver dudas"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
