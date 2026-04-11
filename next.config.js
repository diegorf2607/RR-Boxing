/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  /**
   * Vercel + integración Stripe a veces define solo STRIPE_PUBLISHABLE_KEY.
   * El cliente necesita NEXT_PUBLIC_*; unificamos aquí sin exponer el secreto.
   */
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
}

module.exports = nextConfig
