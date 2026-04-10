import { promises as fs } from 'fs'
import path from 'path'
import type { Order, Product } from '@/shared/types/commerce'

const productsPath = path.join(process.cwd(), 'data', 'products.json')
const ordersPath = path.join(process.cwd(), 'data', 'orders.json')

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content) as T
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

export async function getProducts(): Promise<Product[]> {
  return readJsonFile<Product[]>(productsPath)
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts()
  return products.find((p) => p.slug === slug && p.active)
}

export async function upsertProduct(product: Product): Promise<Product> {
  const products = await getProducts()
  const index = products.findIndex((p) => p.id === product.id)
  if (index >= 0) products[index] = product
  else products.push(product)
  await writeJsonFile(productsPath, products)
  return product
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await getProducts()
  await writeJsonFile(
    productsPath,
    products.map((p) => (p.id === id ? { ...p, active: false } : p))
  )
}

export async function getOrders(): Promise<Order[]> {
  return readJsonFile<Order[]>(ordersPath)
}

export async function appendOrder(order: Order): Promise<Order> {
  const orders = await getOrders()
  orders.unshift(order)
  await writeJsonFile(ordersPath, orders)
  return order
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const orders = await getOrders()
  const index = orders.findIndex((o) => o.id === id)
  if (index < 0) return null
  const updated = { ...orders[index], ...updates }
  orders[index] = updated
  await writeJsonFile(ordersPath, orders)
  return updated
}

export async function findOrderBySession(sessionId: string): Promise<Order | null> {
  const orders = await getOrders()
  return orders.find((order) => order.stripeSessionId === sessionId) ?? null
}
