import type { Metadata } from 'next'
import { IMAGEN_COMPARTIR } from '@/shared/config/imagen-compartir'
import Image from 'next/image'
import Link from 'next/link'
import { CLASE, claseVigente } from '@/shared/lib/clase-virtual'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'
import { SegunClaseVigente } from '@/components/EnlaceClase'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
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

/**
 * /clase va suelta (sin el menú de la tienda ni el WhatsApp flotante: ver components/AppProviders.tsx), toda en negro
 * como la banda de la clase de la portada: el logo, el título grande, las filas con los datos y la inscripción.
 */
export default function ClaseVirtualPage() {
  const vigente = claseVigente()

  return (
    <main className="min-h-screen bg-tinta text-white">
      <div className="contenedor pb-14 pt-4 md:pb-[72px] md:pt-6">
        <Link href="/" className="inline-flex min-h-[44px] items-center" aria-label="RR Boxing, ir a la tienda">
          <Image
            src="/marca/logo-amarillo.png"
            alt=""
            width={307}
            height={420}
            priority
            sizes="40px"
            className="h-[46px] w-auto md:h-[52px]"
          />
        </Link>

        <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[1.15fr_1fr] md:gap-16">
          <h1 className="font-heading text-[60px] leading-[0.9] min-[400px]:text-[68px] md:sticky md:top-10 md:self-start md:text-[96px] xl:text-[120px]">
            Clase virtual <span className="block text-accent">RR Boxing</span>
          </h1>

          <div>
            <dl className="filas">
              {datos.map((fila) => (
                <div key={fila.etiqueta}>
                  <dt>{fila.etiqueta}</dt>
                  <dd>
                    {fila.valor}
                    {fila.nota && <span className="block text-sm font-normal text-claro">{fila.nota}</span>}
                  </dd>
                </div>
              ))}
            </dl>

            <SegunClaseVigente
              inicial={vigente}
              abierta={<FormularioClase />}
              cerrada={
                <div className="mt-8">
                  <p className="text-lg leading-relaxed">Las inscripciones de esta clase ya cerraron.</p>
                  <a href={WHATSAPP_PROXIMA} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5">
                    <IconoWhatsapp />
                    Preguntar por la próxima clase
                  </a>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </main>
  )
}
