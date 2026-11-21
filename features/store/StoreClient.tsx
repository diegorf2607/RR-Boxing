'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/shared/types/commerce'
import ProductCard from '@/features/store/ProductCard'
import { useCountry } from '@/features/country/CountryProvider'
import { getPriceForCountry } from '@/features/store/pricing'
import { useProductos } from '@/features/store/useProductos'
import { COMBOS, TarjetaCombo, productosDelCombo } from '@/components/StoreComboSection'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

type SortBy = 'destacados' | 'price_asc' | 'price_desc'

/** Los filtros del catálogo aparecen recién con más productos que estos */
const MIN_PARA_FILTROS = 6

const WHATSAPP_PEDIDO = enlaceWhatsapp('Hola, RR Boxing. Quiero hacer un pedido.')

const aviso = 'caja-gris text-tinta-2'
const campo = 'min-h-[44px] border border-linea-fuerte bg-white px-3 py-2 text-base text-tinta'

/** Mientras cargan: 3 productos y 3 combos vacíos. La cuarta lleva id="combos" para que /#combos tenga adónde ir. */
function TarjetaVacia({ id }: { id?: string }) {
  return (
    <li id={id} aria-hidden className="scroll-mt-24">
      <div className="aspect-square animate-pulse bg-gris motion-reduce:animate-none" />
      <div className="mt-3.5 h-4 w-2/3 bg-gris" />
      <div className="mt-2 h-4 w-1/3 bg-gris" />
    </li>
  )
}

/**
 * La tienda del inicio, como en la maqueta: el título «Tienda», y en una sola grilla los productos y después los
 * combos (el primer combo lleva id="combos": a él van «Combos» del menú y del pie, y «Ver combos» de la franja).
 * Dice lo que pasa: mientras carga muestra tarjetas vacías; si /api/products falla, lo dice y deja pedir por
 * WhatsApp; si una búsqueda no encuentra nada, deja volver a ver todos. Los destacados van primero (los guantes).
 */
export default function StoreClient() {
  const { country } = useCountry()
  const { productos: products, estado } = useProductos()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('destacados')

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

  // Con una búsqueda o un filtro puesto, solo los productos que coinciden
  const combos = hayFiltros
    ? []
    : COMBOS.flatMap((combo) => {
        const elegidos = productosDelCombo(combo, products)
        return elegidos ? [{ combo, elegidos }] : []
      })

  // Quien llega con /#combos (el menú desde otra página) cae sobre las tarjetas vacías; al cargar, las de verdad son
  // más altas y el ancla se corre: se vuelve a llevar a los combos una sola vez.
  useEffect(() => {
    if (estado !== 'listo' || window.location.hash !== '#combos') return
    document.getElementById('combos')?.scrollIntoView({ block: 'start' })
  }, [estado])

  const verTodos = () => {
    setQuery('')
    setCategory('all')
    setInStockOnly(false)
    setFeaturedOnly(false)
  }

  const grilla = 'grid grid-cols-2 gap-x-1 gap-y-[22px] md:grid-cols-3 md:gap-x-2 md:gap-y-7'

  return (
    <section
      id="catalogo"
      aria-labelledby="catalogo-titulo"
      className="scroll-mt-20 bg-white py-12 md:scroll-mt-24 md:py-[72px]"
    >
      <div className="contenedor">
        <div className="mb-5 flex flex-col gap-1.5 md:mb-7 md:flex-row md:items-end md:justify-between md:gap-6">
          <h2 id="catalogo-titulo" className="section-title">
            Tienda
          </h2>
          <p className="max-w-[420px] text-base leading-normal text-suave md:text-right">
            Precios finales en soles. Pides por la web o por WhatsApp.
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
              className={campo}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Categoría"
              className={campo}
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
              className={campo}
            >
              <option value="destacados">Destacados primero</option>
              <option value="price_asc">Precio menor a mayor</option>
              <option value="price_desc">Precio mayor a menor</option>
            </select>
            <label className={`flex items-center gap-2 ${campo}`}>
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
              Solo disponibles
            </label>
            <label className={`flex items-center gap-2 ${campo}`}>
              <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
              Destacados
            </label>
          </div>
        ) : null}

        {estado === 'cargando' ? (
          <div aria-busy="true">
            <p role="status" className="sr-only">
              Cargando los productos…
            </p>
            <ul className={grilla}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <TarjetaVacia key={i} id={i === 3 ? 'combos' : undefined} />
              ))}
            </ul>
          </div>
        ) : estado === 'error' ? (
          <p id="combos" role="alert" className={`${aviso} scroll-mt-24`}>
            No pudimos cargar los productos. Recarga la página o{' '}
            <a href={WHATSAPP_PEDIDO} target="_blank" rel="noopener noreferrer" className="enlace">
              pídelos por WhatsApp
            </a>
            .
          </p>
        ) : filtered.length === 0 ? (
          hayFiltros ? (
            <p role="status" className={aviso}>
              No hay productos con esa búsqueda.{' '}
              <button type="button" onClick={verTodos} className="enlace min-h-[44px]">
                Ver todos
              </button>
            </p>
          ) : (
            <p id="combos" role="status" className={`${aviso} scroll-mt-24`}>
              Por ahora no hay productos a la venta.{' '}
              <a href={WHATSAPP_PEDIDO} target="_blank" rel="noopener noreferrer" className="enlace">
                Pregúntanos por WhatsApp
              </a>
              .
            </p>
          )
        ) : (
          <ul className={grilla}>
            {filtered.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
            {combos.map(({ combo, elegidos }, i) => (
              <li key={combo.id} id={i === 0 ? 'combos' : undefined} className="scroll-mt-20 md:scroll-mt-24">
                <TarjetaCombo combo={combo} productos={elegidos} country={country} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
