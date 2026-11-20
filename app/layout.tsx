import type { Metadata } from 'next'
import './globals.css'
import AppProviders from '@/components/AppProviders'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rrboxing.com'),
  title: {
    default: 'RR Boxing: tienda de boxeo y clases 1 a 1',
    template: '%s | RR Boxing',
  },
  description:
    'Tienda de RR Boxing: guantes, vendas y cuerda para entrenar. Clases 1 a 1 y clases virtuales; pide información por WhatsApp.',
  openGraph: {
    title: 'RR Boxing',
    description: 'Guantes, vendas y cuerda para entrenar, y clases 1 a 1. Pedidos y consultas por WhatsApp.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'RR Boxing',
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
