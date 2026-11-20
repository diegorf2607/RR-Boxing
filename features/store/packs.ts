import type { CountryCode, Product } from '@/shared/types/commerce'
import { participaDelCombo, resumenCombo, type ResumenCombo } from '@/shared/lib/combo-promo'
import { getPriceForCountry } from '@/features/store/pricing'

/** Id del espacio al final de la ficha: cuando aparece, la barra de compra del celular se esconde (no tapa el pie). */
export const ID_FIN_FICHA = 'fin-ficha'

/** Cuántos productos se pueden sumar en un pack de la ficha. */
const MAX_COMPLEMENTOS = 2

/** «Guantes de boxeo» → «guantes», «Cuerda de salto para boxeo» → «cuerda»: para «Con vendas y cuerda». */
export function nombreCorto(product: Pick<Product, 'name'>): string {
  const primera = product.name.trim().split(/\s+/)[0] ?? ''
  return primera.toLocaleLowerCase('es-PE')
}

/** ['vendas', 'cuerda'] → «vendas y cuerda» */
const unir = (partes: string[]) =>
  partes.length <= 1 ? partes.join('') : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`

export interface OpcionPack {
  id: string
  /** «Solo guantes», «Con vendas», «Con vendas y cuerda» */
  titulo: string
  /** El producto de la ficha primero y después lo que se suma. Una unidad de cada uno por pack. */
  productos: Product[]
}

/**
 * Las opciones de la ficha: el producto solo y, si participa del combo, con uno o dos productos más de la tienda
 * que también participan y tienen stock (de menor a mayor precio). Todo pack junta 2 o más unidades, así que lleva
 * el 10% del combo, calculado con `resumenCombo` como en el carrito y en el servidor. Si el producto no participa
 * del combo o no hay con qué juntarlo, no hay opciones (solo cantidad).
 */
export function opcionesPack(product: Product, candidatos: Product[]): OpcionPack[] {
  if (!participaDelCombo(product) || product.stock <= 0) return []
  const precioPeru = (p: Product) => getPriceForCountry(p, 'PE').amount
  const complementos = candidatos
    .filter((c) => c.id !== product.id && c.active && participaDelCombo(c) && c.stock > 0)
    .sort((a, b) => precioPeru(a) - precioPeru(b))
    .slice(0, MAX_COMPLEMENTOS)
  if (complementos.length === 0) return []

  return [
    { id: 'solo', titulo: `Solo ${nombreCorto(product)}`, productos: [product] },
    ...complementos.map((_, i) => {
      const suma = complementos.slice(0, i + 1)
      return {
        id: suma.map((p) => p.id).join('+'),
        titulo: `Con ${unir(suma.map(nombreCorto))}`,
        productos: [product, ...suma],
      }
    }),
  ]
}

/** Lo que cuesta llevar `packs` veces estos productos (una unidad de cada uno por pack), con el combo. */
export function precioPack(productos: Product[], packs: number, country: CountryCode): ResumenCombo {
  return resumenCombo(
    productos.map((p) => ({
      unitAmount: getPriceForCountry(p, country).amount,
      quantity: packs,
      comboEligible: p.comboEligible,
    }))
  )
}
