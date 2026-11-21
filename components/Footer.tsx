import Link from 'next/link'
import Image from 'next/image'
import { enlaceWhatsapp, WHATSAPP_LEGIBLE } from '@/shared/lib/whatsapp'
import { RUTAS } from '@/shared/legal/politicas'
import EnlaceClase from '@/components/EnlaceClase'

const FACEBOOK_URL = 'https://www.facebook.com/p/RR-Boxing-Peru-100083217998125/'
const INSTAGRAM_URL = 'https://instagram.com/rrboxingperu'
const TIKTOK_URL = 'https://tiktok.com/@rrboxingperu'
const WHATSAPP_URL = enlaceWhatsapp('Hola, RR Boxing. Tengo una consulta.')

// 44 px de alto en el celular para el dedo; desde 768 px, una lista apretada como en un pie de tienda.
const claseEnlace =
  'inline-flex min-h-[44px] items-center underline-offset-[3px] transition-colors hover:text-white hover:underline md:min-h-0 md:py-0.5'

type Enlace = { href: string; texto: string; externo?: boolean; soloSiHayClase?: boolean }

const COLUMNAS: { titulo: string; enlaces: Enlace[] }[] = [
  {
    titulo: 'Tienda',
    enlaces: [
      { href: '/product/guantes-boxeo-woesad', texto: 'Guantes de boxeo' },
      { href: '/product/vendas-boxeo-45m', texto: 'Vendas para boxeo' },
      { href: '/product/cuerda-salto-boxeo', texto: 'Cuerda de salto' },
      { href: '/#combos', texto: 'Combos' },
    ],
  },
  {
    titulo: 'Clases',
    enlaces: [
      { href: RUTAS.clases1a1, texto: 'Clases 1 a 1' },
      { href: RUTAS.clase, texto: 'Clase virtual gratis', soloSiHayClase: true },
    ],
  },
  {
    titulo: 'Ayuda',
    enlaces: [
      { href: '/#preguntas-frecuentes', texto: 'Preguntas frecuentes' },
      { href: RUTAS.cambios, texto: 'Cambios y devoluciones' },
      { href: RUTAS.garantia, texto: 'Garantía de compra' },
      { href: RUTAS.libro, texto: 'Libro de Reclamaciones' },
    ],
  },
  {
    titulo: 'Contacto',
    enlaces: [
      { href: WHATSAPP_URL, texto: `WhatsApp ${WHATSAPP_LEGIBLE}`, externo: true },
      { href: TIKTOK_URL, texto: 'TikTok @rrboxingperu', externo: true },
      { href: INSTAGRAM_URL, texto: 'Instagram @rrboxingperu', externo: true },
      { href: FACEBOOK_URL, texto: 'Facebook RR Boxing Peru', externo: true },
    ],
  },
]

/**
 * El pie negro de la portada y de /consulta: el logo y cuatro columnas de enlaces. Debajo va siempre PieLegal (lo
 * pone app/layout.tsx en todas las páginas), que completa el pie con el Libro de Reclamaciones y los textos legales.
 */
export default function Footer() {
  return (
    <footer className="bg-tinta pb-10 pt-12 text-white md:pb-11 md:pt-14">
      <div className="contenedor">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.2fr_repeat(4,1fr)] md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <Image src="/marca/logo-amarillo.png" alt="RR Boxing" width={307} height={420} sizes="53px" className="h-[72px] w-auto" />
          </div>
          {COLUMNAS.map((columna) => (
            <div key={columna.titulo}>
              {/* h2 y no h4: no salta niveles después de los h2 de la página */}
              <h2 className="mb-1 text-[15px] font-bold md:mb-3">{columna.titulo}</h2>
              <ul className="text-[15px] text-claro md:space-y-2">
                {columna.enlaces.map((e) =>
                  e.soloSiHayClase ? (
                    // Si la clase ya pasó, el enlace no se muestra y el ítem vacío se esconde
                    <li key={e.href} className="empty:hidden">
                      <EnlaceClase className={claseEnlace}>{e.texto}</EnlaceClase>
                    </li>
                  ) : (
                    <li key={e.href}>
                      {e.externo ? (
                        <a href={e.href} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
                          {e.texto}
                        </a>
                      ) : (
                        <Link href={e.href} className={claseEnlace}>
                          {e.texto}
                        </Link>
                      )}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
