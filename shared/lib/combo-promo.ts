/**
 * Promo combo: con 2 o más unidades de productos que participan del combo, 10% de descuento
 * sobre el subtotal de esos productos. Un producto con `comboEligible: false` no suma unidades
 * ni recibe descuento. El mismo cálculo se usa en el carrito y en el servidor (`resumenCombo`).
 */

export const COMBO_MIN_UNITS = 2
export const COMBO_DISCOUNT_RATE = 0.1

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function totalCartUnits(items: { quantity: number }[]): number {
  return items.reduce((acc, i) => acc + i.quantity, 0)
}

export function comboDiscountApplies(totalUnits: number): boolean {
  return totalUnits >= COMBO_MIN_UNITS
}

/** Descuento en moneda del carrito (mismo criterio que el servidor). */
export function computeComboDiscountAmount(grossSubtotal: number, totalUnits: number): number {
  if (!comboDiscountApplies(totalUnits) || grossSubtotal <= 0) return 0
  return roundMoney(grossSubtotal * COMBO_DISCOUNT_RATE)
}

export function subtotalAfterComboDiscount(grossSubtotal: number, totalUnits: number): number {
  const d = computeComboDiscountAmount(grossSubtotal, totalUnits)
  return roundMoney(grossSubtotal - d)
}

/** Un producto participa del combo salvo que tenga `comboEligible: false`. */
export function participaDelCombo(linea: { comboEligible?: boolean }): boolean {
  return linea.comboEligible !== false
}

export interface LineaCombo {
  unitAmount: number
  quantity: number
  /** false: el producto no participa del combo. Si falta, participa. */
  comboEligible?: boolean
}

export interface ResumenCombo {
  /** Subtotal de todos los productos, antes del descuento. */
  subtotal: number
  /** Unidades de los productos que participan del combo. */
  unidadesCombo: number
  /** Subtotal de los productos que participan del combo. */
  subtotalCombo: number
  /** Descuento del combo (0 si no aplica). */
  descuento: number
  /** Subtotal menos el descuento. */
  total: number
}

/** Cálculo del combo para un carrito. Lo usan el carrito (pantalla y WhatsApp) y el servidor. */
export function resumenCombo(lineas: LineaCombo[]): ResumenCombo {
  const subtotal = roundMoney(lineas.reduce((acc, l) => acc + l.unitAmount * l.quantity, 0))
  const participan = lineas.filter(participaDelCombo)
  const unidadesCombo = totalCartUnits(participan)
  const subtotalCombo = roundMoney(participan.reduce((acc, l) => acc + l.unitAmount * l.quantity, 0))
  const descuento = computeComboDiscountAmount(subtotalCombo, unidadesCombo)
  return {
    subtotal,
    unidadesCombo,
    subtotalCombo,
    descuento,
    total: roundMoney(subtotal - descuento),
  }
}
