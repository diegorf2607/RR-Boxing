'use client'

import Link from 'next/link'

export default function ClassesPromoSection() {
  return (
    <section className="border-t border-dark-300 bg-gradient-to-b from-dark-100 to-dark py-14">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Entrenamiento personalizado</p>
        <h2 className="mb-3 text-2xl font-bold md:text-3xl">Clases personalizadas 1 a 1</h2>
        <p className="mx-auto mb-6 max-w-xl text-neutral-light">
          Primero la tienda; si quieres ir más lejos con RRBOXING, agenda una llamada. Ahí vemos objetivos, disponibilidad y
          <span className="text-white"> propuesta con precio</span> — no publicamos tarifas de clases en la web.
        </p>
        <Link
          href="/consulta"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-8 py-3 text-base font-bold text-white shadow-lg shadow-red-500/30 transition-transform hover:scale-[1.02]"
        >
          Ir a reservar mi llamada
        </Link>
      </div>
    </section>
  )
}
