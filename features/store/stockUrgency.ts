/**
 * Estado de stock que se muestra en la tienda, sin presión.
 *
 * El número de stock se escribe a mano en el panel y todavía no baja con las ventas,
 * así que no se muestra «N unidades disponibles». Solo se avisa cuántas quedan cuando
 * son muy pocas (STOCK_BAJO_MAX o menos), con un texto neutro.
 */
export const STOCK_BAJO_MAX = 3

export type StockStatus = {
  kind: 'agotado' | 'pocas' | 'disponible'
  /** Texto corto y neutro, en minúsculas normales: «Disponible», «Quedan 3 unidades», «Agotado». */
  label: string
}

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return { kind: 'agotado', label: 'Agotado por ahora' }
  if (stock === 1) return { kind: 'pocas', label: 'Queda 1 unidad' }
  if (stock <= STOCK_BAJO_MAX) return { kind: 'pocas', label: `Quedan ${stock} unidades` }
  return { kind: 'disponible', label: 'Disponible' }
}
