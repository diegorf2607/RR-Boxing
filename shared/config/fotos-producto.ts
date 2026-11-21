/**
 * Fotos de producto de la tienda, por slug y en el orden en que se muestran (la primera es la principal).
 *
 * Son las 16 fotos hechas el 20 de noviembre a partir de los productos reales (RR\rrboxing-fotos-producto\web),
 * en public/products/nuevas/. La 01 de cada producto va con fondo blanco; después los ángulos, los detalles y la
 * foto en uso. Las «en uso» de los guantes y la cuerda son las versiones sin el rojo del fondo. Al final va la foto
 * real de una alumna con el producto (la que ya estaba en la tienda).
 *
 * data-store.ts (mapProduct) las usa para el catálogo, la ficha, el carrito y el JSON-LD sin tocar la base: las fotos
 * guardadas en Supabase siguen ahí y el panel las sigue mostrando y editando. Si un slug no está aquí, la tienda usa
 * las fotos de la base. Para volver a las de la base, se borra la entrada del slug.
 */

export type TipoFoto = 'producto' | 'ambiente'

export interface FotoProducto {
  url: string
  /** Texto alternativo: qué se ve en la foto (sin repetir «foto de»). */
  alt: string
  /**
   * producto: el producto solo, sobre fondo blanco o gris claro (se muestra entero, object-contain, y sobre el gris
   * de la tarjeta puede ir con mix-blend-multiply).
   * ambiente: foto con fondo propio (en uso, en el gimnasio, de una alumna): llena el cuadro (object-cover).
   */
  tipo: TipoFoto
}

const nueva = (archivo: string) => `/products/nuevas/${archivo}`
/** Las fotos reales que ya estaban en public/products (con el nombre codificado, igual que en la base). */
const real = (archivo: string) => `/products/${encodeURIComponent(archivo)}`

export const FOTOS_PRODUCTO: Readonly<Record<string, readonly FotoProducto[]>> = {
  'guantes-boxeo-woesad': [
    { url: nueva('guantes-01-principal.jpg'), alt: 'Par de guantes de boxeo blancos con dorado', tipo: 'producto' },
    { url: nueva('guantes-02-lateral.jpg'), alt: 'Guante de boxeo visto de costado', tipo: 'producto' },
    { url: nueva('guantes-03-palma.jpg'), alt: 'Palma del guante de boxeo', tipo: 'producto' },
    {
      url: nueva('guantes-04-munequera-abierta.jpg'),
      alt: 'Guante de boxeo con el velcro de la muñeca abierto',
      tipo: 'producto',
    },
    { url: nueva('guantes-05-detalle.jpg'), alt: 'Detalle del dorado y el logo WSD del guante', tipo: 'producto' },
    { url: nueva('guantes-06-en-uso.jpg'), alt: 'Los guantes puestos, en el gimnasio', tipo: 'ambiente' },
  ],
  'vendas-boxeo-45m': [
    { url: nueva('vendas-01-principal.jpg'), alt: 'Dos rollos de vendas para boxeo negras', tipo: 'producto' },
    { url: nueva('vendas-02-desenrollada.jpg'), alt: 'Venda para boxeo desenrollada', tipo: 'producto' },
    {
      url: nueva('vendas-03-detalle-etiqueta.jpg'),
      alt: 'Detalle de la etiqueta Uppercut de la venda',
      tipo: 'producto',
    },
    { url: nueva('vendas-04-mano-vendada.jpg'), alt: 'Mano vendada con la venda negra', tipo: 'ambiente' },
    { url: nueva('vendas-05-en-uso.jpg'), alt: 'Vendándose la mano en el gimnasio', tipo: 'ambiente' },
  ],
  'cuerda-salto-boxeo': [
    { url: nueva('cuerda-01-principal.jpg'), alt: 'Cuerda de salto negra con mangos de espuma', tipo: 'producto' },
    { url: nueva('cuerda-02-extendida.jpg'), alt: 'Cuerda de salto extendida', tipo: 'producto' },
    { url: nueva('cuerda-03-detalle-mangos.jpg'), alt: 'Detalle de los mangos de la cuerda', tipo: 'producto' },
    { url: nueva('cuerda-04-en-uso.jpg'), alt: 'Saltando la cuerda en el gimnasio', tipo: 'ambiente' },
    { url: nueva('cuerda-05-piso-gimnasio.jpg'), alt: 'La cuerda sobre el piso del gimnasio', tipo: 'ambiente' },
  ],
}

/** Las fotos de la tienda para un slug, o null si ese producto usa las de la base. */
export function fotosDeProducto(slug: string): readonly FotoProducto[] | null {
  const fotos = FOTOS_PRODUCTO[slug]
  return fotos && fotos.length > 0 ? fotos : null
}

const POR_URL = new Map<string, FotoProducto>(
  Object.values(FOTOS_PRODUCTO).flatMap((fotos) => fotos.map((f) => [f.url, f] as const))
)

/** Datos de una foto por su URL (alt y tipo), o undefined si no es de esta lista (por ejemplo, una de la base). */
export function datosDeFoto(url: string): FotoProducto | undefined {
  return POR_URL.get(url)
}
