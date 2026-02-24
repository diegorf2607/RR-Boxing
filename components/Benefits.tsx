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
    <section className="py-12 md:py-20 bg-dark">
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

        {/* Benefits - Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[260px] md:w-auto snap-center card group hover:bg-dark-200"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:bg-accent/20 transition-colors">
                <benefit.icon className="w-6 h-6 md:w-7 md:h-7 text-accent" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white">
                {benefit.title}
              </h3>
              <p className="text-neutral text-sm md:text-base">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
        {/* Scroll hint for mobile */}
        <p className="text-center text-neutral text-xs mt-2 md:hidden">
          ← Desliza para ver más →
        </p>
      </div>
    </section>
  )
}
