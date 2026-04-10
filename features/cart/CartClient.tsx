'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import type { Product } from '@/shared/types/commerce'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'

export default function CartClient() {
  const { items, removeItem, updateQuantity } = useCart()
  const { country } = useCountry()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
  }, [])

  const rows = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) return null
        const price = getPriceForCountry(product, country)
        return {
          ...item,
          product,
          price,
          lineTotal: price.amount * item.quantity,
        }
      })
      .filter(Boolean)
  }, [items, products, country]) as Array<{
    productId: string
    quantity: number
    product: Product
    price: { amount: number; currency: any }
    lineTotal: number
  }>

  const subtotal = rows.reduce((acc, row) => acc + row.lineTotal, 0)
  const config = getCountryConfig(country)
  const shipping = config.shippingFlatAmount
  const total = subtotal + shipping

  return (
    <section className="container mx-auto px-4 py-10">
      <h1 className="mb-6 text-4xl font-bold">Carrito</h1>
      {rows.length === 0 ? (
        <div className="card">
          <p className="text-neutral-light">Tu carrito esta vacio.</p>
          <Link href="/store" className="mt-4 inline-block text-accent underline">
            Ir a tienda
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {rows.map((row) => (
              <article key={row.productId} className="card flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{row.product.name}</h2>
                  <p className="text-sm text-neutral-light">
                    {formatCurrency(row.price.amount, row.price.currency, config.locale)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => updateQuantity(row.productId, Number(e.target.value))}
                    className="w-16 rounded border border-dark-300 bg-dark-100 px-2 py-1"
                  />
                  <button onClick={() => removeItem(row.productId)} className="text-sm text-red-400">
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
          <aside className="card h-fit">
            <h3 className="mb-4 text-xl font-bold">Resumen</h3>
            <p className="mb-2 flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, config.currency, config.locale)}</span>
            </p>
            <p className="mb-4 flex justify-between text-sm text-neutral-light">
              <span>Envío estimado ({config.name})</span>
              <span>{formatCurrency(shipping, config.currency, config.locale)}</span>
            </p>
            <p className="mb-4 flex justify-between border-t border-dark-300 pt-4 text-lg font-bold">
              <span>Total estimado</span>
              <span className="text-accent">{formatCurrency(total, config.currency, config.locale)}</span>
            </p>
            <Link
              href="/checkout"
              className="block rounded-lg bg-accent px-4 py-3 text-center font-bold text-dark hover:bg-accent-dark"
            >
              Ir al checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  )
}
