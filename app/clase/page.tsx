import type { Metadata } from 'next'
import { IMAGEN_COMPARTIR } from '@/shared/config/imagen-compartir'
import { claseVigente } from '@/shared/lib/clase-virtual'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'
import { SegunClaseVigente } from '@/components/EnlaceClase'
import { CabeceraSola } from '@/components/LegalPageShell'
import IconoWhatsapp from '@/components/legal/IconoWhatsapp'
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
 * La clase virtual, en la línea A: la barra con el logo (sin el menú de la tienda: es una página suelta) y, desde
 * 900 px, dos columnas como la ficha de la maqueta: el título y los datos de la clase en filas a la izquierda, y la
 * inscripción en una caja a la derecha. En el celular va todo en una columna, en el mismo orden.
 */
export default function ClaseVirtualPage() {
  const vigente = claseVigente()

  return (
    <>
      <CabeceraSola />
      <main className="bg-dark pb-16 pt-8 text-white min-[900px]:pb-20 min-[900px]:pt-12">
        <div className="wrap grid grid-cols-1 gap-8 min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] min-[900px]:items-start min-[900px]:gap-16">
          <div className="min-[900px]:sticky min-[900px]:top-8">
            <h1 className="page-title">
              Clase virtual <span className="block text-accent">RR Boxing</span>
            </h1>

            <dl className="filas mt-7">
              {datos.map((fila) => (
                <div key={fila.etiqueta}>
                  <dt>{fila.etiqueta}</dt>
                  <dd>
                    {fila.valor}
                    {fila.nota && <small>{fila.nota}</small>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <SegunClaseVigente
            inicial={vigente}
            abierta={<FormularioClase />}
            cerrada={
              <div className="rounded-2xl border border-line bg-dark-100 p-5 md:p-6">
                <p className="text-base leading-relaxed text-white">Las inscripciones de esta clase ya cerraron.</p>
                <a
                  href={WHATSAPP_PROXIMA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5"
                >
                  <IconoWhatsapp />
                  Preguntar por la próxima clase
                </a>
              </div>
            }
          />
        </div>
      </main>
    </>
  )
}
