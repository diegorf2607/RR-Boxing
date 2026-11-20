import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'
import AppProviders from '@/components/AppProviders'
import PieLegal from '@/components/PieLegal'
import { IMAGEN_COMPARTIR } from '@/shared/config/imagen-compartir'

// Fuentes de la marca. next/font las descarga al compilar y las sirve desde el propio sitio: el navegador no le
// pide nada a Google y la letra no cambia de golpe (swap con un respaldo de medidas parecidas).
// globals.css y tailwind.config.ts las usan con estas variables.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas-neue', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rrboxing.com'),
  title: {
    default: 'RR Boxing: tienda de boxeo y clases 1 a 1',
    template: '%s | RR Boxing',
  },
  description:
    'Tienda de RR Boxing: guantes, vendas y cuerda para entrenar. Clases 1 a 1 con Richard; pide información por WhatsApp.',
  openGraph: {
    title: 'RR Boxing',
    description: 'Guantes, vendas y cuerda para entrenar, y clases 1 a 1. Pedidos y consultas por WhatsApp.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'RR Boxing',
    images: [IMAGEN_COMPARTIR],
  },
  // Sin título ni descripción: Next.js los toma del openGraph de cada página.
  twitter: {
    card: 'summary_large_image',
    images: [IMAGEN_COMPARTIR],
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-PE" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body className="antialiased">
        <AppProviders>
          {children}
          <PieLegal />
        </AppProviders>
      </body>
    </html>
  )
}
