import type { CartItem, Product } from '@/shared/types/commerce'

type ConAtributos = Pick<Product, 'attributes'>

/** El valor del atributo «Colores disponibles» tal como está en el panel («Negro, blanco»), o null. */
export function textoColores(product: ConAtributos): string | null {
  const valor = product.attributes
    ?.find((attr) => attr.label.trim().toLowerCase() === 'colores disponibles')
    ?.value.trim()
  return valor || null
}

const conMayuscula = (texto: string) => texto.charAt(0).toLocaleUpperCase('es-PE') + texto.slice(1)

/**
 * Los colores para elegir en la ficha: «Negro, blanco» → ['Negro', 'Blanco']. Acepta comas, «y», «o» y «/».
 * Sin el atributo, o con un solo color, no hay nada que elegir y devuelve [].
 */
export function coloresDisponibles(product: ConAtributos): string[] {
  const texto = textoColores(product)
  if (!texto) return []
  const colores = texto
    .split(/\s*(?:,|\/|;|\by\b|\bo\b)\s*/i)
    .map((c) => c.trim())
    .filter(Boolean)
    .map(conMayuscula)
  const unicos = colores.filter((c, i) => colores.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === i)
  return unicos.length > 1 ? unicos : []
}

/** La variante limpia para guardar en el carrito: sin espacios de más y sin campos vacíos. */
export function limpiarVariante(variante: CartItem['variante'] | null | undefined): CartItem['variante'] {
  const color = typeof variante?.color === 'string' ? variante.color.trim().slice(0, 40) : ''
  return color ? { color } : undefined
}

/** «Guantes de boxeo (Negro)»: el nombre con el color elegido, para el carrito y el mensaje de WhatsApp. */
export function nombreConVariante(nombre: string, variante?: CartItem['variante']): string {
  const limpio = nombre.trim()
  return variante?.color ? `${limpio} (${variante.color})` : limpio
}

/**
 * Mientras no haya una foto de cada color, las fotos de estos productos muestran uno solo (por slug). Cuando Diego
 * suba la foto del otro color, se saca de aquí; o se pone el atributo «Color de las fotos» en el panel, que manda.
 */
const COLOR_DE_LAS_FOTOS: Record<string, string> = {
  'guantes-boxeo-woesad': 'blanco',
}

/** El color que muestran las fotos de un producto que viene en varios colores («blanco»), o null si no se sabe. */
export function colorDeLasFotos(product: Pick<Product, 'slug' | 'attributes'>): string | null {
  if (coloresDisponibles(product).length === 0) return null
  const atributo = product.attributes
    ?.find((attr) => attr.label.trim().toLowerCase() === 'color de las fotos')
    ?.value.trim()
  return (atributo || COLOR_DE_LAS_FOTOS[product.slug] || '').toLocaleLowerCase('es-PE') || null
}
