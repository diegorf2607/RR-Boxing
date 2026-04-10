'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/shared/types/commerce'
import { useCountry } from '@/features/country/CountryProvider'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'
import { useCart } from '@/features/cart/CartProvider'

export default function ProductCard({ product }: { product: Product }) {
  const { country } = useCountry()
  const { addItem } = useCart()
  const price = getPriceForCountry(product, country)
  const locale = getCountryConfig(country).locale

  return (
    <article className="card flex h-full flex-col">
      <Link href={`/product/${product.slug}`} className="relative mb-4 block aspect-square overflow-hidden rounded-xl">
        <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover" />
      </Link>
      <span className="mb-2 inline-block rounded-full bg-dark-300 px-2 py-1 text-xs text-neutral-light">
        {product.category}
      </span>
      <h3 className="mb-2 text-lg font-bold">{product.name}</h3>
      <p className="mb-4 text-sm text-neutral-light">{product.description}</p>
      <div className="mt-auto flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-accent">
            {formatCurrency(price.amount, price.currency, locale)}
          </p>
          {price.compareAtAmount && (
            <p className="text-sm text-neutral line-through">
              {formatCurrency(price.compareAtAmount, price.currency, locale)}
            </p>
          )}
        </div>
        <button
          onClick={() => addItem(product.id)}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-bold text-dark hover:bg-accent-dark"
        >
          Agregar
        </button>
      </div>
    </article>
  )
}
