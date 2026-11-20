/**
 * Slides del hero principal de la tienda (antes del catálogo).
 * Edita este archivo para cambiar imágenes, textos y enlaces (productos, clases, etc.).
 */
export type StoreHeroSlide = {
  id: string
  /** Imagen de fondo: fotos reales de RR Boxing en public/ (ideal 1600×900 o más si es horizontal) */
  imageUrl: string
  /**
   * Foto vertical (de celular): en escritorio va en la mitad derecha, para que no se corte ni quede debajo del texto.
   * En el celular ocupa todo el fondo, como las demás.
   */
  vertical?: boolean
  /** Qué parte de la foto queda a la vista cuando se recorta (object-position de CSS), por ejemplo 'center 55%' */
  encuadre?: string
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

/** Fotos reales de alumnas con los productos de la tienda (`public/products/…`), en vez de fotos de stock. */
const foto = (archivo: string) => `/products/${encodeURIComponent(archivo)}`

export const STORE_HERO_SLIDES: StoreHeroSlide[] = [
  {
    id: 'coleccion',
    imageUrl: foto('Vendas Uppercut Cliente 2.jpeg'),
    vertical: true,
    encuadre: 'center 45%',
    eyebrow: 'Tienda RR Boxing',
    headline: 'Equipo para entrenar',
    text: 'Guantes, vendas y cuerda de salto. Llevando 2 o más productos tienes 10% de descuento, y haces tu pedido por WhatsApp.',
    href: '#catalogo',
    cta: 'Ver catálogo',
    align: 'left',
  },
  {
    id: 'producto',
    // Los mismos guantes que se venden (Woesad/WSD blanco y dorado), en manos de una alumna
    imageUrl: foto('Guantes WSD CLIENTE 3.jpeg'),
    vertical: true,
    encuadre: 'center 58%',
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
