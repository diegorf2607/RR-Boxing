import MainNav from '@/components/MainNav'
import Benefits from '@/components/Benefits'
import Testimonials from '@/components/Testimonials'
import VideoGatedCalendly from '@/components/VideoGatedCalendly'

export const metadata = {
  title: 'Clases personalizadas | RRBOXING',
  description:
    'Reserva tu llamada con RRBOXING. Conoce el método y acuerda propuesta y precio de entrenamiento 1 a 1 en la consulta.',
}

export default function ConsultaPage() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <VideoGatedCalendly>
        <Benefits />
        <Testimonials />
      </VideoGatedCalendly>
    </main>
  )
}
