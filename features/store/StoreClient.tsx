'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/shared/types/commerce'
import ProductCard from '@/features/store/ProductCard'

type SortBy = 'recent' | 'bestsellers' | 'price_asc' | 'price_desc'

export default function StoreClient() {
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
    if (sortBy === 'price_asc') return [...base].sort((a, b) => a.prices[0].amount - b.prices[0].amount)
    if (sortBy === 'price_desc') return [...base].sort((a, b) => b.prices[0].amount - a.prices[0].amount)
    if (sortBy === 'bestsellers')
      return [...base].sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    return base
  }, [products, query, category, inStockOnly, featuredOnly, sortBy])

  return (
    <section id="catalogo" className="scroll-mt-24 container mx-auto px-4 py-12 md:py-16">
      <div className="mb-10 border-b border-dark-300 pb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent">Catálogo</p>
        <h1 className="mb-3 font-heading text-4xl tracking-wide text-white md:text-5xl">Tienda RRBOXING</h1>
        <p className="max-w-2xl text-neutral-light">
          Equipamiento premium para entrenamiento real y rendimiento competitivo. Filtra, ordena y añade al carrito.
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
              {item === 'all' ? 'Todas las categorias' : item}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="rounded-lg border border-dark-300 bg-dark-100 px-3 py-2"
        >
          <option value="recent">Mas recientes</option>
          <option value="bestsellers">Mas valorados</option>
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
