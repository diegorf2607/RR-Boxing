import { 
  Target, 
  Dumbbell, 
  Smartphone, 
  Clock, 
  Award, 
  Infinity 
} from 'lucide-react'

const benefits = [
  {
    icon: Target,
    title: 'Aprende las bases del boxeo',
    description: 'Técnicas fundamentales enseñadas paso a paso',
  },
  {
    icon: Dumbbell,
    title: 'Mejora fuerza, reflejos y resistencia',
    description: 'Entrena tu cuerpo y mente como un boxeador',
  },
  {
    icon: Smartphone,
    title: 'Entrena desde cualquier dispositivo',
    description: 'Accede desde tu celular, tablet o laptop',
  },
  {
    icon: Clock,
    title: 'Avanza a tu ritmo, cuando quieras',
    description: 'Clases grabadas disponibles 24/7',
  },
  {
    icon: Award,
    title: 'Método 100% diseñado para principiantes',
    description: 'No necesitas experiencia previa en boxeo',
  },
  {
    icon: Infinity,
    title: 'Acceso de por vida a las clases',
    description: 'Repite las lecciones cuantas veces quieras',
  },
]

export default function Benefits() {
  return (
    <section className="py-20 bg-dark">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="section-title">
          Aprende Boxeo Desde Cero
        </h2>
        <p className="section-subtitle">
          Entrena paso a paso las técnicas esenciales del boxeo desde casa. Durante 7 sesiones 
          grabadas, mejorarás tu condición física, coordinación y defensa personal con rutinas 
          prácticas y explicaciones claras.
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="card group hover:bg-dark-200"
            >
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <benefit.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                {benefit.title}
              </h3>
              <p className="text-neutral">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
