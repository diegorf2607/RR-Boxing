import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getProducts, upsertProduct } from '@/shared/lib/data-store'
import type { Product } from '@/shared/types/commerce'
import { getSession } from '@/shared/lib/auth'

const createProductSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2).default('Accesorios'),
  stock: z.coerce.number().min(0).default(0),
  imageUrl: z.string().url(),
})

export async function GET() {
  const products = await getProducts()
  return NextResponse.json({ products: products.filter((p) => p.active) })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = createProductSchema.parse(await req.json())
  const product: Product = {
    id: `prod_${Date.now()}`,
    slug: payload.slug,
    name: payload.name,
    description: payload.description,
    category: payload.category,
    featured: false,
    imageUrls: [payload.imageUrl],
    prices: [
      { country: 'PE', currency: 'PEN', amount: 99 },
      { country: 'MX', currency: 'MXN', amount: 499 },
      { country: 'CO', currency: 'COP', amount: 99000 },
      { country: 'CL', currency: 'CLP', amount: 21990 },
      { country: 'US', currency: 'USD', amount: 29 },
    ],
    stock: payload.stock,
    active: true,
  }
  await upsertProduct(product)
  return NextResponse.json({ product }, { status: 201 })
}
