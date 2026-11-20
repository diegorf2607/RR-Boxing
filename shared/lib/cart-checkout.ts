// El pedido calculado en el servidor: precios, colores, combo y envío salen de la base y de aquí, nunca del
// navegador. Lo usa POST /api/pedido. Solo para el servidor (lee el catálogo con la clave de servicio).
// Envíos solo dentro del Perú, en soles: los costos son de referencia y se confirman por WhatsApp.
import { z } from 'zod'
import type { OrderItem, Product } from '@/shared/types/commerce'
import { getProducts } from '@/shared/lib/data-store'
import { getPriceForCountry } from '@/features/store/pricing'
import { coloresDisponibles, nombreConVariante } from '@/features/store/colores'
import { participaDelCombo, resumenCombo, roundMoney } from '@/shared/lib/combo-promo'

export const checkoutShippingMethodSchema = z.enum(['standard', 'express', 'urgent'])
export type CheckoutShippingMethod = z.infer<typeof checkoutShippingMethodSchema>

export interface OpcionEnvio {
  metodo: CheckoutShippingMethod
  /** «Estándar» */
  nombre: string
  /** «2 a 3 días hábiles» */
  plazo: string
  /** Costo de referencia en soles */
  monto: number
}

/** Las tarifas de referencia de envío dentro del Perú. /checkout las recibe del servidor y las muestra. */
export const ENVIOS_PERU: Record<CheckoutShippingMethod, OpcionEnvio> = {
  standard: { metodo: 'standard', nombre: 'Estándar', plazo: '2 a 3 días hábiles', monto: 0 },
  express: { metodo: 'express', nombre: 'Express', plazo: '24 a 48 horas', monto: 9.9 },
  urgent: { metodo: 'urgent', nombre: 'Urgente', plazo: 'Solo Lima Metropolitana', monto: 14.9 },
}

export const LISTA_ENVIOS: OpcionEnvio[] = [ENVIOS_PERU.standard, ENVIOS_PERU.express, ENVIOS_PERU.urgent]

/** Una línea del carrito como llega del navegador: solo el producto, la cantidad y el color. */
export const lineaPedidoSchema = z.object({
  productId: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(99),
  color: z.string().trim().max(40).optional(),
})
export type LineaPedidoEntrada = z.infer<typeof lineaPedidoSchema>

export interface LineaCalculada {
  productId: string
  /** El nombre del producto, sin el color */
  producto: string
  /** El color elegido, o null si el producto no tiene colores para elegir */
  color: string | null
  /** «Guantes de boxeo (Negro)» */
  nombre: string
  cantidad: number
  precioUnitario: number
  /** Precio por cantidad, antes del combo */
  total: number
}

export interface PedidoCalculado {
  lineas: LineaCalculada[]
  /** Para order_items: el precio de lista de cada línea (el descuento del combo va aparte, en los montos) */
  items: OrderItem[]
  subtotal: number
  descuentoCombo: number
  totalProductos: number
  envio: OpcionEnvio
  /** Productos con el combo, más el envío de referencia */
  total: number
  moneda: 'PEN'
}

export type ResultadoCalculo =
  | { ok: true; pedido: PedidoCalculado }
  | { ok: false; campo: 'items' | 'color'; error: string }

/** «negro» → «Negro» si el producto viene en ese color; null si no es uno de sus colores. */
function colorDelProducto(product: Pick<Product, 'attributes'>, pedido: string | undefined): string | null {
  const buscado = pedido?.trim().toLowerCase()
  if (!buscado) return null
  return coloresDisponibles(product).find((c) => c.toLowerCase() === buscado) ?? null
}

/**
 * Calcula el pedido con los productos activos de la base: precio en soles, color (obligatorio si el producto viene
 * en varios), stock, combo de 10% (`resumenCombo`, el mismo cálculo del carrito) y el envío elegido.
 * Dos líneas del mismo producto y color se juntan.
 */
export async function calcularPedido(
  entrada: LineaPedidoEntrada[],
  metodoEnvio: CheckoutShippingMethod,
  productos?: Product[]
): Promise<ResultadoCalculo> {
  const catalogo = productos ?? (await getProducts())
  const lineas: (LineaCalculada & { comboEligible: boolean })[] = []

  for (const item of entrada) {
    const product = catalogo.find((p) => p.id === item.productId && p.active)
    if (!product) return { ok: false, campo: 'items', error: 'Uno de los productos ya no está en la tienda. Revisa tu carrito.' }
    const nombreProducto = product.name.trim()
    if (product.stock <= 0) return { ok: false, campo: 'items', error: `${nombreProducto} está agotado. Quítalo de tu carrito.` }

    const conColores = coloresDisponibles(product).length > 0
    const color = conColores ? colorDelProducto(product, item.color) : null
    if (conColores && !color) return { ok: false, campo: 'color', error: `Elige el color de ${nombreProducto}.` }

    const existente = lineas.find((l) => l.productId === product.id && l.color === color)
    if (existente) {
      existente.cantidad += item.quantity
      existente.total = roundMoney(existente.precioUnitario * existente.cantidad)
      continue
    }
    const precio = getPriceForCountry(product, 'PE')
    if (!precio || precio.currency !== 'PEN') {
      return { ok: false, campo: 'items', error: `${nombreProducto} no tiene precio en soles. Escríbenos por WhatsApp.` }
    }
    lineas.push({
      productId: product.id,
      producto: nombreProducto,
      color,
      nombre: nombreConVariante(nombreProducto, color ? { color } : undefined),
      cantidad: item.quantity,
      precioUnitario: precio.amount,
      total: roundMoney(precio.amount * item.quantity),
      comboEligible: participaDelCombo(product),
    })
  }

  if (lineas.length === 0) return { ok: false, campo: 'items', error: 'Tu carrito está vacío.' }

  // El stock se revisa por producto, sumando sus colores
  for (const productId of Array.from(new Set(lineas.map((l) => l.productId)))) {
    const product = catalogo.find((p) => p.id === productId)
    const pedidas = lineas.filter((l) => l.productId === productId).reduce((s, l) => s + l.cantidad, 0)
    if (product && pedidas > product.stock) {
      const quedan = product.stock === 1 ? 'Queda 1' : `Quedan ${product.stock}`
      return { ok: false, campo: 'items', error: `${quedan} de ${product.name.trim()}. Baja la cantidad en tu carrito.` }
    }
  }

  const combo = resumenCombo(
    lineas.map((l) => ({ unitAmount: l.precioUnitario, quantity: l.cantidad, comboEligible: l.comboEligible }))
  )
  const envio = ENVIOS_PERU[metodoEnvio]
  const limpias: LineaCalculada[] = lineas.map(({ comboEligible: _comboEligible, ...l }) => l)

  return {
    ok: true,
    pedido: {
      lineas: limpias,
      items: limpias.map((l) => ({
        productId: l.productId,
        productName: l.nombre,
        quantity: l.cantidad,
        unitAmount: l.precioUnitario,
        currency: 'PEN',
      })),
      subtotal: combo.subtotal,
      descuentoCombo: combo.descuento,
      totalProductos: combo.total,
      envio,
      total: roundMoney(combo.total + envio.monto),
      moneda: 'PEN',
    },
  }
}
