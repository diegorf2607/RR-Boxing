import type { CartItem, CountryCode, Product } from '@/shared/types/commerce'
import { formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { resumenCombo } from '@/shared/lib/combo-promo'
import { enlaceWhatsapp, mensajePedidoWhatsapp } from '@/shared/lib/whatsapp'
import { getPriceForCountry } from '@/features/store/pricing'
import { coloresDisponibles, nombreConVariante, textoColores } from '@/features/store/colores'

/**
 * Si el producto tiene el atributo «Colores disponibles», la pregunta para que la persona elija el color
 * en el mensaje de WhatsApp: «Color de Guantes de boxeo (Negro, blanco):». Si no, null.
 */
export function preguntaColor(product: Product): string | null {
  const colores = textoColores(product)
  if (!colores) return null
  return `Color de ${product.name.trim()} (${colores}):`
}

/** Una línea del pedido: el producto, cuántas unidades y el color elegido (si tiene). */
export interface LineaPedido {
  product: Product
  quantity: number
  variante?: CartItem['variante']
}

/**
 * Enlace de WhatsApp con el pedido ya escrito, en la moneda del país elegido. Cada línea lleva su color; si un
 * producto que viene en varios colores llega sin color (un carrito guardado antes), el mensaje deja la pregunta.
 * El combo se calcula igual que en el carrito y en el servidor (`resumenCombo`).
 */
export function enlacePedidoLineas(lineas: LineaPedido[], country: CountryCode): string {
  const locale = getCountryConfig(country).locale
  const conPrecio = lineas.map((l) => ({ ...l, price: getPriceForCountry(l.product, country) }))
  const moneda = conPrecio[0]?.price.currency ?? getCountryConfig(country).currency
  const fmt = (amount: number) => formatCurrency(amount, moneda, locale)

  const combo = resumenCombo(
    conPrecio.map((l) => ({ unitAmount: l.price.amount, quantity: l.quantity, comboEligible: l.product.comboEligible }))
  )

  const preguntas = conPrecio
    .filter((l) => !l.variante?.color && coloresDisponibles(l.product).length > 0)
    .map((l) => preguntaColor(l.product))
    .filter((p): p is string => p !== null)
    .filter((p, i, todas) => todas.indexOf(p) === i)

  return enlaceWhatsapp(
    mensajePedidoWhatsapp({
      lineas: conPrecio.map((l) => ({
        nombre: nombreConVariante(l.product.name, l.variante),
        cantidad: l.quantity,
        total: fmt(l.price.amount * l.quantity),
      })),
      subtotal: fmt(combo.subtotal),
      ...(combo.descuento > 0 ? { descuento: fmt(combo.descuento) } : {}),
      total: fmt(combo.total),
      ...(preguntas.length > 0 ? { preguntas } : {}),
    })
  )
}

/**
 * Enlace de WhatsApp con el pedido de un solo producto ya escrito (las tarjetas del catálogo). Sin color elegido,
 * el mensaje pregunta el color.
 */
export function enlacePedidoProducto(
  product: Product,
  country: CountryCode,
  cantidad = 1,
  variante?: CartItem['variante']
): string {
  const quantity = Math.max(1, Math.floor(cantidad) || 1)
  return enlacePedidoLineas([{ product, quantity, variante }], country)
}

/** Enlace para preguntar por un producto agotado. */
export function enlaceConsultaAgotado(product: Product): string {
  return enlaceWhatsapp(`Hola, RR Boxing. ¿Cuándo vuelven a tener ${product.name.trim()}?`)
}
