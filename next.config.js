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
  images: {
    domains: ['images.unsplash.com', ...(supabaseHost ? [supabaseHost] : [])],
  },
}

module.exports = nextConfig
