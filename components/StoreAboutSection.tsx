import Link from 'next/link'
import Image from 'next/image'

/** Logo vertical oficial (también en `app/admin/` del repo). */
const LOGO_VERTICAL_SRC = '/RR BOXING VERTICAL TRAZADO.png'

export default function StoreAboutSection() {
  return (
    <section className="border-t border-dark-300 bg-dark py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
          {/* En el celular el logo ocupaba una pantalla entera: ahí ya está en el menú, así que va solo en escritorio */}
          <div className="relative hidden aspect-[4/5] w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-dark-300 bg-dark-100 md:flex">
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
            <h2 className="section-title mb-4">
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
            <Link href="/consulta" className="btn-secondary inline-flex w-auto items-center justify-center">
              Clases 1 a 1
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
