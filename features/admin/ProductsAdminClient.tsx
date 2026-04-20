'use client'

import { useEffect, useState } from 'react'
import type { CountryCode, Product } from '@/shared/types/commerce'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  category: 'Accesorios',
  stock: 0,
  imageUrl: '',
}

const countryOrder: CountryCode[] = ['PE', 'MX', 'CO', 'CL', 'US']

type ProductDraft = {
  name: string
  slug: string
  description: string
  category: string
  stock: number
  imageUrlsText: string
  prices: Record<CountryCode, string>
}

function createDraft(product: Product): ProductDraft {
  const pricesByCountry = Object.fromEntries(
    countryOrder.map((country) => {
      const price = product.prices.find((p) => p.country === country)
      return [country, price ? String(price.amount) : '']
    })
  ) as Record<CountryCode, string>

  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    stock: product.stock,
    imageUrlsText: product.imageUrls.join('\n'),
    prices: pricesByCountry,
  }
}

export default function ProductsAdminClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(emptyForm)
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState('')

  async function reload() {
    const res = await fetch('/api/products')
    const data = await res.json()
    const nextProducts = data.products ?? []
    setProducts(nextProducts)
    setDrafts(
      Object.fromEntries(nextProducts.map((product: Product) => [product.id, createDraft(product)]))
    )
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleCreate() {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm(emptyForm)
    reload()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    reload()
  }

  async function handleSave(product: Product) {
    const draft = drafts[product.id]
    if (!draft) return
    setSaveError('')
    setSavingId(product.id)

    const imageUrls = draft.imageUrlsText
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean)

    if (imageUrls.length === 0) {
      setSaveError('Debes poner al menos una imagen.')
      setSavingId(null)
      return
    }

    const priceRows = countryOrder.map((country) => {
      const amount = Number(draft.prices[country] ?? '')
      const currencyMap: Record<CountryCode, 'PEN' | 'MXN' | 'COP' | 'CLP' | 'USD'> = {
        PE: 'PEN',
        MX: 'MXN',
        CO: 'COP',
        CL: 'CLP',
        US: 'USD',
      }
      return {
        country,
        currency: currencyMap[country],
        amount: Number.isFinite(amount) ? amount : NaN,
      }
    })

    if (priceRows.some((price) => Number.isNaN(price.amount) || price.amount < 0)) {
      setSaveError('Todos los precios deben ser numeros validos (>= 0).')
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
        imageUrls,
        prices: priceRows,
      }),
    })

    if (!res.ok) {
      setSaveError('No se pudo guardar el producto.')
      setSavingId(null)
      return
    }

    setSavingId(null)
    reload()
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">Crear producto</h2>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre"
          className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
        />
        <input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="Slug"
          className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descripcion"
          className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
        />
        <input
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          placeholder="URL imagen"
          className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
        />
        <button onClick={handleCreate} className="rounded-lg bg-accent px-4 py-2 font-semibold text-dark">
          Guardar
        </button>
      </div>

      {saveError && <p className="text-sm text-red-400">{saveError}</p>}
      <div className="space-y-3">
        {products.map((product) => {
          const draft = drafts[product.id]
          if (!draft) return null

          return (
          <article key={product.id} className="card space-y-3">
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
            <div className="grid gap-3 md:grid-cols-2">
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
            </div>
            <textarea
              value={draft.imageUrlsText}
              onChange={(e) =>
                setDrafts((prev) => ({
                  ...prev,
                  [product.id]: { ...prev[product.id], imageUrlsText: e.target.value },
                }))
              }
              placeholder="Una URL de imagen por linea"
              className="min-h-[96px] w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
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
              <button
                onClick={() => handleDelete(product.id)}
                className="text-sm text-red-400"
                type="button"
              >
                Eliminar
              </button>
              <button
                onClick={() => handleSave(product)}
                type="button"
                className="rounded-lg bg-accent px-4 py-2 font-semibold text-dark"
                disabled={savingId === product.id}
              >
                {savingId === product.id ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </article>
        )})}
      </div>
    </div>
  )
}
