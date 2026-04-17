import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Guía básica de boxeo — regalo RRBOXING',
  description: 'Fundamentos que todo boxeador debe dominar: guardia, desplazamiento y primer golpe.',
}

export default function GuiaBasicaPage() {
  return (
    <main className="min-h-screen bg-dark text-neutral-light">
      <header className="border-b border-dark-300 bg-dark-100 px-4 py-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <Link href="/" className="font-heading text-xl tracking-wide text-accent">
            RRBOXING
          </Link>
          <Link href="/bonus/clase-inicial" className="text-sm text-accent hover:underline">
            Ver clase grabada de bienvenida →
          </Link>
        </div>
      </header>
      <article className="container mx-auto max-w-2xl px-4 py-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">Regalo tienda oficial</p>
        <h1 className="mb-6 font-heading text-4xl font-bold tracking-wide text-white md:text-5xl">
          Guía básica de boxeo
        </h1>
        <p className="mb-8 rounded-xl border border-accent/20 bg-dark-100 p-4 text-sm text-white">
          Guardá esta página como PDF desde el navegador (Ctrl+P → Guardar como PDF) para llevarla al gimnasio o
          consultarla sin conexión.
        </p>

        <section className="mb-10 space-y-3">
          <h2 className="font-heading text-2xl text-white">1. Postura y guardia</h2>
          <p>
            Pies separados al ancho de hombros, dominante atrás. Peso ligeramente adelante en la planta de los pies,
            rodillas flexibles. Guardia cerrada: barbilla abajo, manos a la altura de las mejillas, codos pegados al
            cuerpo para proteger costillas y hígado.
          </p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="font-heading text-2xl text-white">2. Desplazamiento</h2>
          <p>
            Nunca cruces los pies: primero el pie delantero al avanzar, primero el trasero al retroceder. Pasos cortos
            para mantener equilibrio y poder golpear o defenderte en cualquier momento.
          </p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="font-heading text-2xl text-white">3. El jab (directo de izquierda si eres diestro)</h2>
          <p>
            Sale en línea recta desde la guardia, hombro que rota levemente, mano que vuelve igual de rápido de lo que
            sale. Sirve para medir distancia, tapar la visión del rival y preparar la derecha.
          </p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="font-heading text-2xl text-white">4. Respiración y tensión</h2>
          <p>
            Exhala en cada esfuerzo (golpe o parada). Fuera del impacto, mantén hombros y mandíbula relajados; la
            tensión excesiva gasta oxígeno y te hace más lento.
          </p>
        </section>

        <section className="mb-10 space-y-3">
          <h2 className="font-heading text-2xl text-white">5. Equipo y cuidado</h2>
          <p>
            Vendas siempre antes del guante para estabilizar muñeca y nudillos. Airea el equipo después de entrenar;
            la higiene prolonga la vida del material y evita infecciones en la piel.
          </p>
        </section>

        <p className="text-sm text-neutral">
          Esta guía es material introductorio. Para progresar con técnica supervisada, considera las{' '}
          <Link href="/consulta" className="text-accent underline">
            clases personalizadas RRBOXING
          </Link>
          .
        </p>
      </article>
    </main>
  )
}
