/**
 * Slides del hero principal de la tienda (antes del catálogo).
 * Edita este archivo para cambiar imágenes, textos y enlaces (productos, clases, etc.).
 */
export type StoreHeroSlide = {
  id: string
  /** Imagen de fondo (ideal 1600×900+, Unsplash u host permitido en next.config) */
  imageUrl: string
  /** Etiqueta pequeña arriba (estilo “New in”) */
  eyebrow: string
  /** Título principal (usa tipografía script en el componente) */
  headline: string
  text: string
  href: string
  cta: string
  /** Alineación del bloque de texto */
  align?: 'left' | 'right'
}

/** Fondo del slide “Clases personalizadas” (`public/clases-personalizadas/…`). */
const CLASES_HERO_IMAGE = `/clases-personalizadas/${encodeURIComponent('Entrenamiento de boxeo en acción.png')}`

export const STORE_HERO_SLIDES: StoreHeroSlide[] = [
  {
    id: 'coleccion',
    imageUrl:
      'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2000&auto=format&fit=crop',
    eyebrow: 'Nuevo en tienda',
    headline: 'Equipamiento oficial',
    text: 'Guantes, protección y accesorios pensados para entrenar fuerte con estándar RRBOXING. Promo combo: 10% OFF + regalo sorpresa al llevar 2+ artículos.',
    href: '#catalogo',
    cta: 'Ver catálogo',
    align: 'left',
  },
  {
    id: 'producto',
    imageUrl:
      'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2000&auto=format&fit=crop',
    eyebrow: 'Destacado',
    headline: 'Guantes de boxeo',
    text: 'Cuero PU, 12 oz, compresión y soporte para entrenar seguro. Disponible para combo con 10% OFF + regalo.',
    href: '/product/guantes-boxeo-woesad',
    cta: 'Ver producto',
    align: 'left',
  },
  {
    id: 'clases',
    imageUrl: CLASES_HERO_IMAGE,
    eyebrow: '1 a 1',
    headline: 'Clases personalizadas',
    text: 'Plan a tu medida: técnica, condición y mentalidad. La propuesta y el precio los ves en tu llamada.',
    href: '/consulta',
    cta: 'Pedir información',
    align: 'left',
  },
]
