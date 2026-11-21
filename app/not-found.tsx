// Página 404 en español, en la línea de la tienda (menú negro, página blanca) y con dos caminos: volver a la tienda o
// escribir por WhatsApp. Next.js le pone sola <meta name="robots" content="noindex"> por el estado 404.
import type { Metadata } from 'next'
import Link from 'next/link'
import MainNav from '@/components/MainNav'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

const WHATSAPP_AYUDA = enlaceWhatsapp('Hola, RR Boxing. Busqué una página en la web y no la encontré. ¿Me ayudan?')

export default function NoEncontrada() {
  return (
    <>
      <MainNav />
      <main className="min-h-[60vh] bg-white pb-16 pt-10 text-tinta md:pb-24 md:pt-16">
        <div className="contenedor">
          <div className="max-w-xl">
            <p className="font-semibold text-suave">Error 404</p>
            <h1 className="page-title mt-2">
              No encontramos <span className="block">esta página</span>
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-tinta-2">
              Puede que el enlace esté mal copiado o que la página ya no exista. Los guantes, las vendas y la cuerda
              siguen en la tienda.
            </p>

            <div className="mt-8 grid gap-2 border-t border-linea pt-6 sm:flex sm:flex-wrap">
              <Link href="/" className="btn-primary sm:inline-flex sm:w-auto">
                Ir a la tienda
              </Link>
              <a
                href={WHATSAPP_AYUDA}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary sm:inline-flex sm:w-auto"
              >
                <IconoWhatsapp />
                Escríbenos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
