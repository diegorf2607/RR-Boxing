import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { Product, ProductImage, ListingStatus } from '@/shared/types/commerce'
import { deleteProduct, getAdminProductById, isProductSlugTaken, upsertProduct } from '@/shared/lib/data-store'
import { getSession } from '@/shared/lib/auth'
import { getProductPublishBlockers } from '@/shared/lib/product-admin-warnings'

const priceSchema = z.object({
  country: z.enum(['PE', 'MX', 'CO', 'CL', 'US']),
  currency: z.enum(['PEN', 'MXN', 'COP', 'CLP', 'USD']),
  amount: z.coerce.number().min(0),
  compareAtAmount: z.coerce.number().min(0).optional(),
})

const productImageSchema = z.object({
  url: z.string().min(1),
  sortOrder: z.number().int().min(0),
  isPrimary: z.boolean(),
})

const patchProductSchema = z
  .object({
    name: z.string().min(3).optional(),
    slug: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    category: z.string().min(2).optional(),
    stock: z.coerce.number().min(0).optional(),
    imageUrls: z.array(z.string().min(1)).optional(),
    productImages: z.array(productImageSchema).optional(),
    prices: z.array(priceSchema).optional(),
    featured: z.boolean().optional(),
    comboEligible: z.boolean().optional(),
    longDescription: z.string().max(20000).nullable().optional(),
    active: z.boolean().optional(),
    listingStatus: z.enum(['draft', 'active', 'inactive']).optional(),
    sku: z.string().max(80).nullable().optional(),
    displayOrder: z.coerce.number().int().optional(),
    weightGrams: z.coerce.number().int().min(0).nullable().optional(),
    internalNotes: z.string().max(5000).nullable().optional(),
  })
  .strip()

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = patchProductSchema.parse(await req.json())
  const existing = await getAdminProductById(params.id)
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const nextSlug = payload.slug ?? existing.slug
  if (nextSlug !== existing.slug && (await isProductSlugTaken(nextSlug, existing.id))) {
    return NextResponse.json({ error: 'El slug ya está en uso' }, { status: 409 })
  }

  let productImages: ProductImage[] | undefined = payload.productImages
  let imageUrls = payload.imageUrls ?? existing.imageUrls

  if (productImages && productImages.length > 0) {
    const sorted = [...productImages].sort((a, b) => a.sortOrder - b.sortOrder)
    imageUrls = sorted.map((i) => i.url)
    productImages = sorted
  } else if (payload.imageUrls) {
    productImages = payload.imageUrls.map((url, i) => ({
      url,
      sortOrder: i,
      isPrimary: i === 0,
    }))
  }

  const listingStatus = (payload.listingStatus ?? existing.listingStatus ?? 'active') as ListingStatus
  let active = payload.active ?? existing.active
  if (listingStatus === 'active') active = true

  const updated: Product = {
    ...existing,
    ...payload,
    slug: nextSlug,
    imageUrls,
    productImages: productImages ?? existing.productImages,
    prices: payload.prices ?? existing.prices,
    listingStatus,
    active,
    sku: payload.sku !== undefined ? payload.sku : existing.sku,
    displayOrder: payload.displayOrder ?? existing.displayOrder ?? 0,
    weightGrams: payload.weightGrams !== undefined ? payload.weightGrams ?? undefined : existing.weightGrams,
    internalNotes: payload.internalNotes !== undefined ? payload.internalNotes ?? undefined : existing.internalNotes,
    longDescription:
      payload.longDescription !== undefined ? payload.longDescription ?? undefined : existing.longDescription,
  }

  if (listingStatus === 'active' && active) {
    const blockers = getProductPublishBlockers(updated)
    if (blockers.length) {
      return NextResponse.json(
        { error: 'No se puede marcar como activo en tienda con datos incompletos', issues: blockers },
        { status: 400 }
      )
    }
  }

  await upsertProduct(updated)
  const saved = await getAdminProductById(params.id)
  return NextResponse.json({ product: saved ?? updated })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await deleteProduct(params.id)
  return NextResponse.json({ ok: true })
}
