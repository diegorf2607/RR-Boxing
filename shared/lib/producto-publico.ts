// El producto tal como se puede mostrar al público: sin la valoración ni el número de opiniones (no hay reseñas
// reales detrás) y sin las notas internas del panel. Los datos siguen en la base: solo se quitan de lo que sale.
// Lo usan el catálogo (/api/products) y la ficha (/product/[slug]), que le pasa el producto a componentes del
// navegador: todo lo que reciben queda escrito en el HTML de la página.
import type { Product } from '@/shared/types/commerce'

export type ProductoPublico = Omit<Product, 'rating' | 'reviewCount' | 'internalNotes'>

export function productoPublico(product: Product): ProductoPublico {
  const { rating: _rating, reviewCount: _reviewCount, internalNotes: _internalNotes, ...publico } = product
  return publico
}
