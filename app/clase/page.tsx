import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CLASE } from '@/shared/lib/clase-virtual'
import FormularioClase from './FormularioClase'

const WHATSAPP_TEXTO =
  'Hola, ya pagué la clase virtual del sábado 28 de noviembre. Te mando mi comprobante.'
const WHATSAPP_URL = `https://wa.me/${CLASE.whatsappNumero}?text=${encodeURIComponent(WHATSAPP_TEXTO)}`

export const metadata: Metadata = {
  title: 'Clase virtual · sábado 28 de noviembre',
  description:
    'Clase virtual de RR Boxing. Sábado 28 de noviembre, de 9 a 10 a. m. (hora Perú). S/ 30 o US$ 10 si pagas desde fuera.',
  openGraph: {
    title: 'Clase virtual RR Boxing · sábado 28 de noviembre',
    description: 'De 9 a 10 a. m. (hora Perú). S/ 30 o US$ 10 si pagas desde fuera.',
    type: 'website',
  },
}

const datos: { etiqueta: string; valor: string; nota?: string }[] = [
  { etiqueta: 'Día', valor: 'Sábado 28 de noviembre' },
  { etiqueta: 'Hora', valor: '9 a 10 a. m. (hora Perú)' },
  { etiqueta: 'Dónde', valor: 'Virtual, desde tu casa' },
  { etiqueta: 'Precio', valor: 'S/ 30', nota: 'US$ 10 si pagas desde fuera' },
]

export default function ClaseVirtualPage() {
  return (
    <main className="min-h-screen bg-dark px-4 py-10 text-white sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="inline-block" aria-label="RR Boxing, ir a la tienda">
          <Image src="/rr-boxing-logo.png" alt="RR Boxing" width={40} height={62} priority />
        </Link>

        <h1 className="mt-6 font-heading text-5xl leading-none text-white sm:text-6xl">
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

        <FormularioClase />

        <div className="mt-8 border-t border-dark-300 pt-8">
          <p className="text-base leading-relaxed">
            Después de pagar, manda tu comprobante al WhatsApp{' '}
            <span className="whitespace-nowrap font-semibold">{CLASE.whatsappLegible}</span> y te enviamos el link
            de la clase.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 block rounded-lg border border-accent px-6 py-3.5 text-center font-bold text-accent transition-colors hover:bg-accent hover:text-dark"
          >
            Mandar mi comprobante
          </a>
        </div>
      </div>
    </main>
  )
}
