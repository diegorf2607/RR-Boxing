import type { Metadata } from 'next'
import Link from 'next/link'
import { toYouTubeEmbedUrl } from '@/shared/lib/youtube-embed'

export const metadata: Metadata = {
  title: 'Clase grabada — primeros pasos',
  description: 'Tema inicial de boxeo: calentamiento, guardia y primeros golpes. Regalo por comprar en la tienda oficial.',
}

export default function ClaseInicialPage() {
  const raw = process.env.NEXT_PUBLIC_POST_PURCHASE_VIDEO_URL?.trim() ?? ''
  const embed = raw ? toYouTubeEmbedUrl(raw) : null

  return (
    <main className="min-h-screen bg-dark text-neutral-light">
      <header className="border-b border-dark-300 bg-dark-100 px-4 py-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <Link href="/" className="font-heading text-xl tracking-wide text-accent">
            RRBOXING
          </Link>
          <Link href="/bonus/guia-basica" className="text-sm text-accent hover:underline">
            ← Guía básica (PDF desde el navegador)
          </Link>
        </div>
      </header>
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">Regalo tienda oficial</p>
        <h1 className="mb-3 font-heading text-4xl font-bold tracking-wide text-white md:text-5xl">
          Clase grabada: primeros pasos
        </h1>
        <p className="mb-8 text-lg text-white">
          Un adicional pensado para quien compra equipamiento: calentamiento, guardia y primeras combinaciones con
          explicación clara, al estilo RRBOXING.
        </p>

        {embed ? (
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-dark-300 bg-black shadow-xl">
            <iframe
              title="Clase grabada RRBOXING"
              src={embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dark-300 bg-dark-100 p-8 text-center">
            <p className="mb-4 text-neutral-light">
              Cuando configures <code className="rounded bg-dark px-1 text-accent">NEXT_PUBLIC_POST_PURCHASE_VIDEO_URL</code>{' '}
              con tu enlace de YouTube (ver o embed), el video aparecerá aquí automáticamente.
            </p>
            <p className="text-sm text-neutral">
              Mientras tanto, disfrutá la{' '}
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
