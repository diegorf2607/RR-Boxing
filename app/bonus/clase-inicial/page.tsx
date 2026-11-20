import type { Metadata } from 'next'
import Link from 'next/link'
import { toYouTubeEmbedUrl } from '@/shared/lib/youtube-embed'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Clase grabada: primeros pasos',
  description: 'Tema inicial de boxeo: calentamiento, guardia y primeros golpes.',
  robots: { index: false, follow: false },
}

export default function ClaseInicialPage() {
  const raw = process.env.NEXT_PUBLIC_POST_PURCHASE_VIDEO_URL?.trim() ?? ''
  const embed = raw ? toYouTubeEmbedUrl(raw) : null

  return (
    <main className="min-h-screen bg-dark text-neutral-light">
      <header className="border-b border-dark-300 bg-dark-100 px-4 py-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <Link href="/" className="font-heading text-xl tracking-wide text-accent">
            RR Boxing
          </Link>
          <Link href="/bonus/guia-basica" className="text-sm text-accent hover:underline">
            ← Guía básica (PDF desde el navegador)
          </Link>
        </div>
      </header>
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-3 font-heading text-4xl font-bold tracking-wide text-white md:text-5xl">
          Clase grabada: primeros pasos
        </h1>
        <p className="mb-8 text-lg text-white">
          Calentamiento, guardia y primeras combinaciones, explicados paso a paso.
        </p>

        {embed ? (
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-dark-300 bg-black shadow-xl">
            <iframe
              title="Clase grabada de RR Boxing"
              src={embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dark-300 bg-dark-100 p-8 text-center">
            <p className="mb-4 text-white">Esta clase todavía no está disponible.</p>
            <a
              href={enlaceWhatsapp('Hola, RR Boxing. Quiero saber cuándo estará disponible la clase grabada de primeros pasos.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-accent px-6 py-3 font-bold text-dark transition-colors hover:bg-accent-dark"
            >
              Preguntar por WhatsApp
            </a>
            <p className="mt-4 text-sm text-neutral">
              Mientras tanto, disfruta la{' '}
              <Link href="/bonus/guia-basica" className="text-accent underline">
                guía básica en texto
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
