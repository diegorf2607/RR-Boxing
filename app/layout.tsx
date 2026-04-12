import type { Metadata } from 'next'
import './globals.css'
import AppProviders from '@/components/AppProviders'

/** `public/RR BOXING VERTICAL TRAZADO.png` — favicon / miniatura de pestaña */
const FAVICON_PNG = `/RR%20BOXING%20VERTICAL%20TRAZADO.png`

export const metadata: Metadata = {
  title: {
    default: 'RRBOXING — Tienda y clases personalizadas',
    template: '%s | RRBOXING',
  },
  description:
    'RRBOXING: tienda oficial y entrenamiento personalizado. Las clases 1 a 1 se cotizan en tu llamada.',
  keywords: 'RRBOXING, boxeo, tienda boxeo, clases personalizadas boxeo, equipamiento boxeo',
  icons: {
    icon: [{ url: FAVICON_PNG, type: 'image/png' }],
    shortcut: FAVICON_PNG,
    apple: [{ url: FAVICON_PNG, type: 'image/png' }],
  },
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
