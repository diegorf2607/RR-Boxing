import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { WHATSAPP_LEGIBLE, enlaceWhatsapp } from '@/shared/lib/whatsapp'
import EnlaceClase from '@/components/EnlaceClase'

const FACEBOOK_URL = 'https://www.facebook.com/p/RR-Boxing-Peru-100083217998125/'
const INSTAGRAM_URL = 'https://instagram.com/rrboxingperu'
const TIKTOK_URL = 'https://tiktok.com/@rrboxingperu'
const WHATSAPP_URL = enlaceWhatsapp('Hola, RR Boxing. Tengo una consulta.')

// En el celular cada enlace mide 44 px de alto para el dedo; desde 768 px van más juntos, como en la maqueta.
const claseEnlace =
  'inline-flex min-h-[44px] items-center text-neutral-light transition-colors hover:text-white md:min-h-[30px]'

function Columna({ titulo, className, children }: { titulo: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      {/* h2 y no h4: no salta niveles después de los h2 de la página */}
      <h2 className="mb-2 text-sm font-[650] text-white md:mb-3">{titulo}</h2>
      <ul>{children}</ul>
    </div>
  )
}

function Externo({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
        {children}
      </a>
    </li>
  )
}

/**
 * El pie de la tienda, como la maqueta de la línea A: la marca y tres columnas (Tienda, Ayuda, Redes). Debajo va
 * PieLegal (app/layout.tsx), que es la franja legal de todas las páginas.
 */
export default function Footer() {
  return (
    <footer className="border-t border-dark-300 bg-dark pb-8 pt-10 text-[14.5px] md:pb-10 md:pt-12">
      <div className="wrap grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Image src="/rr-boxing-logo.png" alt="RR Boxing" width={44} height={68} className="mb-3 h-[68px] w-11" />
          <p className="max-w-[28em] text-neutral-light">Tienda y clases de RR Boxing. Pedidos y consultas por WhatsApp.</p>
        </div>

        <Columna titulo="Tienda">
          <li>
            <Link href="/" className={claseEnlace}>
              Productos
            </Link>
          </li>
          <li>
            <Link href="/consulta" className={claseEnlace}>
              Clases 1 a 1
            </Link>
          </li>
          {/* Si la clase ya pasó, el enlace no se muestra y el ítem vacío se esconde. */}
          <li className="empty:hidden">
            <EnlaceClase className={claseEnlace}>Clase virtual</EnlaceClase>
          </li>
        </Columna>

        <Columna titulo="Ayuda">
          <li>
            <Link href="/#preguntas-frecuentes" className={claseEnlace}>
              Preguntas frecuentes
            </Link>
          </li>
          <Externo href={WHATSAPP_URL}>WhatsApp {WHATSAPP_LEGIBLE}</Externo>
        </Columna>

        {/* En el celular, Redes va a todo el ancho para que cada cuenta quepa en una línea */}
        <Columna titulo="Redes" className="col-span-2 md:col-span-1">
          <Externo href={TIKTOK_URL}>TikTok @rrboxingperu</Externo>
          <Externo href={INSTAGRAM_URL}>Instagram @rrboxingperu</Externo>
          <Externo href={FACEBOOK_URL}>Facebook RR Boxing Peru</Externo>
        </Columna>
      </div>
    </footer>
  )
}
