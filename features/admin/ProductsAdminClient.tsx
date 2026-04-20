'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CountryCode, Product, ProductImage, ListingStatus } from '@/shared/types/commerce'
import ProductGalleryEditor from '@/features/admin/ProductGalleryEditor'
import { getProductAdminHints } from '@/shared/lib/product-admin-warnings'

const countryOrder: CountryCode[] = ['PE', 'MX', 'CO', 'CL', 'US']

const currencyMap: Record<CountryCode, 'PEN' | 'MXN' | 'COP' | 'CLP' | 'USD'> = {
  PE: 'PEN',
  MX: 'MXN',
  CO: 'COP',
  CL: 'CLP',
  US: 'USD',
}

type ProductDraft = {
  name: string
  slug: string
  description: string
  category: string
  stock: number
  sku: string
  featured: boolean
  listingStatus: ListingStatus
  active: boolean
  displayOrder: number
  weightGrams: string
  internalNotes: string
  prices: Record<CountryCode, string>
  gallery: ProductImage[]
  urlPaste: string
}

function listingBadge(ls: ListingStatus | undefined) {
  const v = ls ?? 'active'
  if (v === 'draft') return { label: 'Borrador', cls: 'bg-neutral-500/20 text-neutral-200' }
  if (v === 'inactive') return { label: 'Inactivo', cls: 'bg-amber-500/15 text-amber-200' }
  return { label: 'Activo tienda', cls: 'bg-emerald-500/15 text-emerald-200' }
}

function productToDraft(product: Product): ProductDraft {
  const pricesByCountry = Object.fromEntries(
    countryOrder.map((country) => {
      const price = product.prices.find((p) => p.country === country)
      return [country, price ? String(price.amount) : '']
    })
  ) as Record<CountryCode, string>

  const gallery: ProductImage[] =
    product.productImages && product.productImages.length > 0
      ? product.productImages.map((p) => ({ ...p }))
      : product.imageUrls.map((url, i) => ({
          url,
          sortOrder: i,
          isPrimary: i === 0,
        }))

  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    stock: product.stock,
    sku: product.sku ?? '',
    featured: product.featured ?? false,
    listingStatus: (product.listingStatus ?? 'active') as ListingStatus,
    active: product.active,
    displayOrder: product.displayOrder ?? 0,
    weightGrams: product.weightGrams != null ? String(product.weightGrams) : '',
    internalNotes: product.internalNotes ?? '',
    prices: pricesByCountry,
    gallery,
    urlPaste: '',
  }
}

async function persistGalleryUploads(images: ProductImage[]): Promise<ProductImage[]> {
  const out: ProductImage[] = []
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    if (img.url.startsWith('blob:')) {
      const blob = await fetch(img.url).then((r) => r.blob())
      const ext =
        blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : blob.type === 'image/gif' ? 'gif' : 'jpg'
      const file = new File([blob], `img.${ext}`, { type: blob.type || 'image/jpeg' })
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-product-image', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Error al subir imagen')
      URL.revokeObjectURL(img.url)
      out.push({ url: data.url as string, sortOrder: i, isPrimary: img.isPrimary })
    } else {
      out.push({ ...img, sortOrder: i })
    }
  }
  const primaryIdx = out.findIndex((x) => x.isPrimary)
  const p = primaryIdx >= 0 ? primaryIdx : 0
  return out.map((x, i) => ({ ...x, sortOrder: i, isPrimary: i === p }))
}

export default function ProductsAdminClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({})
  const [loading, setLoading] = useState(true)
  const [lowStockThreshold, setLowStockThreshold] = useState(5)

  const [search, setSearch] = useState('')
  const [filterListing, setFilterListing] = useState<'all' | ListingStatus>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterLowStock, setFilterLowStock] = useState(false)

  const [createDraft, setCreateDraft] = useState<ProductDraft>({
    name: '',
    slug: '',
    description: '',
    category: 'Accesorios',
    stock: 0,
    sku: '',
    featured: false,
    listingStatus: 'draft',
    active: true,
    displayOrder: 0,
    weightGrams: '',
    internalNotes: '',
    prices: Object.fromEntries(countryOrder.map((c) => [c, ''])) as Record<CountryCode, string>,
    gallery: [],
    urlPaste: '',
  })
  const [createError, setCreateError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [pres, sres] = await Promise.all([
        fetch('/api/admin/products', { cache: 'no-store' }),
        fetch('/api/admin/settings', { cache: 'no-store' }),
      ])
      const pdata = await pres.json()
      const sdata = await sres.json().catch(() => ({}))
      const nextProducts: Product[] = pdata.products ?? []
      setProducts(nextProducts)
      setDrafts(Object.fromEntries(nextProducts.map((p) => [p.id, productToDraft(p)])))
      if (typeof sdata.settings?.lowStockThreshold === 'number') {
        setLowStockThreshold(sdata.settings.lowStockThreshold)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const categories = useMemo(() => {
    const s = new Set(products.map((p) => p.category).filter(Boolean))
    return ['all', ...Array.from(s).sort()]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const d = drafts[p.id]
      const name = (d?.name ?? p.name).toLowerCase()
      if (search && !name.includes(search.toLowerCase())) return false
      const ls = d?.listingStatus ?? p.listingStatus ?? 'active'
      if (filterListing !== 'all' && ls !== filterListing) return false
      if (filterCategory !== 'all' && p.category !== filterCategory) return false
      const st = d?.stock ?? p.stock
      if (filterLowStock && !(st > 0 && st < lowStockThreshold)) return false
      return true
    })
  }, [products, drafts, search, filterListing, filterCategory, filterLowStock, lowStockThreshold])

  async function handleCreate() {
    setCreateError('')
    const priceRows = countryOrder.map((country) => {
      const amount = Number(createDraft.prices[country] ?? '')
      return { country, currency: currencyMap[country], amount: Number.isFinite(amount) ? amount : NaN }
    })
    if (priceRows.some((price) => Number.isNaN(price.amount) || price.amount < 0)) {
      setCreateError('Precios inválidos (números ≥ 0).')
      return
    }
    try {
      const gallery = await persistGalleryUploads(createDraft.gallery)
      const imageUrls = gallery.map((g) => g.url)
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createDraft.name,
          slug: createDraft.slug,
          description: createDraft.description,
          category: createDraft.category,
          stock: createDraft.stock,
          sku: createDraft.sku || null,
          featured: createDraft.featured,
          listingStatus: createDraft.listingStatus,
          active: createDraft.active,
          displayOrder: createDraft.displayOrder,
          weightGrams: createDraft.weightGrams ? Number(createDraft.weightGrams) : null,
          internalNotes: createDraft.internalNotes || null,
          imageUrls,
          productImages: gallery,
          prices: priceRows.map((row) => ({
            country: row.country,
            currency: row.currency,
            amount: row.amount,
          })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCreateError(data.error || (Array.isArray(data.issues) ? data.issues.join(' · ') : 'Error al crear'))
        return
      }
      setCreateDraft({
        name: '',
        slug: '',
        description: '',
        category: 'Accesorios',
        stock: 0,
        sku: '',
        featured: false,
        listingStatus: 'draft',
        active: true,
        displayOrder: 0,
        weightGrams: '',
        internalNotes: '',
        prices: Object.fromEntries(countryOrder.map((c) => [c, ''])) as Record<CountryCode, string>,
        gallery: [],
        urlPaste: '',
      })
      reload()
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Error')
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar producto del catálogo (se desactivará)?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    reload()
  }

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: 'POST' })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      alert(d.error || 'No se pudo duplicar')
      return
    }
    reload()
  }

  async function quickListing(id: string, listingStatus: ListingStatus) {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingStatus }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      alert(d.error || (Array.isArray(d.issues) ? d.issues.join('\n') : 'No se pudo actualizar'))
      return
    }
    reload()
  }

  async function handleSave(product: Product) {
    const draft = drafts[product.id]
    if (!draft) return
    setSaveError('')
    setSavingId(product.id)
    try {
      const gallery = await persistGalleryUploads(draft.gallery)
      const imageUrls = gallery.map((g) => g.url)

      const priceRows = countryOrder.map((country) => {
        const amount = Number(draft.prices[country] ?? '')
        return {
          country,
          currency: currencyMap[country],
          amount: Number.isFinite(amount) ? amount : NaN,
        }
      })
      if (priceRows.some((price) => Number.isNaN(price.amount) || price.amount < 0)) {
        setSaveError('Todos los precios deben ser números válidos (>= 0).')
        setSavingId(null)
        return
      }

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          slug: draft.slug,
          description: draft.description,
          category: draft.category,
          stock: draft.stock,
          sku: draft.sku || null,
          featured: draft.featured,
          listingStatus: draft.listingStatus,
          active: draft.active,
          displayOrder: draft.displayOrder,
          weightGrams: draft.weightGrams ? Number(draft.weightGrams) : null,
          internalNotes: draft.internalNotes || null,
          imageUrls,
          productImages: gallery,
          prices: priceRows,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSaveError(data.error || (Array.isArray(data.issues) ? data.issues.join(' · ') : 'No se pudo guardar'))
        setSavingId(null)
        return
      }
      setSavingId(null)
      reload()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Error')
      setSavingId(null)
    }
  }

  const appendUrlsToDraft = (draft: ProductDraft, set: (d: ProductDraft) => void) => {
    const lines = draft.urlPaste
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean)
    if (lines.length === 0) return
    const base = draft.gallery.length
    const added: ProductImage[] = lines.map((url, i) => ({
      url,
      sortOrder: base + i,
      isPrimary: draft.gallery.length === 0 && i === 0,
    }))
    set({
      ...draft,
      gallery: [...draft.gallery, ...added],
      urlPaste: '',
    })
  }

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm text-neutral">Cargando catálogo…</p>}

      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-white">Crear producto</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={createDraft.name}
            onChange={(e) => setCreateDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Nombre"
            className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
          />
          <input
            value={createDraft.slug}
            onChange={(e) => setCreateDraft((d) => ({ ...d, slug: e.target.value }))}
            placeholder="Slug único"
            className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
          />
        </div>
        <textarea
          value={createDraft.description}
          onChange={(e) => setCreateDraft((d) => ({ ...d, description: e.target.value }))}
          placeholder="Descripción (mín. 10 caracteres)"
          className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
        />
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={createDraft.category}
            onChange={(e) => setCreateDraft((d) => ({ ...d, category: e.target.value }))}
            placeholder="Categoría"
            className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
          />
          <input
            type="number"
            min={0}
            value={createDraft.stock}
            onChange={(e) => setCreateDraft((d) => ({ ...d, stock: Number(e.target.value) }))}
            placeholder="Stock"
            className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
          />
          <input
            value={createDraft.sku}
            onChange={(e) => setCreateDraft((d) => ({ ...d, sku: e.target.value }))}
            placeholder="SKU (opcional)"
            className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-neutral-light">
            <input
              type="checkbox"
              checked={createDraft.featured}
              onChange={(e) => setCreateDraft((d) => ({ ...d, featured: e.target.checked }))}
            />
            Destacado
          </label>
          <select
            value={createDraft.listingStatus}
            onChange={(e) => setCreateDraft((d) => ({ ...d, listingStatus: e.target.value as ListingStatus }))}
            className="rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activo en tienda</option>
            <option value="inactive">Inactivo</option>
          </select>
          <input
            type="number"
            value={createDraft.displayOrder}
            onChange={(e) => setCreateDraft((d) => ({ ...d, displayOrder: Number(e.target.value) }))}
            placeholder="Orden"
            className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
          />
        </div>
        <ProductGalleryEditor
          images={createDraft.gallery}
          onChange={(gallery) => setCreateDraft((d) => ({ ...d, gallery }))}
          urlPasteValue={createDraft.urlPaste}
          onUrlPasteChange={(urlPaste) => setCreateDraft((d) => ({ ...d, urlPaste }))}
          onAppendUrlsFromPaste={() => appendUrlsToDraft(createDraft, (nd) => setCreateDraft(nd))}
        />
        <div className="grid gap-2 md:grid-cols-5">
          {countryOrder.map((country) => (
            <input
              key={`create-${country}`}
              type="number"
              step="0.01"
              min={0}
              value={createDraft.prices[country] ?? ''}
              onChange={(e) =>
                setCreateDraft((d) => ({
                  ...d,
                  prices: { ...d.prices, [country]: e.target.value },
                }))
              }
              placeholder={`Precio ${country}`}
              className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
            />
          ))}
        </div>
        {createError && <p className="text-sm text-red-400">{createError}</p>}
        <button
          type="button"
          onClick={() => void handleCreate()}
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-dark"
        >
          Crear producto
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dark-300 bg-dark-100/40 p-4">
        <div>
          <label className="mb-1 block text-xs text-neutral">Buscar</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre…"
            className="rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral">Estado listado</label>
          <select
            value={filterListing}
            onChange={(e) => setFilterListing(e.target.value as typeof filterListing)}
            className="rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
          >
            <option value="all">Todos</option>
            <option value="draft">Borrador</option>
            <option value="active">Activo tienda</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral">Categoría</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'Todas' : c}
              </option>
            ))}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-light">
          <input type="checkbox" checked={filterLowStock} onChange={(e) => setFilterLowStock(e.target.checked)} />
          Solo stock bajo (&lt; {lowStockThreshold})
        </label>
      </div>

      {!loading && filteredProducts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-dark-300 px-6 py-10 text-center text-neutral-light">
          No hay productos con estos filtros.
        </div>
      )}

      {saveError && <p className="text-sm text-red-400">{saveError}</p>}

      <div className="overflow-x-auto rounded-2xl border border-dark-300 bg-dark-100/40">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-dark-300 bg-dark/80 text-xs uppercase tracking-wide text-neutral">
            <tr>
              <th className="px-3 py-2">Img</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">PE</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Alertas</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const draft = drafts[product.id]
              const pe = product.prices.find((p) => p.country === 'PE')
              const thumb = product.imageUrls[0]
              const ls = draft?.listingStatus ?? product.listingStatus ?? 'active'
              const hints = draft
                ? getProductAdminHints(
                    {
                      ...product,
                      name: draft.name,
                      slug: draft.slug,
                      description: draft.description,
                      category: draft.category,
                      stock: draft.stock,
                      sku: draft.sku || null,
                      featured: draft.featured,
                      listingStatus: draft.listingStatus,
                      active: draft.active,
                      displayOrder: draft.displayOrder,
                      weightGrams: draft.weightGrams ? Number(draft.weightGrams) : undefined,
                      internalNotes: draft.internalNotes,
                      imageUrls: draft.gallery.map((g) => g.url),
                      productImages: draft.gallery,
                      prices: countryOrder.map((country) => {
                        const amount = Number(draft.prices[country] ?? '')
                        return {
                          country,
                          currency: currencyMap[country],
                          amount: Number.isFinite(amount) ? amount : 0,
                        }
                      }),
                    },
                    lowStockThreshold
                  )
                : getProductAdminHints(product, lowStockThreshold)
              return (
                <tr key={product.id} className="border-b border-dark-300/50 hover:bg-dark/30">
                  <td className="px-3 py-2">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <span className="text-amber-400" title="Sin imagen">
                        —
                      </span>
                    )}
                  </td>
                  <td className="max-w-[200px] px-3 py-2 font-medium text-white">{product.name}</td>
                  <td className="px-3 py-2 text-neutral-light">{pe ? `S/ ${pe.amount}` : '—'}</td>
                  <td className="px-3 py-2">{product.stock}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${listingBadge(ls).cls}`}>
                      {listingBadge(ls).label}
                    </span>
                  </td>
                  <td className="max-w-[180px] px-3 py-2 text-xs text-amber-200/90">{hints.join(' · ') || '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <a href={`#edit-${product.id}`} className="text-xs text-accent hover:underline">
                        Editar
                      </a>
                      <button
                        type="button"
                        className="text-xs text-neutral-light hover:text-white"
                        onClick={() => void handleDuplicate(product.id)}
                      >
                        Duplicar
                      </button>
                      <button
                        type="button"
                        className="text-xs text-neutral-light hover:text-white"
                        onClick={() => void quickListing(product.id, ls === 'active' ? 'inactive' : 'active')}
                      >
                        {ls === 'active' ? 'Desactivar' : 'Activar tienda'}
                      </button>
                      <button type="button" className="text-xs text-red-400" onClick={() => void handleDelete(product.id)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        {filteredProducts.map((product) => {
          const draft = drafts[product.id]
          if (!draft) return null
          return (
            <article key={product.id} id={`edit-${product.id}`} className="card scroll-mt-24 space-y-4 border-accent/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${listingBadge(draft.listingStatus).cls}`}>
                  {listingBadge(draft.listingStatus).label}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [product.id]: { ...prev[product.id], name: e.target.value },
                    }))
                  }
                  placeholder="Nombre"
                  className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
                />
                <input
                  value={draft.slug}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [product.id]: { ...prev[product.id], slug: e.target.value },
                    }))
                  }
                  placeholder="Slug"
                  className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
                />
              </div>
              <textarea
                value={draft.description}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [product.id]: { ...prev[product.id], description: e.target.value },
                  }))
                }
                placeholder="Descripcion"
                className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
              />
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  value={draft.category}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [product.id]: { ...prev[product.id], category: e.target.value },
                    }))
                  }
                  placeholder="Categoria"
                  className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
                />
                <input
                  type="number"
                  min={0}
                  value={draft.stock}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [product.id]: { ...prev[product.id], stock: Number(e.target.value) },
                    }))
                  }
                  placeholder="Stock"
                  className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
                />
                <input
                  value={draft.sku}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [product.id]: { ...prev[product.id], sku: e.target.value },
                    }))
                  }
                  placeholder="SKU"
                  className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
                />
                <input
                  type="number"
                  value={draft.displayOrder}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [product.id]: { ...prev[product.id], displayOrder: Number(e.target.value) },
                    }))
                  }
                  placeholder="Orden"
                  className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  value={draft.listingStatus}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [product.id]: { ...prev[product.id], listingStatus: e.target.value as ListingStatus },
                    }))
                  }
                  className="rounded-lg border border-dark-300 bg-dark px-3 py-2"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activo en tienda</option>
                  <option value="inactive">Inactivo</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-neutral-light">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [product.id]: { ...prev[product.id], featured: e.target.checked },
                      }))
                    }
                  />
                  Destacado
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-light">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [product.id]: { ...prev[product.id], active: e.target.checked },
                      }))
                    }
                  />
                  Activo (legacy)
                </label>
              </div>
              <textarea
                value={draft.internalNotes}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [product.id]: { ...prev[product.id], internalNotes: e.target.value },
                  }))
                }
                placeholder="Notas internas (solo admin)"
                className="min-h-[64px] w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
              />
              <ProductGalleryEditor
                images={draft.gallery}
                onChange={(gallery) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [product.id]: { ...prev[product.id], gallery },
                  }))
                }
                disabled={savingId === product.id}
                urlPasteValue={draft.urlPaste}
                onUrlPasteChange={(urlPaste) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [product.id]: { ...prev[product.id], urlPaste },
                  }))
                }
                onAppendUrlsFromPaste={() =>
                  appendUrlsToDraft(draft, (nd) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [product.id]: nd,
                    }))
                  )
                }
              />
              <div className="grid gap-2 md:grid-cols-5">
                {countryOrder.map((country) => (
                  <input
                    key={`${product.id}-${country}`}
                    type="number"
                    step="0.01"
                    min={0}
                    value={draft.prices[country] ?? ''}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [product.id]: {
                          ...prev[product.id],
                          prices: {
                            ...prev[product.id].prices,
                            [country]: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder={`Precio ${country}`}
                    className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={() => void handleDelete(product.id)} className="text-sm text-red-400" type="button">
                  Eliminar
                </button>
                <button
                  onClick={() => void handleSave(product)}
                  type="button"
                  className="rounded-lg bg-accent px-4 py-2 font-semibold text-dark"
                  disabled={savingId === product.id}
                >
                  {savingId === product.id ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
