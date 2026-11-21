'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { CountryCode, Product } from '@/shared/types/commerce'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'
import { COMBO_DISCOUNT_RATE, roundMoney, subtotalAfterComboDiscount } from '@/shared/lib/combo-promo'

const PORCENTAJE = Math.round(COMBO_DISCOUNT_RATE * 100)

export type Combo = { id: string; title: string; items: string; slugs: string[] }

/**
 * Ideas de packs, en el orden de la maqueta. Van en la misma grilla que los productos (features/store/StoreClient.tsx).
 * Los precios salen de /api/products (los mismos del catálogo y del carrito) y el 10% se calcula con
 * shared/lib/combo-promo.ts, igual que en el servidor: el precio tachado es la suma real de los productos por separado.
 * La tarjeta abre la ficha del primer producto con el pack ya marcado (?pack=<los otros, por slug>):
 * features/store/CajaCompra.tsx lo lee y elige esa opción, si la ficha la ofrece.
 */
export const COMBOS: Combo[] = [
  {
    id: 'entrenamiento',
    title: 'Combo entrenamiento',
    items: 'Guantes + vendas',
    slugs: ['guantes-boxeo-woesad', 'vendas-boxeo-45m'],
  },
  {
    id: 'completo',
    title: 'Combo completo',
    items: 'Guantes + vendas + cuerda',
    slugs: ['guantes-boxeo-woesad', 'vendas-boxeo-45m', 'cuerda-salto-boxeo'],
  },
  {
    id: 'basico',
    title: 'Combo básico',
    items: 'Vendas + cuerda',
    slugs: ['vendas-boxeo-45m', 'cuerda-salto-boxeo'],
  },
]

/** La ficha del primer producto, con los demás como pack: /product/guantes-boxeo-woesad?pack=vendas-boxeo-45m */
const enlaceCombo = (slugs: string[]) => {
  const [principal, ...resto] = slugs
  return `/product/${principal}?pack=${encodeURIComponent(resto.join(','))}`
}

/** Los productos del combo, o null si alguno no está a la venta o no entra en el descuento (entonces no se muestra). */
export function productosDelCombo(combo: Combo, productos: Product[]): Product[] | null {
  const elegidos = combo.slugs.map((slug) => productos.find((p) => p.slug === slug && p.active))
  return elegidos.every((p): p is Product => Boolean(p && p.comboEligible !== false)) ? elegidos : null
}

/** Foto de cada producto, en fila sobre el gris: dos a 48 % y tres a 32 % del ancho. */
const anchoFoto = (cuantos: number) => (cuantos >= 3 ? 'w-[32%]' : 'w-[48%]')

/**
 * Tarjeta de un combo, con el mismo aspecto que la de un producto: las fotos de los productos, la etiqueta
 * «Combo −10%», el nombre, el precio con el 10% y, tachado, lo que cuestan por separado.
 */
export function TarjetaCombo({
  combo,
  productos,
  country,
}: {
  combo: Combo
  productos: Product[]
  country: CountryCode
}) {
  const locale = getCountryConfig(country).locale
  const precios = productos.map((p) => getPriceForCountry(p, country))
  const moneda = precios[0]?.currency
  const mismaMoneda = precios.length > 0 && precios.every((p) => p.currency === moneda)
  const porSeparado = roundMoney(precios.reduce((acc, p) => acc + p.amount, 0))
  const conDescuento = subtotalAfterComboDiscount(porSeparado, productos.length)
  const precio = (n: number) => (mismaMoneda && moneda ? formatCurrency(n, moneda, locale) : '')

  return (
    <Link href={enlaceCombo(combo.slugs)} className="group block">
      <div className="relative flex aspect-square items-center justify-center gap-[3%] overflow-hidden bg-gris px-[5%] py-[7%]">
        {productos.map((p) =>
          p.imageUrls[0] ? (
            <div key={p.id} className={`relative aspect-square ${anchoFoto(productos.length)}`}>
              <Image
                src={p.imageUrls[0]}
                alt=""
                fill
                sizes="(min-width: 768px) 16vw, 25vw"
                className="object-contain mix-blend-multiply"
              />
            </div>
          ) : null
        )}
        <span className="etiqueta absolute left-0 top-0">Combo −{PORCENTAJE}%</span>
      </div>
      <div className="grid gap-x-4 gap-y-0.5 px-0.5 pt-2.5 md:grid-cols-[1fr_auto] md:items-baseline md:pt-3.5">
        <h3 className="text-base font-semibold leading-snug decoration-1 underline-offset-[3px] group-hover:underline md:text-lg">
          {combo.title}
        </h3>
        {mismaMoneda ? (
          <p className="num mt-1 text-[26px] leading-none md:row-span-2 md:mt-0 md:text-right md:text-[30px]">
            <span className="sr-only">Con el {PORCENTAJE}%: </span>
            {precio(conDescuento)}
            <span className="sr-only">. Por separado: </span>
            <s className="ml-1.5 text-[15px] text-[#767676] md:ml-0 md:block md:text-[17px]">{precio(porSeparado)}</s>
          </p>
        ) : (
          <p className="text-sm text-suave md:row-span-2 md:text-right">{PORCENTAJE}% menos en el carrito</p>
        )}
        <p className="text-sm text-suave md:text-[15px]">{combo.items}</p>
      </div>
    </Link>
  )
}
