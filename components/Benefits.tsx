import { Target, Dumbbell, UserCheck, Shield, TrendingUp, ShoppingBag } from 'lucide-react'

const benefits = [
  {
    icon: Target,
    title: 'Técnica clara, paso a paso',
    description: 'Fundamentos de boxeo explicados con rigor: guardia, desplazamiento, golpes y defensa con sentido.',
  },
  {
    icon: Dumbbell,
    title: 'Condición y rendimiento',
    description: 'Mejora fuerza, coordinación y resistencia con un enfoque atlético, no improvisado.',
  },
  {
    icon: UserCheck,
    title: 'Seguimiento 1 a 1',
    description: 'En clases personalizadas el plan se adapta a tu nivel, objetivos y tiempo real disponible.',
  },
  {
    icon: Shield,
    title: 'Disciplina y hábito',
    description: 'Trabajamos constancia y mentalidad de entrenamiento, no solo “sudar un día”.',
  },
  {
    icon: TrendingUp,
    title: 'De principiante a más exigente',
    description: 'Sirve si empiezas desde cero o si ya entrenas y quieres pulir técnica y volumen.',
  },
  {
    icon: ShoppingBag,
    title: 'Tienda alineada al método',
    description: 'Equipamiento oficial RRBOXING para respaldar lo que practicas: misma exigencia dentro y fuera del ring.',
  },
]

export default function Benefits() {
  return (
    <section id="beneficios" className="bg-dark py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Beneficios de entrenar con RRBOXING</h2>
        <p className="section-subtitle">
          Método probado, comunidad grande en redes y clases personalizadas cuando quieres ir más allá del contenido
          gratuito. Aquí lo que nos diferencia.
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
