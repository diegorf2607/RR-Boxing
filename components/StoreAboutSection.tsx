import Link from 'next/link'
import Image from 'next/image'

/** Logo vertical oficial (también en `app/admin/` del repo). */
const LOGO_VERTICAL_SRC = '/RR BOXING VERTICAL TRAZADO.png'

export default function StoreAboutSection() {
  return (
    <section className="border-t border-dark-300 bg-gradient-to-b from-dark-100/80 to-dark py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center md:gap-14">
          <div className="relative mx-auto flex aspect-[4/5] w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-dark-300 bg-dark-100 md:mx-0 md:max-w-md">
            <Image
              src={LOGO_VERTICAL_SRC}
              alt="Logo de RR Boxing"
              fill
              className="object-contain p-8 md:p-12"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={false}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Quiénes somos</p>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              RR Boxing: <span className="text-accent">tienda y clases</span>
            </h2>
            <p className="mb-4 text-neutral-light leading-relaxed">
              En la <strong className="text-white">tienda</strong> encuentras lo básico para entrenar: guantes, vendas
              y cuerda de salto. Haces tu pedido por WhatsApp y ahí te confirmamos el envío.
            </p>
            <p className="mb-2 text-sm font-medium text-white">Richard Rodríguez, el profe de RR Boxing</p>
            <p className="mb-6 text-neutral-light leading-relaxed">
              Las <strong className="text-white">clases personalizadas 1 a 1</strong> son con Richard, con un plan
              hecho para ti. Se piden por WhatsApp y ahí te contamos cómo son y cuánto cuestan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/consulta"
                className="inline-flex rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/25"
              >
                Clases 1 a 1
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
