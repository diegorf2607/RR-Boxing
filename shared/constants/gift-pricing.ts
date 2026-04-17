/** Subtotal solo productos (PEN). Si es estrictamente mayor a este monto, el pack regalo no se cobra. */
export const GIFT_THRESHOLD_PE_PEN = 100

export const GIFT_GUIDE_PRICE_PEN = 9.99
export const GIFT_CLASS_PRICE_PEN = 4.99

export function isGiftFreePePen(productSubtotalPen: number): boolean {
  return productSubtotalPen > GIFT_THRESHOLD_PE_PEN
}

/** Cobro del pack solo si el subtotal no supera el umbral y el cliente lo elige en checkout (`includeGiftPack`). */
export function giftPackTotalChargePePen(productSubtotalPen: number, includeWhenUnderThreshold: boolean): number {
  if (isGiftFreePePen(productSubtotalPen)) return 0
  return includeWhenUnderThreshold ? GIFT_GUIDE_PRICE_PEN + GIFT_CLASS_PRICE_PEN : 0
}
