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
 * Qué ganas con las clases 1 a 1 (/consulta), en la línea A: la cabecera de sección de la maqueta (título a la
 * izquierda, bajada a la derecha) y una caja de filas como las de «Envío» y «Pago» de la ficha: el beneficio a la
 * izquierda y su explicación a la derecha (en el celular, uno debajo del otro).
 */
export default function Benefits() {
  return (
    <section id="beneficios" className="seccion bg-dark">
      <div className="wrap">
        <div className="seccion-cab">
          <h2 className="section-title">Qué ganas entrenando con RR Boxing</h2>
          <p>Clases personalizadas con Richard para cuando quieres ir más allá de los videos gratis de las redes.</p>
        </div>

        <dl className="filas filas-texto">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="grid-cols-1 gap-1 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-x-8"
            >
              <dt className="text-[15.5px]">{benefit.title}</dt>
              <dd className="text-[15px] leading-relaxed">{benefit.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
