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

/**
 * Qué ganas con las clases 1 a 1 (/consulta), en una banda gris: seis puntos con una línea fina arriba, en tres
 * columnas en escritorio, dos en la tableta y uno en el celular.
 */
export default function Benefits() {
  return (
    <section id="beneficios" className="bg-gris py-12 md:py-[72px]">
      <div className="contenedor">
        <h2 className="section-title max-w-4xl">Qué ganas entrenando con RR Boxing</h2>
        <p className="section-subtitle">
          Clases personalizadas con Richard para cuando quieres ir más allá de los videos gratis de las redes.
        </p>

        <dl className="mt-8 grid gap-x-8 sm:grid-cols-2 md:mt-10 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="border-t border-linea-fuerte py-5">
              <dt className="text-lg font-bold">{benefit.title}</dt>
              <dd className="mt-1.5 leading-relaxed text-tinta-2">{benefit.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
