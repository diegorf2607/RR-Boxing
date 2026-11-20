// Página 404 en español, en la línea A: la barra con el logo y, debajo, como el texto de la portada de la maqueta: el
// titular angosto, el párrafo de entrada y dos botones (el amarillo para volver a la tienda y el de borde para
// escribir por WhatsApp). Next.js le pone sola <meta name="robots" content="noindex"> por el estado 404.
import type { Metadata } from 'next'
import Link from 'next/link'
import { CabeceraSola } from '@/components/LegalPageShell'
import IconoWhatsapp from '@/components/legal/IconoWhatsapp'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

const WHATSAPP_AYUDA = enlaceWhatsapp('Hola, RR Boxing. Busqué una página en la web y no la encontré. ¿Me ayudan?')

export default function NoEncontrada() {
  return (
    <>
      <CabeceraSola />
      <main className="min-h-[60vh] bg-dark pb-16 pt-10 text-white md:pb-24 md:pt-16">
        <div className="wrap">
          <div className="max-w-[34em]">
            <p className="text-sm text-neutral">Error 404</p>
            <h1 className="hero-title mt-3">
              No encontramos <span className="block text-accent">esta página</span>
            </h1>
            <p className="lead mt-5">
              Puede que el enlace esté mal copiado o que la página ya no exista. Los guantes, las vendas y la cuerda
              siguen en la tienda.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
