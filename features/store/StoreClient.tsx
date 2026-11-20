'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/shared/types/commerce'
import ProductCard from '@/features/store/ProductCard'
import { useCountry } from '@/features/country/CountryProvider'
import { getPriceForCountry } from '@/features/store/pricing'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

type SortBy = 'destacados' | 'price_asc' | 'price_desc'
type Estado = 'cargando' | 'listo' | 'error'

/** Los filtros del catálogo aparecen recién con más productos que estos */
const MIN_PARA_FILTROS = 6

const WHATSAPP_PEDIDO = enlaceWhatsapp('Hola, RR Boxing. Quiero hacer un pedido.')

const aviso = 'rounded-2xl border border-dark-300 bg-dark-100 px-5 py-4 text-neutral-light'
const enlace = 'text-accent underline underline-offset-2 hover:text-white'

/**
 * El catálogo del inicio. Dice lo que pasa: mientras carga muestra tres tarjetas vacías; si /api/products falla, lo
 * dice y deja pedir por WhatsApp; si una búsqueda no encuentra nada, deja volver a ver todos. Los destacados van
 * primero (los guantes).
 */
export default function StoreClient() {
  const { country } = useCountry()
  const [products, setProducts] = useState<Product[]>([])
  const [estado, setEstado] = useState<Estado>('cargando')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('destacados')

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

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  )

  const visibles = products.filter((p) => p.active).length
  const hayFiltros = query !== '' || category !== 'all' || inStockOnly || featuredOnly

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
    return [...base].sort((a, b) => Number(b.featured) - Number(a.featured))
  }, [products, query, category, inStockOnly, featuredOnly, sortBy, country])

  const verTodos = () => {
    setQuery('')
    setCategory('all')
    setInStockOnly(false)
    setFeaturedOnly(false)
  }

  return (
    <section id="catalogo" className="container mx-auto max-w-6xl scroll-mt-24 px-4 py-12 md:py-16">
      <div className="mb-8">
        <h1 className="page-title">Tienda RR Boxing</h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-light">
          Guantes, vendas y cuerda de salto para entrenar en casa o en clase.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-light">
          Con 2 o más unidades en tu pedido, <span className="text-white">10% de descuento</span> en productos.{' '}
          <a href="#combos" className={enlace}>
            Ver combos
          </a>
        </p>
      </div>

      {/* Con pocos productos los filtros solo empujan las tarjetas fuera de la pantalla: aparecen cuando haya más */}
      {visibles > MIN_PARA_FILTROS ? (
        <div className="mb-8 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto"
            aria-label="Buscar producto"
            className="rounded-lg border border-dark-300 bg-dark-100 px-3 py-2 text-base"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Categoría"
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
            aria-label="Ordenar por"
            className="rounded-lg border border-dark-300 bg-dark-100 px-3 py-2"
          >
            <option value="destacados">Destacados primero</option>
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
      ) : null}

      {estado === 'cargando' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          <p role="status" className="sr-only">
            Cargando los productos…
          </p>
          {[0, 1, 2].map((i) => (
            <div key={i} aria-hidden className="aspect-[3/4] animate-pulse rounded-2xl border border-dark-300 bg-dark-100" />
          ))}
        </div>
      ) : estado === 'error' ? (
        <p role="alert" className={aviso}>
          No pudimos cargar los productos. Recarga la página o{' '}
          <a href={WHATSAPP_PEDIDO} target="_blank" rel="noopener noreferrer" className={enlace}>
            pídelos por WhatsApp
          </a>
          .
        </p>
      ) : filtered.length === 0 ? (
        hayFiltros ? (
          <p role="status" className={aviso}>
            No hay productos con esa búsqueda.{' '}
            <button type="button" onClick={verTodos} className={enlace}>
              Ver todos
            </button>
          </p>
        ) : (
          <p role="status" className={aviso}>
            Por ahora no hay productos a la venta.{' '}
            <a href={WHATSAPP_PEDIDO} target="_blank" rel="noopener noreferrer" className={enlace}>
              Pregúntanos por WhatsApp
            </a>
            .
          </p>
        )
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
