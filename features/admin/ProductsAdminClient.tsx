'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/shared/types/commerce'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  category: 'Accesorios',
  stock: 0,
  imageUrl: '',
}

export default function ProductsAdminClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(emptyForm)

  async function reload() {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data.products ?? [])
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

      <div className="space-y-3">
        {products.map((product) => (
          <article key={product.id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-neutral-light">{product.category}</p>
            </div>
            <button onClick={() => handleDelete(product.id)} className="text-sm text-red-400">
              Eliminar
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
