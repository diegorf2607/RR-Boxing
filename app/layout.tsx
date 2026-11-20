import type { Metadata, Viewport } from 'next'
import { Archivo } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import AppProviders from '@/components/AppProviders'
import PieLegal from '@/components/PieLegal'
import { IMAGEN_COMPARTIR } from '@/shared/config/imagen-compartir'

// La letra de la marca: Archivo, variable en peso y en ancho (wdth 62–125), para el cuerpo y para los titulares
// angostos (font-stretch en .font-heading, globals.css). next/font la descarga al compilar y la sirve desde el propio
// sitio: el navegador no le pide nada a Google y la letra no cambia de golpe (swap con un respaldo de medidas
// parecidas). globals.css y tailwind.config.ts la usan con la variable --font-archivo.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' })

// Search Console: el código de la etiqueta «google-site-verification» (solo el valor de content), en Vercel.
const verificacionGoogle = process.env.GOOGLE_SITE_VERIFICATION?.trim()

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
  ...(verificacionGoogle ? { verification: { google: verificacionGoogle } } : {}),
}

/**
 * Vercel Web Analytics, sin cookies: cuenta visitas y de dónde llegan sin guardar nada en el navegador.
 * Se carga solo en producción y solo si NEXT_PUBLIC_ANALITICA=1 (además hay que activar Web Analytics en el
 * proyecto de Vercel; si no, /_vercel/insights/script.js no existe). El panel y el acceso no se cuentan.
 * Es el mismo script que instala @vercel/analytics, sin agregar dependencias.
 */
function AnaliticaVercel() {
  const activa =
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_ANALITICA === '1' &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production')
  if (!activa) return null
  const codigo = [
    '(function(){window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};',
    "window.va('beforeSend',function(e){try{var r=new URL(e.url).pathname;",
    "if(['/admin','/login'].some(function(p){return r===p||r.indexOf(p+'/')===0}))return null}catch(_){}return e});",
    "var s=document.createElement('script');s.defer=true;s.src='/_vercel/insights/script.js';document.head.appendChild(s)})();",
  ].join('')
  return <Script id="analitica-vercel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: codigo }} />
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
    <html lang="es-PE" className={archivo.variable}>
      <body className="bg-dark font-sans text-white antialiased">
        <AppProviders>
          {children}
          <PieLegal />
        </AppProviders>
        <AnaliticaVercel />
      </body>
    </html>
  )
}
