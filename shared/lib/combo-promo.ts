/** Promo combo: 2+ unidades en carrito → 10% de descuento sobre el subtotal de productos + regalo (comunicado en UI). */

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
