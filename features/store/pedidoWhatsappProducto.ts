import type { CountryCode, Product } from '@/shared/types/commerce'
import { formatCurrency, getCountryConfig } from '@/shared/lib/country'
import { resumenCombo } from '@/shared/lib/combo-promo'
import { enlaceWhatsapp, mensajePedidoWhatsapp } from '@/shared/lib/whatsapp'
import { getPriceForCountry } from '@/features/store/pricing'

/**
 * Si el producto tiene el atributo «Colores disponibles», la pregunta para que la persona elija el color
 * en el mensaje de WhatsApp: «Color de Guantes de boxeo (Negro, blanco):». Si no, null.
 */
export function preguntaColor(product: Product): string | null {
  const colores = product.attributes
    ?.find((attr) => attr.label.trim().toLowerCase() === 'colores disponibles')
    ?.value.trim()
  if (!colores) return null
  return `Color de ${product.name.trim()} (${colores}):`
}

/**
 * Enlace de WhatsApp con el pedido de un solo producto ya escrito, en la moneda del país elegido.
 * El combo se calcula igual que en el carrito y en el servidor (`resumenCombo`): con 2 o más unidades
 * de un producto que participa del combo, 10% de descuento.
 */
export function enlacePedidoProducto(product: Product, country: CountryCode, cantidad = 1): string {
  const qty = Math.max(1, Math.floor(cantidad) || 1)
  const price = getPriceForCountry(product, country)
  const locale = getCountryConfig(country).locale
  const fmt = (amount: number) => formatCurrency(amount, price.currency, locale)

  const combo = resumenCombo([
    { unitAmount: price.amount, quantity: qty, comboEligible: product.comboEligible },
  ])
  const color = preguntaColor(product)

  return enlaceWhatsapp(
    mensajePedidoWhatsapp({
      lineas: [{ nombre: product.name.trim(), cantidad: qty, total: fmt(combo.subtotal) }],
      subtotal: fmt(combo.subtotal),
      ...(combo.descuento > 0 ? { descuento: fmt(combo.descuento) } : {}),
      total: fmt(combo.total),
      ...(color ? { preguntas: [color] } : {}),
    })
  )
}

/** Enlace para preguntar por un producto agotado. */
export function enlaceConsultaAgotado(product: Product): string {
  return enlaceWhatsapp(`Hola, RR Boxing. ¿Cuándo vuelven a tener ${product.name.trim()}?`)
}
