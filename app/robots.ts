import type { MetadataRoute } from 'next'

/** robots.txt: todo a la vista salvo el panel, el acceso, la API, los regalos y los pasos de compra. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/api/', '/bonus/', '/checkout', '/cart', '/pagar'],
    },
    sitemap: 'https://www.rrboxing.com/sitemap.xml',
  }
}
