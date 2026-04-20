import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { Product } from '@/shared/types/commerce'
import { deleteProduct } from '@/shared/lib/data-store'
import { getProducts, upsertProduct } from '@/shared/lib/data-store'
import { getSession } from '@/shared/lib/auth'

const updateProductSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  stock: z.coerce.number().min(0),
  imageUrls: z.array(z.string().min(1)).min(1),
  prices: z.array(
    z.object({
      country: z.enum(['PE', 'MX', 'CO', 'CL', 'US']),
      currency: z.enum(['PEN', 'MXN', 'COP', 'CLP', 'USD']),
      amount: z.coerce.number().min(0),
    })
  ),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = updateProductSchema.parse(await req.json())
  const products = await getProducts()
  const existing = products.find((product) => product.id === params.id)

  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const updated: Product = {
    ...existing,
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    category: payload.category,
    stock: payload.stock,
    imageUrls: payload.imageUrls,
    prices: payload.prices,
  }

  await upsertProduct(updated)
  return NextResponse.json({ product: updated })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await deleteProduct(params.id)
  return NextResponse.json({ ok: true })
}
