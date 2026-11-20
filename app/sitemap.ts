import type { MetadataRoute } from 'next'
import { getProducts } from '@/shared/lib/data-store'
import { claseVigente } from '@/shared/lib/clase-virtual'

const BASE = 'https://www.rrboxing.com'

/** Páginas públicas que siempre van en el mapa. */
const PAGINAS_FIJAS = ['', '/consulta', '/garantia', '/terminos', '/privacidad', '/reembolso']

/** Se vuelve a armar cada hora para sumar o quitar fichas de producto. */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /clase solo va mientras la clase virtual no haya terminado.
  const rutas = claseVigente() ? [...PAGINAS_FIJAS, '/clase'] : PAGINAS_FIJAS
  const fijas: MetadataRoute.Sitemap = rutas.map((ruta) => ({ url: `${BASE}${ruta}` }))

  let fichas: MetadataRoute.Sitemap = []
  try {
    const productos = await getProducts()
    fichas = productos
      .filter((p) => p.active && p.slug)
      .map((p) => ({
        url: `${BASE}/product/${encodeURIComponent(p.slug)}`,
        ...(p.updatedAt ? { lastModified: new Date(p.updatedAt) } : {}),
      }))
  } catch (error) {
    // Si la base no responde, el mapa sale igual con las páginas fijas.
    console.error('[sitemap] No se pudieron leer los productos:', error)
  }

  return [...fijas, ...fichas]
}
