'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Product } from '@/shared/types/commerce'
import type { EstadoCatalogo } from '@/features/store/StoreClient'
import { useCountry } from '@/features/country/CountryProvider'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'
import {
  COMBO_MIN_UNITS,
  computeComboDiscountAmount,
  roundMoney,
  subtotalAfterComboDiscount,
} from '@/shared/lib/combo-promo'

/**
 * Ideas de packs. Los precios salen de los productos del catálogo (los mismos de /api/products, de la ficha y del
 * carrito) y el 10% se calcula con shared/lib/combo-promo.ts, igual que en el servidor.
 * Cada fila abre la ficha del primer producto con el pack ya marcado (?pack=<los otros, por slug>):
 * features/store/CajaCompra.tsx lo lee y elige esa opción, si la ficha la ofrece.
 */
const COMBOS: { id: string; title: string; items: string; slugs: string[] }[] = [
  {
    id: 'basico',
    title: 'Combo básico',
    items: 'Vendas + cuerda',
    slugs: ['vendas-boxeo-45m', 'cuerda-salto-boxeo'],
  },
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
]

/** La ficha del primer producto, con los demás como pack: /product/guantes-boxeo-woesad?pack=vendas-boxeo-45m */
const enlaceCombo = (slugs: string[]) => {
  const [principal, ...resto] = slugs
  return `/product/${principal}?pack=${encodeURIComponent(resto.join(','))}`
}

/**
 * Los combos, debajo de los productos en la sección «Tienda» (los pinta features/store/StoreClient.tsx con sus mismos
 * productos): un título con el 10% y una caja con filas, como en la maqueta de la línea A. Cada fila es un enlace a la
 * ficha con el pack ya elegido; a la derecha va el precio con el 10% y cuánto ahorras. Un combo cuyo producto no está a
 * la venta o no entra en la promo no se muestra; si no queda ninguno, no se muestra el bloque.
 */
export default function StoreComboSection({ products, estado }: { products: Product[]; estado: EstadoCatalogo }) {
  const { country } = useCountry()
  const locale = getCountryConfig(country).locale

  const combos = COMBOS.flatMap((c) => {
    const elegidos = c.slugs.map((slug) => products.find((p) => p.slug === slug && p.active))
    const completo = elegidos.every((p): p is Product => Boolean(p && p.comboEligible !== false))
    if (estado === 'listo' && !completo) return []

    const precios = completo ? elegidos.map((p) => getPriceForCountry(p as Product, country)) : []
    const currency = precios[0]?.currency
    const mismaMoneda = precios.length > 0 && precios.every((p) => p.currency === currency)
    const porSeparado = roundMoney(precios.reduce((acc, p) => acc + p.amount, 0))
    const unidades = c.slugs.length
    const moneda = estado === 'listo' && mismaMoneda ? currency : undefined
    return [
      {
        ...c,
        precio: moneda ? formatCurrency(subtotalAfterComboDiscount(porSeparado, unidades), moneda, locale) : null,
        ahorro: moneda ? formatCurrency(computeComboDiscountAmount(porSeparado, unidades), moneda, locale) : null,
      },
    ]
  })

  if (combos.length === 0) return null

  return (
    <div id="combos" className="mt-7 scroll-mt-[88px]">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-xl font-[650] leading-tight">
          Combos: <span className="text-accent">10% de descuento</span> llevando {COMBO_MIN_UNITS} o más unidades
        </h3>
        <p className="text-sm text-neutral">
          Aunque sean del mismo producto. Se calcula solo en el carrito y va escrito en tu pedido.
        </p>
      </div>

      {/* La caja de filas de /clase; cada fila entera es el enlace (el foco se dibuja por dentro: la caja recorta) */}
      <ul className="filas filas-centradas overflow-hidden">
        {combos.map((c) => (
          <li key={c.id} className="p-0">
            <Link
              href={enlaceCombo(c.slugs)}
              className="group flex min-h-[64px] flex-1 items-center justify-between gap-4 px-5 py-[13px] transition-colors hover:bg-dark-200 focus-visible:outline-offset-[-2px] motion-reduce:transition-none"
            >
              <span className="min-w-0">
                <span className="block text-[15.5px] font-[550] text-white">{c.title}</span>
                <span className="block text-[13.5px] text-neutral">{c.items}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {estado === 'error' ? null : (
                  <span className="text-right tabular-nums">
                    <span className="block text-[15.5px] font-[550] text-white">{c.precio ?? '…'}</span>
                    {c.ahorro ? <span className="block text-[13px] text-neutral">ahorras {c.ahorro}</span> : null}
                  </span>
                )}
                <ChevronRight
                  className="h-[18px] w-[18px] text-neutral transition-colors group-hover:text-white motion-reduce:transition-none"
                  strokeWidth={1.6}
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
