'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/shared/types/commerce'
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
 * Ideas de packs. Los precios salen de /api/products (los mismos del catálogo y del carrito)
 * y el 10% se calcula con shared/lib/combo-promo.ts, igual que en el servidor.
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

type Estado = 'cargando' | 'listo' | 'error'

export default function StoreComboSection() {
  const { country } = useCountry()
  const [products, setProducts] = useState<Product[]>([])
  const [estado, setEstado] = useState<Estado>('cargando')

  useEffect(() => {
    let vivo = true
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((data) => {
        if (!vivo) return
        setProducts(data.products ?? [])
        setEstado('listo')
      })
      .catch(() => {
        if (vivo) setEstado('error')
      })
    return () => {
      vivo = false
    }
  }, [])

  const locale = getCountryConfig(country).locale

  return (
    <section
      id="combos"
      className="scroll-mt-24 border-y border-dark-300 bg-gradient-to-b from-dark-100/80 to-dark py-12 md:py-16"
      aria-labelledby="combos-heading"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 id="combos-heading" className="font-heading text-3xl font-bold tracking-wide text-white md:text-4xl">
            Arma tu pedido
          </h2>
          <p className="mt-4 text-base font-semibold text-white md:text-lg">
            Llevando {COMBO_MIN_UNITS} o más unidades tienes 10% de descuento.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-light">
            Pueden ser del mismo producto. El descuento se calcula solo en el carrito y va escrito en tu pedido por
            WhatsApp. Aquí tienes algunas ideas.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {COMBOS.map((c) => {
            const elegidos = c.slugs.map((slug) => products.find((p) => p.slug === slug && p.active))
            const completo = elegidos.every((p): p is Product => Boolean(p && p.comboEligible !== false))
            if (estado === 'listo' && !completo) return null

            const precios = completo ? elegidos.map((p) => getPriceForCountry(p as Product, country)) : []
            const currency = precios[0]?.currency
            const mismaMoneda = precios.length > 0 && precios.every((p) => p.currency === currency)
            const porSeparado = roundMoney(precios.reduce((acc, p) => acc + p.amount, 0))
            const unidades = c.slugs.length
            const conDescuento = subtotalAfterComboDiscount(porSeparado, unidades)
            const ahorro = computeComboDiscountAmount(porSeparado, unidades)
            const moneda = estado === 'listo' && mismaMoneda ? currency : undefined
            const precio = (n: number) => (moneda ? formatCurrency(n, moneda, locale) : '…')

            const filas = [
              { etiqueta: 'Por separado', valor: precio(porSeparado) },
              { etiqueta: 'Con el 10%', valor: precio(conDescuento), acento: true },
              { etiqueta: 'Ahorras', valor: precio(ahorro) },
            ]

            return (
              <article key={c.id} className="flex flex-col rounded-2xl border border-dark-300 bg-dark-100">
                <div className="px-5 pb-4 pt-5">
                  <p className="text-sm text-neutral">{c.title}</p>
                  <h3 className="mt-1 font-heading text-xl font-bold text-white">{c.items}</h3>
                </div>
                {estado === 'error' ? (
                  <p className="border-t border-dark-300 px-5 py-4 text-sm text-neutral-light">
                    Mira los precios en el catálogo.
                  </p>
                ) : (
                  <dl>
                    {filas.map((fila) => (
                      <div
                        key={fila.etiqueta}
                        className="flex items-baseline justify-between gap-4 border-t border-dark-300 px-5 py-3"
                      >
                        <dt className="text-sm text-neutral">{fila.etiqueta}</dt>
                        <dd
                          className={`text-right tabular-nums ${
                            fila.acento ? 'text-lg font-bold text-accent' : 'text-base font-medium text-white'
                          }`}
                        >
                          {fila.valor}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div className="mt-auto border-t border-dark-300 px-5 py-4">
                  <a
                    href="#catalogo"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-accent bg-transparent py-3 text-sm font-bold text-accent transition hover:bg-accent/10"
                  >
                    Ver productos
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
