'use client'

import Link from 'next/link'

export default function ClassesPromoSection() {
  return (
    <section className="border-t border-dark-300 bg-gradient-to-b from-dark-100 to-dark py-14">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-2 text-sm font-semibold text-accent">Entrenamiento personalizado</p>
        <h2 className="mb-3 text-2xl font-bold md:text-3xl">Clases personalizadas 1 a 1</h2>
        <p className="mx-auto mb-6 max-w-xl text-neutral-light">
          Entrena a tu ritmo, con un plan para lo que buscas. Escríbenos y te contamos cómo son las clases, qué
          horarios hay y cuánto cuestan.
        </p>
        <Link
          href="/consulta"
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-8 py-3 text-base font-bold text-white transition-colors hover:bg-red-700"
        >
          Pedir información de clases 1 a 1
        </Link>
      </div>
    </section>
  )
}
