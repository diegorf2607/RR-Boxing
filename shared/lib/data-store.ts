import type { Order, Product } from '@/shared/types/commerce'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'
import type { CountryCode, CurrencyCode, OrderStatus } from '@/shared/types/commerce'

type ProductRow = {
  id: string
  slug: string
  name: string
  description: string
  long_description: string | null
  features: string[] | null
  attributes: unknown
  category: string
  featured: boolean
  combo_eligible: boolean
  stock: number
  active: boolean
  rating: number | null
  review_count: number
}

type ProductImageRow = {
  product_id: string
  url: string
  sort_order: number
}

type ProductPriceRow = {
  product_id: string
  country: CountryCode
  currency: CurrencyCode
  amount: number
  compare_at_amount: number | null
}

type OrderRow = {
  id: string
  customer_email: string
  country: CountryCode
  total_amount: number
  currency: CurrencyCode
  status: OrderStatus
  created_at: string
  stripe_session_id: string | null
}

type OrderItemRow = {
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_amount: number
  currency: CurrencyCode
}

function mapProduct(
  row: ProductRow,
  imageRows: ProductImageRow[],
  priceRows: ProductPriceRow[]
): Product {
  const imageUrls = imageRows
    .filter((img) => img.product_id === row.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.url)

  const prices = priceRows
    .filter((price) => price.product_id === row.id)
    .map((price) => ({
      country: price.country,
      currency: price.currency,
      amount: Number(price.amount),
      ...(price.compare_at_amount != null ? { compareAtAmount: Number(price.compare_at_amount) } : {}),
    }))

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    ...(row.long_description ? { longDescription: row.long_description } : {}),
    features: row.features ?? [],
    attributes: Array.isArray(row.attributes) ? (row.attributes as Product['attributes']) : [],
    category: row.category,
    featured: row.featured,
    comboEligible: row.combo_eligible,
    imageUrls,
    prices,
    stock: row.stock,
    active: row.active,
    ...(row.rating != null ? { rating: Number(row.rating) } : {}),
    reviewCount: row.review_count ?? 0,
  }
}

function mapOrder(order: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: order.id,
    customerEmail: order.customer_email,
    country: order.country,
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        productId: item.product_id ?? '',
        productName: item.product_name,
        quantity: item.quantity,
        unitAmount: Number(item.unit_amount),
        currency: item.currency,
      })),
    totalAmount: Number(order.total_amount),
    currency: order.currency,
    status: order.status,
    createdAt: order.created_at,
    ...(order.stripe_session_id ? { stripeSessionId: order.stripe_session_id } : {}),
  }
}

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdmin()

  const { data: productRows, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })

  if (productsError) {
    throw new Error(`Failed to load products: ${productsError.message}`)
  }

  const rows = (productRows ?? []) as ProductRow[]
  const ids = rows.map((row) => row.id)
  if (ids.length === 0) return []

  const [{ data: imageRows, error: imagesError }, { data: priceRows, error: pricesError }] =
    await Promise.all([
      supabase
        .from('product_images')
        .select('product_id,url,sort_order')
        .in('product_id', ids)
        .order('sort_order', { ascending: true }),
      supabase.from('product_prices').select('product_id,country,currency,amount,compare_at_amount').in('product_id', ids),
    ])

  if (imagesError) {
    throw new Error(`Failed to load product images: ${imagesError.message}`)
  }
  if (pricesError) {
    throw new Error(`Failed to load product prices: ${pricesError.message}`)
  }

  return rows.map((row) =>
    mapProduct(row, (imageRows ?? []) as ProductImageRow[], (priceRows ?? []) as ProductPriceRow[])
  )
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = getSupabaseAdmin()
  const { data: row, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load product by slug: ${error.message}`)
  }
  if (!row) return undefined
  const productRow = row as ProductRow

  const [{ data: imageRows, error: imagesError }, { data: priceRows, error: pricesError }] =
    await Promise.all([
      supabase
        .from('product_images')
        .select('product_id,url,sort_order')
        .eq('product_id', productRow.id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('product_prices')
        .select('product_id,country,currency,amount,compare_at_amount')
        .eq('product_id', productRow.id),
    ])

  if (imagesError) {
    throw new Error(`Failed to load product images: ${imagesError.message}`)
  }
  if (pricesError) {
    throw new Error(`Failed to load product prices: ${pricesError.message}`)
  }

  return mapProduct(
    productRow,
    (imageRows ?? []) as ProductImageRow[],
    (priceRows ?? []) as ProductPriceRow[]
  )
}

export async function upsertProduct(product: Product): Promise<Product> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any

  const { error: productError } = await db.from('products').upsert({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    long_description: product.longDescription ?? null,
    features: product.features ?? [],
    attributes: product.attributes ?? [],
    category: product.category,
    featured: product.featured ?? false,
    combo_eligible: product.comboEligible ?? true,
    stock: product.stock,
    active: product.active,
    rating: product.rating ?? null,
    review_count: product.reviewCount ?? 0,
  })

  if (productError) {
    throw new Error(`Failed to upsert product: ${productError.message}`)
  }

  const { error: deleteImagesError } = await db.from('product_images').delete().eq('product_id', product.id)
  if (deleteImagesError) {
    throw new Error(`Failed to replace product images: ${deleteImagesError.message}`)
  }
  const { error: deletePricesError } = await db.from('product_prices').delete().eq('product_id', product.id)
  if (deletePricesError) {
    throw new Error(`Failed to replace product prices: ${deletePricesError.message}`)
  }

  if (product.imageUrls.length > 0) {
    const { error: insertImagesError } = await db.from('product_images').insert(
      product.imageUrls.map((url, idx) => ({
        product_id: product.id,
        url,
        sort_order: idx,
      }))
    )
    if (insertImagesError) {
      throw new Error(`Failed to insert product images: ${insertImagesError.message}`)
    }
  }

  if (product.prices.length > 0) {
    const { error: insertPricesError } = await db.from('product_prices').insert(
      product.prices.map((price) => ({
        product_id: product.id,
        country: price.country,
        currency: price.currency,
        amount: price.amount,
        compare_at_amount: price.compareAtAmount ?? null,
      }))
    )
    if (insertPricesError) {
      throw new Error(`Failed to insert product prices: ${insertPricesError.message}`)
    }
  }

  return product
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const { error } = await db.from('products').update({ active: false }).eq('id', id)
  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`)
  }
}

export async function getOrders(): Promise<Order[]> {
  const supabase = getSupabaseAdmin()
  const { data: orderRows, error: ordersError } = await supabase
    .from('orders')
    .select('id,customer_email,country,total_amount,currency,status,created_at,stripe_session_id')
    .order('created_at', { ascending: false })

  if (ordersError) {
    throw new Error(`Failed to load orders: ${ordersError.message}`)
  }

  const rows = (orderRows ?? []) as OrderRow[]
  const ids = rows.map((row) => row.id)
  if (ids.length === 0) return []

  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('order_id,product_id,product_name,quantity,unit_amount,currency')
    .in('order_id', ids)

  if (itemsError) {
    throw new Error(`Failed to load order items: ${itemsError.message}`)
  }

  return rows.map((order) => mapOrder(order, (itemRows ?? []) as OrderItemRow[]))
}

export async function appendOrder(order: Order): Promise<Order> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any

  const { error: orderError } = await db.from('orders').insert({
    id: order.id,
    customer_email: order.customerEmail,
    country: order.country,
    total_amount: order.totalAmount,
    currency: order.currency,
    status: order.status,
    created_at: order.createdAt,
    stripe_session_id: order.stripeSessionId ?? null,
  })
  if (orderError) {
    throw new Error(`Failed to insert order: ${orderError.message}`)
  }

  if (order.items.length > 0) {
    const { error: itemsError } = await db.from('order_items').insert(
      order.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_amount: item.unitAmount,
        currency: item.currency,
      }))
    )
    if (itemsError) {
      throw new Error(`Failed to insert order items: ${itemsError.message}`)
    }
  }

  return order
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const patch: Record<string, unknown> = {}

  if (updates.status) patch.status = updates.status
  if (updates.stripeSessionId !== undefined) patch.stripe_session_id = updates.stripeSessionId ?? null
  if (updates.totalAmount !== undefined) patch.total_amount = updates.totalAmount
  if (updates.currency !== undefined) patch.currency = updates.currency

  if (Object.keys(patch).length > 0) {
    const { error: updateError } = await db.from('orders').update(patch).eq('id', id)
    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`)
    }
  }

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .select('id,customer_email,country,total_amount,currency,status,created_at,stripe_session_id')
    .eq('id', id)
    .maybeSingle()

  if (orderError) {
    throw new Error(`Failed to read updated order: ${orderError.message}`)
  }
  if (!orderRow) return null

  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('order_id,product_id,product_name,quantity,unit_amount,currency')
    .eq('order_id', id)

  if (itemsError) {
    throw new Error(`Failed to read updated order items: ${itemsError.message}`)
  }

  return mapOrder(orderRow as OrderRow, (itemRows ?? []) as OrderItemRow[])
}

export async function findOrderBySession(sessionId: string): Promise<Order | null> {
  const supabase = getSupabaseAdmin()
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .select('id,customer_email,country,total_amount,currency,status,created_at,stripe_session_id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (orderError) {
    throw new Error(`Failed to find order by session: ${orderError.message}`)
  }
  if (!orderRow) return null
  const foundOrder = orderRow as OrderRow

  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('order_id,product_id,product_name,quantity,unit_amount,currency')
    .eq('order_id', foundOrder.id)

  if (itemsError) {
    throw new Error(`Failed to load order items by session: ${itemsError.message}`)
  }

  return mapOrder(foundOrder, (itemRows ?? []) as OrderItemRow[])
}
