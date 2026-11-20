'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/shared/types/commerce'
import ProductCard from '@/features/store/ProductCard'
import { useCountry } from '@/features/country/CountryProvider'
import { getPriceForCountry } from '@/features/store/pricing'

type SortBy = 'recent' | 'price_asc' | 'price_desc'

export default function StoreClient() {
  const { country } = useCountry()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('recent')

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
  }, [])

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  )

  const filtered = useMemo(() => {
    const base = products.filter((p) => {
      const byQuery = p.name.toLowerCase().includes(query.toLowerCase())
      const byCategory = category === 'all' || p.category === category
      const byStock = !inStockOnly || p.stock > 0
      const byFeatured = !featuredOnly || p.featured
      return byQuery && byCategory && byStock && byFeatured && p.active
    })
    const amount = (p: Product) => getPriceForCountry(p, country).amount
    if (sortBy === 'price_asc') return [...base].sort((a, b) => amount(a) - amount(b))
    if (sortBy === 'price_desc') return [...base].sort((a, b) => amount(b) - amount(a))
    return base
  }, [products, query, category, inStockOnly, featuredOnly, sortBy, country])

  return (
    <section id="catalogo" className="scroll-mt-24 container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold">Tienda RR Boxing</h1>
        <p className="text-neutral-light">Guantes, vendas y cuerda de salto para entrenar en casa o en clase.</p>
        <p className="mt-4 rounded-xl border border-accent/35 bg-accent/5 px-4 py-3 text-sm leading-relaxed text-neutral-light">
          Con 2 o más unidades en tu pedido, <strong className="text-white">10% de descuento</strong> en productos.{' '}
          <a href="#combos" className="text-accent underline underline-offset-2 hover:text-white">
            Ver combos sugeridos
          </a>
        </p>
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto"
          className="rounded-lg border border-dark-300 bg-dark-100 px-3 py-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-dark-300 bg-dark-100 px-3 py-2"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === 'all' ? 'Todas las categorías' : item}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="rounded-lg border border-dark-300 bg-dark-100 px-3 py-2"
        >
          <option value="recent">Más recientes</option>
          <option value="price_asc">Precio menor a mayor</option>
          <option value="price_desc">Precio mayor a menor</option>
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-dark-300 bg-dark-100 px-3 py-2">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
          Solo disponibles
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-dark-300 bg-dark-100 px-3 py-2">
          <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
          Destacados
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
