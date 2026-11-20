import type { Metadata } from 'next'
import { IMAGEN_COMPARTIR } from '@/shared/config/imagen-compartir'
import Image from 'next/image'
import Link from 'next/link'
import { CLASE, claseVigente } from '@/shared/lib/clase-virtual'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'
import { SegunClaseVigente } from '@/components/EnlaceClase'
import FormularioClase from './FormularioClase'

/** Se vuelve a armar cada hora; además, en el navegador se comprueba si la clase ya terminó. */
export const revalidate = 3600

const WHATSAPP_PROXIMA = enlaceWhatsapp('Hola, RR Boxing. Quiero saber cuándo es la próxima clase virtual.')

export const metadata: Metadata = {
  title: 'Clase virtual gratis · sábado 28 de noviembre',
  description:
    'Clase virtual gratis de RR Boxing. Sábado 28 de noviembre, de 9 a 10 a. m. (hora Perú). Inscríbete y te mandamos el link.',
  openGraph: {
    title: 'Clase virtual gratis de RR Boxing · sábado 28 de noviembre',
    description: 'De 9 a 10 a. m. (hora Perú). Gratis: inscríbete y te mandamos el link por WhatsApp.',
    type: 'website',
    images: [IMAGEN_COMPARTIR],
  },
}

const datos: { etiqueta: string; valor: string; nota?: string }[] = [
  { etiqueta: 'Día', valor: 'Sábado 28 de noviembre' },
  { etiqueta: 'Hora', valor: '9 a 10 a. m. (hora Perú)' },
  { etiqueta: 'Dónde', valor: 'Virtual, desde tu casa' },
  { etiqueta: 'Precio', valor: 'Gratis', nota: 'Solo tienes que inscribirte' },
]

export default function ClaseVirtualPage() {
  const vigente = claseVigente()

  return (
    <main className="min-h-screen bg-dark px-4 py-10 text-white sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="inline-block" aria-label="RR Boxing, ir a la tienda">
          <Image src="/rr-boxing-logo.png" alt="RR Boxing" width={40} height={62} priority />
        </Link>

        <h1 className="page-title mt-6">
          Clase virtual <span className="block text-accent">RR Boxing</span>
        </h1>

        <dl className="mt-8 rounded-2xl border border-dark-300 bg-dark-100">
          {datos.map((fila, i) => (
            <div
              key={fila.etiqueta}
              className={`flex items-baseline justify-between gap-4 px-5 py-4 ${
                i > 0 ? 'border-t border-dark-300' : ''
              }`}
            >
              <dt className="text-sm text-neutral">{fila.etiqueta}</dt>
              <dd className="text-right text-base font-medium">
                {fila.valor}
                {fila.nota && <span className="block text-sm font-normal text-neutral">{fila.nota}</span>}
              </dd>
            </div>
          ))}
        </dl>

        <SegunClaseVigente
          inicial={vigente}
          abierta={
            <FormularioClase />
          }
          cerrada={
            <div className="mt-8 rounded-2xl border border-dark-300 bg-dark-100 p-5">
              <p className="text-base leading-relaxed text-white">Las inscripciones de esta clase ya cerraron.</p>
              <a
                href={WHATSAPP_PROXIMA}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-5"
              >
                Preguntar por la próxima clase
              </a>
            </div>
          }
        />
      </div>
    </main>
  )
}
