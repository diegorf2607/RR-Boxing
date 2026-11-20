const benefits = [
  {
    title: 'Técnica clara, paso a paso',
    description: 'Los fundamentos del boxeo explicados con calma: guardia, desplazamiento, golpes y defensa.',
  },
  {
    title: 'Condición física a tu ritmo',
    description: 'Trabajas fuerza, coordinación y resistencia según tu nivel, sin necesidad de experiencia previa.',
  },
  {
    title: 'Seguimiento 1 a 1',
    description: 'En las clases personalizadas el plan se adapta a tu nivel, tus objetivos y el tiempo que tienes.',
  },
  {
    title: 'Constancia y hábito',
    description: 'La idea es que entrenes de forma constante, no solo un día.',
  },
  {
    title: 'Desde cero o si ya entrenas',
    description: 'Si ya entrenas, también te sirve para pulir tu técnica.',
  },
  {
    title: 'Lo básico en la tienda',
    description: 'Guantes, vendas y cuerda de salto para entrenar en casa o en clase.',
  },
]

/** Qué ganas con las clases 1 a 1 (/consulta): filas con líneas finas, como las de arriba en la misma página. */
export default function Benefits() {
  return (
    <section id="beneficios" className="border-t border-dark-300 bg-dark py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="section-title">Qué ganas entrenando con RR Boxing</h2>
        <p className="section-subtitle">
          Clases personalizadas con Richard para cuando quieres ir más allá de los videos gratis de las redes.
        </p>

        <dl className="mt-8 max-w-3xl rounded-2xl border border-dark-300 bg-dark-100">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="border-t border-dark-300 px-5 py-4 first:border-t-0">
              <dt className="text-base font-medium text-white">{benefit.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-neutral-light">{benefit.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
