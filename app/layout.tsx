import type { Metadata } from 'next'
import './globals.css'
import { ModalProvider } from '@/components/ModalProvider'

export const metadata: Metadata = {
  title: 'RR Boxing Academy - Domina los Fundamentos del Boxeo en 7 Días',
  description: 'Aprende boxeo desde cero con nuestro curso online. Sin gimnasio. Sin experiencia. Solo motivación. Más de 400,000 seguidores confían en nosotros.',
  keywords: 'boxeo, curso boxeo online, aprender boxeo, RR Boxing, entrenamiento boxeo, boxeo para principiantes',
  openGraph: {
    title: 'RR Boxing Academy - Curso de Boxeo Online',
    description: 'Domina los fundamentos del boxeo en solo 7 días. Acceso de por vida, 100% online.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  )
}
