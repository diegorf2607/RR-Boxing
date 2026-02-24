import VideoGatedCalendly from '@/components/VideoGatedCalendly'

export const metadata = {
  title: 'Agenda tu Consultoría | RR Boxing Academy',
  description: 'Agenda una llamada de consultoría gratuita con Richard Rodríguez para conocer las clases personalizadas de boxeo.',
}

export default function ConsultaPage() {
  return (
    <main className="min-h-screen bg-dark">
      <VideoGatedCalendly />
    </main>
  )
}
