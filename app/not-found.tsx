// Página 404 en español, con el tema oscuro y dos caminos: volver a la tienda o escribir por WhatsApp.
// Next.js le pone sola <meta name="robots" content="noindex"> por el estado 404.
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

const WHATSAPP_AYUDA = enlaceWhatsapp('Hola, RR Boxing. Busqué una página en la web y no la encontré. ¿Me ayudan?')

export default function NoEncontrada() {
  return (
    <main className="min-h-[70vh] bg-dark px-4 py-12 text-white sm:py-20">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="inline-block" aria-label="RR Boxing, ir a la tienda">
          {/* 40 × 61: la proporción exacta del logo (95 × 146), así no se deforma ni avisa en la consola */}
          <Image src="/rr-boxing-logo.png" alt="RR Boxing" width={40} height={61} />
        </Link>

        <p className="mt-8 text-sm text-neutral">Error 404</p>
        <h1 className="mt-2 font-heading text-5xl leading-none text-white sm:text-6xl">
          No encontramos <span className="block text-accent">esta página</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-neutral-light">
          Puede que el enlace esté mal copiado o que la página ya no exista. Los guantes, las vendas y la cuerda siguen
          en la tienda.
        </p>

        <div className="mt-8 border-t border-dark-300">
          <Link
            href="/"
            className="mt-6 block rounded-lg bg-accent px-6 py-3.5 text-center font-bold text-dark transition-colors hover:bg-accent-light"
          >
            Ir a la tienda
          </Link>
          <a
            href={WHATSAPP_AYUDA}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-lg border border-dark-300 px-6 py-3.5 text-center font-semibold text-white transition-colors hover:border-accent hover:text-accent"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}
