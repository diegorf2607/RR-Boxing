import { randomUUID } from 'crypto'
import type { Order, Product, ProductImage, ListingStatus, PaymentStatus, OrderStatus } from '@/shared/types/commerce'
import type { AdminNotification, AdminNotificationType, StoreSettings } from '@/shared/types/admin'
import type { DigitalGift, DigitalGiftType, OrderGiftSendEvent } from '@/shared/types/digital-gifts'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'
import type { CountryCode, CurrencyCode } from '@/shared/types/commerce'

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
  listing_status?: string | null
  sku?: string | null
  display_order?: number | null
  weight_grams?: number | null
  internal_notes?: string | null
  created_at?: string
  updated_at?: string
}

type ProductImageRow = {
  product_id: string
  url: string
  sort_order: number
  is_primary?: boolean | null
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
  customer_name?: string | null
  country: CountryCode
  total_amount: number
  currency: CurrencyCode
  status: OrderStatus
  payment_status?: PaymentStatus | null
  payment_method?: string | null
  internal_notes?: string | null
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

function listingFromRow(row: ProductRow): ListingStatus {
  const ls = row.listing_status
  if (ls === 'draft' || ls === 'inactive' || ls === 'active') return ls
  return row.active ? 'active' : 'inactive'
}

function sortImageRows(rows: ProductImageRow[]): ProductImageRow[] {
  return [...rows].sort((a, b) => {
    const ap = a.is_primary ? 1 : 0
    const bp = b.is_primary ? 1 : 0
    if (ap !== bp) return bp - ap
    return a.sort_order - b.sort_order
  })
}

function mapProduct(row: ProductRow, imageRows: ProductImageRow[], priceRows: ProductPriceRow[]): Product {
  const ownImages = sortImageRows(imageRows.filter((img) => img.product_id === row.id))
  const productImages: ProductImage[] = ownImages.map((img) => ({
    url: img.url,
    sortOrder: img.sort_order,
    isPrimary: !!img.is_primary,
  }))
  const imageUrls = ownImages.map((img) => img.url)

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
    productImages,
    prices,
    stock: row.stock,
    active: row.active,
    listingStatus: listingFromRow(row),
    sku: row.sku ?? undefined,
    displayOrder: row.display_order ?? 0,
    weightGrams: row.weight_grams ?? undefined,
    internalNotes: row.internal_notes ?? undefined,
    ...(row.created_at ? { createdAt: row.created_at } : {}),
    ...(row.updated_at ? { updatedAt: row.updated_at } : {}),
    ...(row.rating != null ? { rating: Number(row.rating) } : {}),
    reviewCount: row.review_count ?? 0,
  }
}

function mapOrder(order: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: order.id,
    customerEmail: order.customer_email,
    ...(order.customer_name ? { customerName: order.customer_name } : {}),
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
    paymentStatus: (order.payment_status as PaymentStatus) ?? (order.status === 'paid' ? 'paid' : 'unpaid'),
    paymentMethod: order.payment_method ?? undefined,
    internalNotes: order.internal_notes ?? undefined,
    createdAt: order.created_at,
    ...(order.stripe_session_id ? { stripeSessionId: order.stripe_session_id } : {}),
  }
}

async function loadProductRelations(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  ids: string[]
): Promise<{ imageRows: ProductImageRow[]; priceRows: ProductPriceRow[] }> {
  if (ids.length === 0) return { imageRows: [], priceRows: [] }
  const [{ data: imageRows, error: imagesError }, { data: priceRows, error: pricesError }] =
    await Promise.all([
      supabase
        .from('product_images')
        .select('product_id,url,sort_order,is_primary')
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
  return {
    imageRows: (imageRows ?? []) as ProductImageRow[],
    priceRows: (priceRows ?? []) as ProductPriceRow[],
  }
}

/** Catálogo tienda: activos y listados como activos (listing en código si la columna falta). */
export async function getStoreProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdmin()
  const { data: productRows, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (productsError) {
    throw new Error(`Failed to load products: ${productsError.message}`)
  }

  const rowsRaw = (productRows ?? []) as ProductRow[]
  const rows = [...rowsRaw]
    .filter((r) => listingFromRow(r) === 'active')
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  const ids = rows.map((row) => row.id)
  const { imageRows, priceRows } = await loadProductRelations(supabase, ids)
  return rows.map((row) => mapProduct(row, imageRows, priceRows))
}

export async function getProducts(): Promise<Product[]> {
  return getStoreProducts()
}

/** Admin: todos los productos. */
export async function getAdminProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdmin()
  const { data: productRows, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })

  if (productsError) {
    throw new Error(`Failed to load admin products: ${productsError.message}`)
  }

  const rows = [...((productRows ?? []) as ProductRow[])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  )
  const ids = rows.map((row) => row.id)
  const { imageRows, priceRows } = await loadProductRelations(supabase, ids)
  return rows.map((row) => mapProduct(row, imageRows, priceRows))
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = getSupabaseAdmin()
  const { data: row, error } = await supabase.from('products').select('*').eq('slug', slug).eq('active', true).maybeSingle()

  if (error) {
    throw new Error(`Failed to load product by slug: ${error.message}`)
  }
  if (!row) return undefined
  const productRow = row as ProductRow
  if (listingFromRow(productRow) !== 'active') return undefined

  const { imageRows, priceRows } = await loadProductRelations(supabase, [productRow.id])
  return mapProduct(productRow, imageRows, priceRows)
}

export async function getAdminProductById(id: string): Promise<Product | undefined> {
  const supabase = getSupabaseAdmin()
  const { data: row, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Failed to load product: ${error.message}`)
  if (!row) return undefined
  const productRow = row as ProductRow
  const { imageRows, priceRows } = await loadProductRelations(supabase, [productRow.id])
  return mapProduct(productRow, imageRows, priceRows)
}

export async function isProductSlugTaken(slug: string, excludeProductId?: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  let q = supabase.from('products').select('id').eq('slug', slug).limit(1)
  if (excludeProductId) {
    q = q.neq('id', excludeProductId)
  }
  const { data, error } = await q.maybeSingle()
  if (error) throw new Error(`Slug check failed: ${error.message}`)
  return !!data
}

function normalizeProductImages(product: Product): ProductImage[] {
  if (product.productImages && product.productImages.length > 0) {
    const sorted = [...product.productImages].sort((a, b) => a.sortOrder - b.sortOrder)
    let primaryIdx = sorted.findIndex((i) => i.isPrimary)
    if (primaryIdx < 0) {
      primaryIdx = 0
    }
    return sorted.map((img, i) => ({
      ...img,
      sortOrder: i,
      isPrimary: i === primaryIdx,
    }))
  }
  return product.imageUrls.map((url, i) => ({
    url,
    sortOrder: i,
    isPrimary: i === 0,
  }))
}

export async function upsertProduct(product: Product): Promise<Product> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any

  const listingStatus = product.listingStatus ?? (product.active ? 'active' : 'inactive')
  const nowIso = new Date().toISOString()

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
    listing_status: listingStatus,
    sku: product.sku?.trim() ? product.sku.trim() : null,
    display_order: product.displayOrder ?? 0,
    weight_grams: product.weightGrams ?? null,
    internal_notes: product.internalNotes ?? null,
    rating: product.rating ?? null,
    review_count: product.reviewCount ?? 0,
    updated_at: nowIso,
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

  const imgs = normalizeProductImages(product)
  if (imgs.length > 0) {
    const { error: insertImagesError } = await db.from('product_images').insert(
      imgs.map((img) => ({
        product_id: product.id,
        url: img.url,
        sort_order: img.sortOrder,
        is_primary: img.isPrimary,
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

  const out = await getAdminProductById(product.id)
  return out ?? product
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const { error } = await db
    .from('products')
    .update({ active: false, listing_status: 'inactive', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`)
  }
}

export async function duplicateProduct(sourceId: string): Promise<Product> {
  const src = await getAdminProductById(sourceId)
  if (!src) throw new Error('Product not found')
  const newId = `prod_${Date.now()}`
  const slugBase = `${src.slug}-copia`.slice(0, 80)
  let slug = `${slugBase}-${Date.now().toString(36)}`
  let n = 0
  while (await isProductSlugTaken(slug)) {
    n += 1
    slug = `${slugBase}-${n}`
  }
  const clone: Product = {
    ...src,
    id: newId,
    slug,
    name: `${src.name} (copia)`,
    active: false,
    listingStatus: 'draft',
    sku: null,
    displayOrder: (src.displayOrder ?? 0) + 1,
  }
  return upsertProduct(clone)
}

const orderSelect =
  'id,customer_email,customer_name,country,total_amount,currency,status,payment_status,payment_method,internal_notes,created_at,stripe_session_id'

export async function getOrders(): Promise<Order[]> {
  const supabase = getSupabaseAdmin()
  const { data: orderRows, error: ordersError } = await supabase
    .from('orders')
    .select(orderSelect)
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

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = getSupabaseAdmin()
  const { data: orderRow, error } = await supabase.from('orders').select(orderSelect).eq('id', id).maybeSingle()
  if (error) throw new Error(`Failed to load order: ${error.message}`)
  if (!orderRow) return null
  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('order_id,product_id,product_name,quantity,unit_amount,currency')
    .eq('order_id', id)
  if (itemsError) throw new Error(`Failed to load order items: ${itemsError.message}`)
  return mapOrder(orderRow as OrderRow, (itemRows ?? []) as OrderItemRow[])
}

export async function appendOrder(order: Order): Promise<Order> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any

  const paymentStatus = order.paymentStatus ?? (order.status === 'paid' ? 'paid' : 'unpaid')

  const { error: orderError } = await db.from('orders').insert({
    id: order.id,
    customer_email: order.customerEmail,
    customer_name: order.customerName ?? null,
    country: order.country,
    total_amount: order.totalAmount,
    currency: order.currency,
    status: order.status,
    payment_status: paymentStatus,
    payment_method: order.paymentMethod ?? null,
    internal_notes: order.internalNotes ?? null,
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

  void insertAdminNotificationSafe({
    type: paymentStatus === 'unpaid' ? 'order_pending_payment' : 'new_order',
    severity: paymentStatus === 'unpaid' ? 'warning' : 'info',
    title: paymentStatus === 'unpaid' ? 'Pedido pendiente de pago' : 'Nuevo pedido',
    body: `${order.customerEmail} · ${order.currency} ${order.totalAmount.toFixed(2)}`,
    link: `/admin/orders/${order.id}`,
    entityType: 'order',
    entityId: order.id,
  })

  return order
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const patch: Record<string, unknown> = {}

  if (updates.status !== undefined) patch.status = updates.status
  if (updates.stripeSessionId !== undefined) patch.stripe_session_id = updates.stripeSessionId ?? null
  if (updates.totalAmount !== undefined) patch.total_amount = updates.totalAmount
  if (updates.currency !== undefined) patch.currency = updates.currency
  if (updates.paymentStatus !== undefined) patch.payment_status = updates.paymentStatus
  if (updates.paymentMethod !== undefined) patch.payment_method = updates.paymentMethod ?? null
  if (updates.internalNotes !== undefined) patch.internal_notes = updates.internalNotes ?? null
  if (updates.customerName !== undefined) patch.customer_name = updates.customerName ?? null

  if (Object.keys(patch).length > 0) {
    const { error: updateError } = await db.from('orders').update(patch).eq('id', id)
    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`)
    }
  }

  return getOrderById(id)
}

export async function findOrderBySession(sessionId: string): Promise<Order | null> {
  const supabase = getSupabaseAdmin()
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .select(orderSelect)
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

function mapNotificationRow(row: {
  id: string
  type: string
  severity: string
  title: string
  body: string | null
  link: string | null
  entity_type: string | null
  entity_id: string | null
  read_at: string | null
  created_at: string
}): AdminNotification {
  return {
    id: row.id,
    type: row.type as AdminNotificationType,
    severity: row.severity as AdminNotification['severity'],
    title: row.title,
    body: row.body,
    link: row.link,
    entityType: row.entity_type,
    entityId: row.entity_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  }
}

export async function insertAdminNotification(input: {
  type: AdminNotificationType
  severity: AdminNotification['severity']
  title: string
  body?: string | null
  link?: string | null
  entityType?: string | null
  entityId?: string | null
}): Promise<void> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const { error } = await db.from('admin_notifications').insert({
    type: input.type,
    severity: input.severity,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
  })
  if (error) throw new Error(`Failed to insert notification: ${error.message}`)
}

async function insertAdminNotificationSafe(input: Parameters<typeof insertAdminNotification>[0]) {
  try {
    await insertAdminNotification(input)
  } catch {
    /* tabla ausente o RLS */
  }
}

export async function listAdminNotifications(limit = 50): Promise<AdminNotification[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []).map((r) => mapNotificationRow(r as any))
}

export async function countUnreadAdminNotifications(): Promise<number> {
  const supabase = getSupabaseAdmin()
  const { count, error } = await supabase
    .from('admin_notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
  if (error) return 0
  return count ?? 0
}

export async function markAdminNotificationRead(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const { error } = await db.from('admin_notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const { error } = await db
    .from('admin_notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)
  if (error) throw new Error(error.message)
}

function mapStoreSettingsRow(row: {
  store_name: string
  default_currency_display: string
  low_stock_threshold: number
  support_contact_text: string
  checkout_helper_text: string
  store_enabled: boolean
  updated_at: string
}): StoreSettings {
  return {
    storeName: row.store_name,
    defaultCurrencyDisplay: row.default_currency_display,
    lowStockThreshold: row.low_stock_threshold,
    supportContactText: row.support_contact_text,
    checkoutHelperText: row.checkout_helper_text,
    storeEnabled: row.store_enabled,
    updatedAt: row.updated_at,
  }
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle()
  if (error || !data) {
    return {
      storeName: 'RRBOXING',
      defaultCurrencyDisplay: 'PEN',
      lowStockThreshold: 5,
      supportContactText: '',
      checkoutHelperText: '',
      storeEnabled: true,
      updatedAt: new Date().toISOString(),
    }
  }
  return mapStoreSettingsRow(data as any)
}

export async function updateStoreSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const current = await getStoreSettings()
  const merged: StoreSettings = {
    storeName: patch.storeName ?? current.storeName,
    defaultCurrencyDisplay: patch.defaultCurrencyDisplay ?? current.defaultCurrencyDisplay,
    lowStockThreshold: patch.lowStockThreshold ?? current.lowStockThreshold,
    supportContactText: patch.supportContactText ?? current.supportContactText,
    checkoutHelperText: patch.checkoutHelperText ?? current.checkoutHelperText,
    storeEnabled: patch.storeEnabled ?? current.storeEnabled,
    updatedAt: new Date().toISOString(),
  }

  const { error } = await db.from('store_settings').upsert({
    id: 1,
    store_name: merged.storeName,
    default_currency_display: merged.defaultCurrencyDisplay,
    low_stock_threshold: merged.lowStockThreshold,
    support_contact_text: merged.supportContactText,
    checkout_helper_text: merged.checkoutHelperText,
    store_enabled: merged.storeEnabled,
    updated_at: merged.updatedAt,
  })
  if (error) throw new Error(`Failed to update store settings: ${error.message}`)
  return getStoreSettings()
}

export type DashboardKpis = {
  activeProducts: number
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  ordersToday: number
  revenueTotal: number
  revenueMonth: number
  averageTicket: number
  lowStockProducts: number
  productsWithoutImages: number
}

export type DashboardSnapshot = {
  kpis: DashboardKpis
  ordersByStatus: Partial<Record<OrderStatus, number>>
  lowStockCountByBand: { critical: number; warning: number }
  recentOrders: Order[]
  recentProducts: Product[]
  notifications: AdminNotification[]
  unreadNotifications: number
  settings: StoreSettings
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function isPaidOrder(o: Order): boolean {
  return o.paymentStatus === 'paid' || ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [products, orders, notifications, unread, settings] = await Promise.all([
    getAdminProducts(),
    getOrders(),
    listAdminNotifications(30),
    countUnreadAdminNotifications(),
    getStoreSettings(),
  ])

  const threshold = settings.lowStockThreshold
  const activeProducts = products.filter((p) => p.active && p.listingStatus === 'active').length
  const paidOrders = orders.filter(isPaidOrder).length
  const pendingOrders = orders.filter((o) => o.status === 'pending' && o.paymentStatus === 'unpaid').length
  const now = new Date()
  const sod = startOfUtcDay(now)
  const ordersToday = orders.filter((o) => new Date(o.createdAt) >= sod).length

  const revenueTotal = orders.filter(isPaidOrder).reduce((s, o) => s + o.totalAmount, 0)
  const month = now.getUTCMonth()
  const year = now.getUTCFullYear()
  const revenueMonth = orders
    .filter((o) => {
      const t = new Date(o.createdAt)
      return isPaidOrder(o) && t.getUTCMonth() === month && t.getUTCFullYear() === year
    })
    .reduce((s, o) => s + o.totalAmount, 0)

  const averageTicket = paidOrders > 0 ? revenueTotal / paidOrders : 0

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < threshold).length
  const productsWithoutImages = products.filter((p) => p.imageUrls.length === 0).length

  const ordersByStatus: Partial<Record<OrderStatus, number>> = {}
  for (const o of orders) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1
  }

  let critical = 0
  let warning = 0
  for (const p of products) {
    if (p.stock <= 0) continue
    if (p.stock < Math.max(1, Math.floor(threshold / 2))) critical += 1
    else if (p.stock < threshold) warning += 1
  }

  const recentOrders = orders.slice(0, 8)
  const recentProducts = [...products]
    .sort((a, b) => {
      const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
      const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime()
      return tb - ta
    })
    .slice(0, 8)

  return {
    kpis: {
      activeProducts,
      totalOrders: orders.length,
      paidOrders,
      pendingOrders,
      ordersToday,
      revenueTotal,
      revenueMonth,
      averageTicket,
      lowStockProducts,
      productsWithoutImages,
    },
    ordersByStatus,
    lowStockCountByBand: { critical, warning },
    recentOrders,
    recentProducts,
    notifications,
    unreadNotifications: unread,
    settings,
  }
}

/* ---------- Regalos digitales ---------- */

type DigitalGiftRow = {
  id: string
  name: string
  gift_type: string
  description: string
  content_url: string
  active: boolean
  created_at: string
  updated_at: string
}

function mapDigitalGiftRow(row: DigitalGiftRow): DigitalGift {
  return {
    id: row.id,
    name: row.name,
    giftType: row.gift_type as DigitalGiftType,
    description: row.description ?? '',
    contentUrl: row.content_url,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listDigitalGifts(includeInactive = false): Promise<DigitalGift[]> {
  const supabase = getSupabaseAdmin()
  let q = supabase.from('digital_gifts').select('*').order('name', { ascending: true })
  if (!includeInactive) {
    q = q.eq('active', true)
  }
  const { data, error } = await q
  if (error) throw new Error(`digital_gifts: ${error.message}`)
  return (data ?? []).map((r) => mapDigitalGiftRow(r as DigitalGiftRow))
}

export async function getDigitalGiftById(id: string): Promise<DigitalGift | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('digital_gifts').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`digital_gifts: ${error.message}`)
  if (!data) return null
  return mapDigitalGiftRow(data as DigitalGiftRow)
}

export async function upsertDigitalGift(input: {
  id?: string
  name: string
  giftType: DigitalGiftType
  description: string
  contentUrl: string
  active?: boolean
}): Promise<DigitalGift> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const id = input.id ?? randomUUID()
  const now = new Date().toISOString()
  const { error } = await db.from('digital_gifts').upsert({
    id,
    name: input.name,
    gift_type: input.giftType,
    description: input.description ?? '',
    content_url: input.contentUrl,
    active: input.active ?? true,
    updated_at: now,
  })
  if (error) throw new Error(`digital_gifts upsert: ${error.message}`)
  const out = await getDigitalGiftById(id)
  if (!out) throw new Error('digital_gifts read after upsert failed')
  return out
}

export async function setDigitalGiftActive(id: string, active: boolean): Promise<void> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const { error } = await db
    .from('digital_gifts')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`digital_gifts: ${error.message}`)
}

export async function setOrderDigitalGifts(orderId: string, giftIds: string[]): Promise<void> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const { error: delErr } = await db.from('order_digital_gifts').delete().eq('order_id', orderId)
  if (delErr) throw new Error(`order_digital_gifts: ${delErr.message}`)
  if (giftIds.length === 0) return
  const rows = giftIds.map((digital_gift_id, sort_order) => ({ order_id: orderId, digital_gift_id, sort_order }))
  const { error: insErr } = await db.from('order_digital_gifts').insert(rows)
  if (insErr) throw new Error(`order_digital_gifts: ${insErr.message}`)
}

export async function getOrderDigitalGiftsForOrder(orderId: string): Promise<DigitalGift[]> {
  const supabase = getSupabaseAdmin()
  const { data: links, error: lerr } = await supabase
    .from('order_digital_gifts')
    .select('digital_gift_id,sort_order')
    .eq('order_id', orderId)
    .order('sort_order', { ascending: true })
  if (lerr) throw new Error(`order_digital_gifts: ${lerr.message}`)
  const ids = (links ?? []).map((l: { digital_gift_id: string }) => l.digital_gift_id)
  if (ids.length === 0) return []
  const { data: gifts, error: gerr } = await supabase.from('digital_gifts').select('*').in('id', ids)
  if (gerr) throw new Error(`digital_gifts: ${gerr.message}`)
  const byId = new Map((gifts ?? []).map((r: DigitalGiftRow) => [r.id, mapDigitalGiftRow(r)]))
  return ids.map((id) => byId.get(id)).filter(Boolean) as DigitalGift[]
}

function mapSendEventRow(row: {
  id: string
  order_id: string
  created_at: string
  recipient_email: string
  is_resend: boolean
  channel: string
  success: boolean
  provider_message_id: string | null
  error_text: string | null
  body_preview: string | null
  admin_note: string | null
}): OrderGiftSendEvent {
  return {
    id: row.id,
    orderId: row.order_id,
    createdAt: row.created_at,
    recipientEmail: row.recipient_email,
    isResend: row.is_resend,
    channel: row.channel as OrderGiftSendEvent['channel'],
    success: row.success,
    providerMessageId: row.provider_message_id,
    errorText: row.error_text,
    bodyPreview: row.body_preview,
    adminNote: row.admin_note,
  }
}

export async function listOrderGiftSendEvents(orderId: string): Promise<OrderGiftSendEvent[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('order_digital_gift_send_events')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`order_digital_gift_send_events: ${error.message}`)
  return (data ?? []).map((r) => mapSendEventRow(r as any))
}

export async function insertOrderGiftSendEvent(input: {
  orderId: string
  recipientEmail: string
  isResend: boolean
  channel: OrderGiftSendEvent['channel']
  success: boolean
  providerMessageId?: string | null
  errorText?: string | null
  bodyPreview?: string | null
  adminNote?: string | null
}): Promise<void> {
  const supabase = getSupabaseAdmin()
  const db = supabase as any
  const { error } = await db.from('order_digital_gift_send_events').insert({
    order_id: input.orderId,
    recipient_email: input.recipientEmail,
    is_resend: input.isResend,
    channel: input.channel,
    success: input.success,
    provider_message_id: input.providerMessageId ?? null,
    error_text: input.errorText ?? null,
    body_preview: input.bodyPreview ?? null,
    admin_note: input.adminNote ?? null,
  })
  if (error) throw new Error(`order_digital_gift_send_events: ${error.message}`)
}

export function buildDigitalGiftsEmailDraft(params: {
  orderId: string
  customerName?: string | null
  gifts: DigitalGift[]
}): { subject: string; text: string } {
  const lines = params.gifts.map((g) => {
    const tipo = g.giftType === 'pdf' ? 'PDF' : g.giftType === 'video' ? 'Video' : 'Enlace'
    return `- ${g.name} (${tipo}): ${g.contentUrl}`
  })
  const subject = `Tus regalos digitales — pedido ${params.orderId}`
  const greet = params.customerName ? `Hola ${params.customerName},` : 'Hola,'
  const text = `${greet}

Gracias por tu compra. Aquí tienes los enlaces a tus regalos digitales prometidos:

${lines.join('\n')}

Si tienes problemas para abrir algún archivo, responde a este correo o escríbenos desde la web.

Saludos,
RR Boxing`
  return { subject, text }
}

