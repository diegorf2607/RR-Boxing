/** @type {import('next').NextConfig} */
function supabaseImageHost() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!raw) return null
  try {
    return new URL(raw).hostname
  } catch {
    return null
  }
}

const supabaseHost = supabaseImageHost()

// Atajos para las bios y los estados: rrboxing.com/ig, /tt, /fb, /yt y /wa llevan al inicio con su etiqueta (utm_*).
// Al entrar, shared/lib/origen.ts guarda de dónde llegó la persona y ese origen viaja con su pedido o su inscripción.
// Son temporales (307): si mañana un atajo cambia de destino, ningún navegador lo dejó guardado.
// Un atajo no puede llamarse como una página de app/ ni como un archivo de public/.
const ATAJOS = [
  { atajo: 'ig', fuente: 'instagram', medio: 'bio' },
  { atajo: 'tt', fuente: 'tiktok', medio: 'bio' },
  { atajo: 'fb', fuente: 'facebook', medio: 'bio' },
  { atajo: 'yt', fuente: 'youtube', medio: 'bio' },
  { atajo: 'wa', fuente: 'whatsapp', medio: 'estado' },
]

// Cabeceras que no cambian nada de lo que se ve. La política de contenido (CSP) queda para cuando esté elegida la
// pasarela de pago (hallazgo SEG-10): depende de sus dominios, de YouTube y de Mercado Pago.
const cabecerasSeguras = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
]

const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    return ATAJOS.map(({ atajo, fuente, medio }) => ({
      source: `/${atajo}`,
      destination: `/?utm_source=${fuente}&utm_medium=${medio}`,
      permanent: false,
    }))
  },
  async headers() {
    return [
      { source: '/:path*', headers: cabecerasSeguras },
      // El panel, el acceso y la API no aparecen en los buscadores
      ...['/admin', '/admin/:path*', '/login', '/api/:path*'].map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })),
    ]
  },
  // En local, cada servidor de prueba puede usar su propia carpeta (NEXT_DIST_DIR); en Vercel queda .next.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    // Hosts de los que next/image puede bajar y optimizar fotos (remotePatterns reemplaza a `domains`, ya obsoleto):
    // las fotos del carrusel (Unsplash), las portadas de los testimonios (miniaturas de YouTube) y Supabase Storage.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
      ...(supabaseHost ? [{ hostname: supabaseHost }] : []),
    ],
  },
}

module.exports = nextConfig
