import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getStoreProducts, upsertProduct, isProductSlugTaken } from '@/shared/lib/data-store'
import type { Product, ProductImage } from '@/shared/types/commerce'
import { getSession } from '@/shared/lib/auth'
import { getProductPublishBlockers } from '@/shared/lib/product-admin-warnings'

const createProductSchema = z
  .object({
    name: z.string().min(3),
    slug: z.string().min(3),
    description: z.string().min(10),
    category: z.string().min(2).default('Accesorios'),
    stock: z.coerce.number().min(0).default(0),
    imageUrls: z.array(z.string().min(1)).optional(),
    imageUrl: z.string().min(1).optional(),
    sku: z.string().max(80).nullable().optional(),
    featured: z.boolean().optional(),
    listingStatus: z.enum(['draft', 'active', 'inactive']).optional(),
    active: z.boolean().optional(),
    displayOrder: z.coerce.number().int().optional(),
    weightGrams: z.coerce.number().int().min(0).nullable().optional(),
    internalNotes: z.string().max(5000).nullable().optional(),
    productImages: z
      .array(
        z.object({
          url: z.string().min(1),
          sortOrder: z.number().int().min(0),
          isPrimary: z.boolean(),
        })
      )
      .optional(),
    prices: z
      .array(
        z.object({
          country: z.enum(['PE', 'MX', 'CO', 'CL', 'US']),
          currency: z.enum(['PEN', 'MXN', 'COP', 'CLP', 'USD']),
          amount: z.coerce.number().min(0),
        })
      )
      .optional(),
  })
  .refine(
    (d) =>
      (d.imageUrls && d.imageUrls.length > 0) ||
      !!d.imageUrl ||
      (d.productImages && d.productImages.length > 0),
    { message: 'Se requiere al menos una imagen (URL o subida)' }
  )

export async function GET() {
  const products = await getStoreProducts()
  return NextResponse.json({ products })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = createProductSchema.parse(await req.json())
  if (await isProductSlugTaken(payload.slug)) {
    return NextResponse.json({ error: 'El slug ya está en uso' }, { status: 409 })
  }

  const productImages: ProductImage[] = payload.productImages?.length
    ? payload.productImages
    : payload.imageUrls && payload.imageUrls.length > 0
      ? payload.imageUrls.map((url, i) => ({ url, sortOrder: i, isPrimary: i === 0 }))
      : payload.imageUrl
        ? [{ url: payload.imageUrl, sortOrder: 0, isPrimary: true }]
        : []

  const imageUrls = productImages.map((i) => i.url)

  const listingStatus = payload.listingStatus ?? 'draft'
  let active = payload.active ?? true
  if (listingStatus === 'active') active = true

  const product: Product = {
    id: `prod_${Date.now()}`,
    slug: payload.slug,
    name: payload.name,
    description: payload.description,
    category: payload.category,
    featured: payload.featured ?? false,
    imageUrls,
    productImages,
    prices:
      payload.prices && payload.prices.length === 5
        ? payload.prices
        : [
            { country: 'PE' as const, currency: 'PEN' as const, amount: 99 },
            { country: 'MX' as const, currency: 'MXN' as const, amount: 499 },
            { country: 'CO' as const, currency: 'COP' as const, amount: 99000 },
            { country: 'CL' as const, currency: 'CLP' as const, amount: 21990 },
            { country: 'US' as const, currency: 'USD' as const, amount: 29 },
          ],
    stock: payload.stock,
    active,
    listingStatus,
    sku: payload.sku ?? null,
    displayOrder: payload.displayOrder ?? 0,
    weightGrams: payload.weightGrams ?? undefined,
    internalNotes: payload.internalNotes ?? undefined,
  }

  if (listingStatus === 'active') {
    const blockers = getProductPublishBlockers(product)
    if (blockers.length) {
      return NextResponse.json(
        { error: 'No se puede publicar como activo todavía', issues: blockers },
        { status: 400 }
      )
    }
  }

  await upsertProduct(product)
  return NextResponse.json({ product }, { status: 201 })
}
