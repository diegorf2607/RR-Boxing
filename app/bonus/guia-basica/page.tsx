import type { Metadata } from 'next'
import Link from 'next/link'
import { CabeceraSola } from '@/components/LegalPageShell'

/** Enlaces dentro del texto: blancos y subrayados (el amarillo queda para los botones) */
const enlace = 'font-medium text-white underline decoration-neutral underline-offset-4 hover:decoration-white'
/** Cada tema de la guía, separado del anterior por una línea fina */
const tema = 'space-y-3 border-t border-line py-7 md:py-8'
/** El título de cada tema: angosto, como los de las cajas de la maqueta */
const tituloTema = 'font-heading text-[26px] leading-[0.95] text-white md:text-[30px]'

export const metadata: Metadata = {
  title: 'Guía básica de boxeo',
  description: 'Lo básico para empezar: guardia, desplazamiento y primer golpe.',
  robots: { index: false, follow: false },
}

export default function GuiaBasicaPage() {
  // La clase grabada solo se enlaza cuando ya tiene video.
  const hayClaseGrabada = Boolean(process.env.NEXT_PUBLIC_POST_PURCHASE_VIDEO_URL?.trim())

  return (
    <>
      <CabeceraSola>
        {hayClaseGrabada ? (
          <Link
            href="/bonus/clase-inicial"
            className="inline-flex min-h-[44px] items-center text-sm font-semibold text-neutral-light transition-colors hover:text-white motion-reduce:transition-none"
          >
            Ver la clase grabada →
          </Link>
        ) : null}
      </CabeceraSola>
      <main className="min-h-screen bg-dark pb-16 pt-8 text-neutral-light md:pb-20 md:pt-12">
        <article className="wrap">
          <div className="max-w-[70ch]">
            <h1 className="page-title">Guía básica de boxeo</h1>
            <p className="mb-8 mt-6 rounded-xl border border-line bg-dark-100 p-4 text-sm text-white">
              Guarda esta página como PDF desde el navegador (Ctrl+P → Guardar como PDF) para llevarla al gimnasio o
              consultarla sin conexión.
            </p>

            <section className={tema}>
              <h2 className={tituloTema}>1. Postura y guardia</h2>
              <p>
                Pies separados al ancho de hombros, dominante atrás. Peso ligeramente adelante en la planta de los pies,
                rodillas flexibles. Guardia cerrada: barbilla abajo, manos a la altura de las mejillas, codos pegados al
                cuerpo para proteger costillas y hígado.
              </p>
            </section>

            <section className={tema}>
              <h2 className={tituloTema}>2. Desplazamiento</h2>
              <p>
                Nunca cruces los pies: primero el pie delantero al avanzar, primero el trasero al retroceder. Pasos cortos
                para mantener equilibrio y poder golpear o defenderte en cualquier momento.
              </p>
            </section>

            <section className={tema}>
              <h2 className={tituloTema}>3. El jab (directo de izquierda si eres diestro)</h2>
              <p>
                Sale en línea recta desde la guardia, hombro que rota levemente, mano que vuelve igual de rápido de lo que
                sale. Sirve para medir la distancia y preparar la derecha.
              </p>
            </section>

            <section className={tema}>
              <h2 className={tituloTema}>4. Respiración y tensión</h2>
              <p>
                Exhala en cada esfuerzo (golpe o parada). Fuera del impacto, mantén hombros y mandíbula relajados; la
                tensión excesiva gasta oxígeno y te hace más lento.
              </p>
            </section>

            <section className={tema}>
              <h2 className={tituloTema}>5. Equipo y cuidado</h2>
              <p>
                Vendas siempre antes del guante para estabilizar muñeca y nudillos. Airea el equipo después de entrenar;
                la higiene prolonga la vida del material y evita infecciones en la piel.
              </p>
            </section>

            <p className="border-t border-line pt-6 text-sm text-neutral">
              Esta guía es material introductorio. Para progresar con técnica supervisada, considera las{' '}
              <Link href="/consulta" className={enlace}>
                clases 1 a 1 con Richard
              </Link>
              .
            </p>
          </div>
        </article>
      </main>
    </>
  )
}
