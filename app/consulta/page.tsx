import MainNav from '@/components/MainNav'
import VideoGatedCalendly from '@/components/VideoGatedCalendly'
import Benefits from '@/components/Benefits'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Clases personalizadas | RRBOXING',
  description:
    'Reserva tu llamada con RRBOXING. Conoce el método y acuerda propuesta y precio de entrenamiento 1 a 1 en la consulta.',
}

export default function ConsultaPage() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <VideoGatedCalendly />
      <Benefits />
      <Testimonials />
      <Footer />
    </main>
  )
}
