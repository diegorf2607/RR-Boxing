import type { Product } from '@/shared/types/commerce'

export function getProductPublishBlockers(product: Product): string[] {
  const issues: string[] = []
  if (!product.slug?.trim()) issues.push('Falta slug')
  if (!product.name?.trim() || product.name.length < 3) issues.push('Nombre demasiado corto')
  if (!product.description?.trim() || product.description.length < 10) {
    issues.push('Descripción demasiado corta (mín. 10 caracteres)')
  }
  if (!product.category?.trim()) issues.push('Falta categoría')
  const pe = product.prices.find((p) => p.country === 'PE')
  if (!pe || !Number.isFinite(pe.amount) || pe.amount <= 0) {
    issues.push('Precio PE (PEN) debe ser mayor que 0')
  }
  if (!Number.isFinite(product.stock) || product.stock < 0) issues.push('Stock inválido')
  if (product.imageUrls.length === 0) issues.push('Falta al menos una imagen')
  return issues
}

export function getProductAdminHints(product: Product, lowStockThreshold: number): string[] {
  const hints: string[] = []
  if (product.imageUrls.length === 0) hints.push('Sin imágenes')
  else if (!product.productImages?.some((i) => i.isPrimary)) hints.push('Sin imagen principal marcada')
  if (product.stock === 0) hints.push('Sin stock')
  else if (product.stock > 0 && product.stock < lowStockThreshold) hints.push(`Stock bajo (< ${lowStockThreshold})`)
  if (!product.sku?.trim()) hints.push('Sin SKU')
  if (!product.longDescription?.trim()) hints.push('Sin descripción larga')
  return hints
}
