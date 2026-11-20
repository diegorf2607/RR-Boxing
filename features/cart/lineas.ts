import type { CartItem, CountryCode, CurrencyCode, Product } from '@/shared/types/commerce'
import { getPriceForCountry } from '@/features/store/pricing'
import { resumenCombo, type ResumenCombo } from '@/shared/lib/combo-promo'

/**
 * Unidades que acepta cada línea del pedido (producto y color). Es el mismo tope en el carrito, en la ficha y en
 * POST /api/pedido (`lineaPedidoSchema` de shared/lib/cart-checkout.ts): nadie arma en el navegador un carrito que
 * el servidor rechace.
 */
export const MAX_UNIDADES_LINEA = 99

/** Hasta cuántas unidades se pueden elegir con ese stock: el stock, sin pasar el tope por línea (y al menos 1). */
export function topeLinea(stock: number): number {
  return Math.max(1, Math.min(MAX_UNIDADES_LINEA, stock))
}

/** Clave de una línea del carrito: el producto y su color. «Negro» y «Blanco» son dos líneas. */
export function claveLinea(productId: string, variante?: CartItem['variante']): string {
  return `${productId}|${variante?.color?.trim().toLowerCase() ?? ''}`
}

export interface LineaCarrito {
  clave: string
  productId: string
  quantity: number
  variante?: CartItem['variante']
  product: Product
  price: { amount: number; currency: CurrencyCode }
  /** Precio por cantidad, antes del combo */
  lineTotal: number
  agotado: boolean
}

/** Junta lo guardado en el carrito con el catálogo. Lo que ya no está en el catálogo queda fuera. */
export function armarLineas(items: CartItem[], productos: Product[], country: CountryCode): LineaCarrito[] {
  return items.flatMap((item) => {
    const product = productos.find((p) => p.id === item.productId)
    if (!product) return []
    const price = getPriceForCountry(product, country)
    return [
      {
        clave: claveLinea(item.productId, item.variante),
        productId: item.productId,
        quantity: item.quantity,
        variante: item.variante,
        product,
        price,
        lineTotal: price.amount * item.quantity,
        agotado: product.stock <= 0,
      },
    ]
  })
}

export interface ResumenCarrito {
  /** Las líneas que van en el pedido: lo agotado se queda en el carrito pero no se pide. */
  disponibles: LineaCarrito[]
  combo: ResumenCombo
  /** Hay algún producto del combo: sirve para avisar «con 2 o más tienes 10% menos». */
  hayProductosDelCombo: boolean
  todoAgotado: boolean
  unidades: number
}

/** Mismo cálculo que el servidor (shared/lib/cart-checkout.ts): solo cuentan los productos del combo. */
export function resumirCarrito(lineas: LineaCarrito[]): ResumenCarrito {
  const disponibles = lineas.filter((l) => !l.agotado)
  return {
    disponibles,
    combo: resumenCombo(
      disponibles.map((l) => ({
        unitAmount: l.price.amount,
        quantity: l.quantity,
        comboEligible: l.product.comboEligible,
      }))
    ),
    hayProductosDelCombo: disponibles.some((l) => l.product.comboEligible !== false),
    todoAgotado: lineas.length > 0 && disponibles.length === 0,
    unidades: lineas.reduce((acc, l) => acc + l.quantity, 0),
  }
}
