'use client'

import Link from 'next/link'

export default function ClassesPromoSection() {
  return (
    <section className="border-t border-dark-300 bg-dark py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="section-title">Clases personalizadas 1 a 1</h2>
        <p className="section-subtitle max-w-xl">
          Entrena a tu ritmo, con un plan para lo que buscas. Escríbenos y te contamos cómo son las clases, qué
          horarios hay y cuánto cuestan.
        </p>
        <Link href="/consulta" className="btn-primary mt-6 inline-flex w-auto items-center justify-center">
          Pedir información de clases 1 a 1
        </Link>
      </div>
    </section>
  )
}
