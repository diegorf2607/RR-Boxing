import type { Metadata } from 'next'
import './globals.css'
import AppProviders from '@/components/AppProviders'

export const metadata: Metadata = {
  title: {
    default: 'RRBOXING — Tienda y clases personalizadas',
    template: '%s | RRBOXING',
  },
  description:
    'RRBOXING: tienda oficial y entrenamiento personalizado. Las clases 1 a 1 se cotizan en tu llamada.',
  keywords: 'RRBOXING, boxeo, tienda boxeo, clases personalizadas boxeo, equipamiento boxeo',
  openGraph: {
    title: 'RRBOXING',
    description: 'Tienda oficial y clases personalizadas. Precio de entrenamiento en la llamada.',
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
