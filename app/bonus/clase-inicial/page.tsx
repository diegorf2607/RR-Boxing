import type { Metadata } from 'next'
import Link from 'next/link'
import { CabeceraSola } from '@/components/LegalPageShell'
import IconoWhatsapp from '@/components/legal/IconoWhatsapp'
import { toYouTubeEmbedUrl } from '@/shared/lib/youtube-embed'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Clase grabada: primeros pasos',
  description: 'Tema inicial de boxeo: calentamiento, guardia y primeros golpes.',
  robots: { index: false, follow: false },
}

/** Enlaces dentro del texto: blancos y subrayados (el amarillo queda para los botones) */
const enlace = 'font-medium text-white underline decoration-neutral underline-offset-4 hover:decoration-white'

export default function ClaseInicialPage() {
  const raw = process.env.NEXT_PUBLIC_POST_PURCHASE_VIDEO_URL?.trim() ?? ''
  const embed = raw ? toYouTubeEmbedUrl(raw) : null

  return (
    <>
      <CabeceraSola>
        <Link
          href="/bonus/guia-basica"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-neutral-light transition-colors hover:text-white motion-reduce:transition-none"
        >
          ← Guía básica (PDF desde el navegador)
        </Link>
      </CabeceraSola>
      <main className="min-h-screen bg-dark pb-16 pt-8 text-neutral-light md:pb-20 md:pt-12">
        <div className="wrap">
          <div className="max-w-3xl">
            <h1 className="page-title">Clase grabada: primeros pasos</h1>
            <p className="lead mt-5 text-white">
              Calentamiento, guardia y primeras combinaciones, explicados paso a paso.
            </p>

            {embed ? (
              <div className="mt-8 aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
                <iframe
                  title="Clase grabada de RR Boxing"
                  src={embed}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-line bg-dark-100 p-5 md:p-6">
                <p className="text-base text-white">Esta clase todavía no está disponible.</p>
                <a
                  href={enlaceWhatsapp('Hola, RR Boxing. Quiero saber cuándo estará disponible la clase grabada de primeros pasos.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5 sm:inline-flex sm:w-auto"
                >
                  <IconoWhatsapp />
                  Preguntar por WhatsApp
                </a>
                <p className="mt-4 text-sm text-neutral">
                  Mientras tanto, disfruta la{' '}
                  <Link href="/bonus/guia-basica" className={enlace}>
                    guía básica en texto
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
