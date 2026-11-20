'use client'

import { Target, Dumbbell, UserCheck, Shield, TrendingUp, ShoppingBag } from 'lucide-react'

const benefits = [
  {
    icon: Target,
    title: 'Técnica clara, paso a paso',
    description: 'Los fundamentos del boxeo explicados con calma: guardia, desplazamiento, golpes y defensa.',
  },
  {
    icon: Dumbbell,
    title: 'Condición física a tu ritmo',
    description: 'Trabajas fuerza, coordinación y resistencia según tu nivel, sin necesidad de experiencia previa.',
  },
  {
    icon: UserCheck,
    title: 'Seguimiento 1 a 1',
    description: 'En las clases personalizadas el plan se adapta a tu nivel, tus objetivos y el tiempo que tienes.',
  },
  {
    icon: Shield,
    title: 'Constancia y hábito',
    description: 'La idea es que entrenes de forma constante, no solo un día.',
  },
  {
    icon: TrendingUp,
    title: 'Desde cero o si ya entrenas',
    description: 'Si ya entrenas, también te sirve para pulir tu técnica.',
  },
  {
    icon: ShoppingBag,
    title: 'Lo básico en la tienda',
    description: 'Guantes, vendas y cuerda de salto para entrenar en casa o en clase.',
  },
]

export default function Benefits() {
  return (
    <section id="beneficios" className="bg-dark py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Qué ganas entrenando con RR Boxing</h2>
        <p className="section-subtitle">
          Clases personalizadas con Richard para cuando quieres ir más allá de los videos gratis de las redes.
        </p>

        <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 md:overflow-visible md:pb-0">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="card group w-[260px] flex-shrink-0 snap-center hover:bg-dark-200 md:w-auto"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover:bg-accent/20 md:mb-4 md:h-14 md:w-14">
                <benefit.icon className="h-6 w-6 text-accent md:h-7 md:w-7" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-white md:mb-2 md:text-xl">{benefit.title}</h3>
              <p className="text-sm text-neutral md:text-base">{benefit.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-neutral md:hidden">← Desliza para ver más →</p>
      </div>
    </section>
  )
}
