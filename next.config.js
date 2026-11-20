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

const nextConfig = {
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
