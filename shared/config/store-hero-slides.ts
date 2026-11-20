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
    eyebrow: 'Tienda RR Boxing',
    headline: 'Equipo para entrenar',
    text: 'Guantes, vendas y cuerda de salto. Llevando 2 o más productos tienes 10% de descuento, y haces tu pedido por WhatsApp.',
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
    text: 'Cuero PU, 12 oz y cierre de velcro. Con otro producto más en tu pedido, tienes 10% de descuento.',
    href: '/product/guantes-boxeo-woesad',
    cta: 'Ver producto',
    align: 'left',
  },
  {
    id: 'clases',
    imageUrl: CLASES_HERO_IMAGE,
    eyebrow: '1 a 1',
    headline: 'Clases personalizadas',
    text: 'Un plan a tu medida con Richard. Escríbenos por WhatsApp y te contamos cómo son las clases y cuánto cuestan.',
    href: '/consulta',
    cta: 'Clases 1 a 1',
    align: 'left',
  },
]
