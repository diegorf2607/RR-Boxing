'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/shared/types/commerce'
import ProductCard from '@/features/store/ProductCard'
import StoreComboSection from '@/components/StoreComboSection'
import { useCountry } from '@/features/country/CountryProvider'
import { getPriceForCountry } from '@/features/store/pricing'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

type SortBy = 'destacados' | 'price_asc' | 'price_desc'
export type EstadoCatalogo = 'cargando' | 'listo' | 'error'

/** Los filtros del catálogo aparecen recién con más productos que estos */
const MIN_PARA_FILTROS = 6

const WHATSAPP_PEDIDO = enlaceWhatsapp('Hola, RR Boxing. Quiero hacer un pedido.')

const aviso = 'rounded-2xl border border-dark-300 bg-dark-100 px-5 py-4 text-neutral-light'
const enlace = 'text-white underline underline-offset-2 hover:text-accent'

/** La caja de productos: en el celular una sola caja con filas; desde 900 px, tres tarjetas por fila. */
const grilla =
  'grid grid-cols-1 overflow-hidden rounded-2xl border border-dark-300 bg-dark-100 min-[900px]:grid-cols-3 min-[900px]:gap-5 min-[900px]:overflow-visible min-[900px]:rounded-none min-[900px]:border-0 min-[900px]:bg-transparent'

/**
 * La sección «Tienda» del inicio (línea A): el título con su bajada, los productos y, debajo, los combos con los mismos
 * productos (un solo pedido a /api/products). Dice lo que pasa: mientras carga muestra tres tarjetas vacías; si
 * /api/products falla, lo dice y deja pedir por WhatsApp; si una búsqueda no encuentra nada, deja volver a ver todos.
 * Los destacados van primero (los guantes).
 */
export default function StoreClient() {
  const { country } = useCountry()
  const [products, setProducts] = useState<Product[]>([])
  const [estado, setEstado] = useState<EstadoCatalogo>('cargando')
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
    <section id="catalogo" aria-labelledby="catalogo-titulo" className="seccion scroll-mt-[68px]">
      <div className="wrap">
        <div className="seccion-cab">
          <h2 id="catalogo-titulo" className="section-title">
            Tienda RR Boxing
          </h2>
          <p>Guantes, vendas y cuerda de salto para entrenar en casa o en clase.</p>
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
          <div className={grilla} aria-busy="true">
            <p role="status" className="sr-only">
              Cargando los productos…
            </p>
            {/* Tres tarjetas vacías con la forma de las de verdad (fila en el celular, tarjeta desde 900 px) */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                aria-hidden
                className="flex items-center gap-3.5 border-t border-dark-300 p-3.5 first:border-t-0 min-[900px]:flex-col min-[900px]:items-stretch min-[900px]:gap-0 min-[900px]:overflow-hidden min-[900px]:rounded-2xl min-[900px]:border min-[900px]:bg-dark-100 min-[900px]:p-0 min-[900px]:first:border-t"
              >
                <div className="aspect-square w-24 flex-none animate-pulse rounded-xl bg-dark-200 motion-reduce:animate-none min-[900px]:aspect-[4/3] min-[900px]:w-full min-[900px]:rounded-none" />
                <div className="flex flex-1 flex-col gap-2 min-[900px]:px-5 min-[900px]:pb-5 min-[900px]:pt-[18px]">
                  <div className="h-4 w-2/3 rounded bg-dark-200" />
                  <div className="h-3 w-full rounded bg-dark-200" />
                  <div className="mt-2 h-5 w-1/3 rounded bg-dark-200" />
                </div>
              </div>
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
          <div className={grilla}>
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <StoreComboSection products={products} estado={estado} />
      </div>
    </section>
  )
}
