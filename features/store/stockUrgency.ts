/** Mensajes de escasez según stock (catálogo). */
export type StockUrgencyLevel = 'critical' | 'high' | 'warm'

export type StockUrgency = {
  level: StockUrgencyLevel
  label: string
  /** Clases del chip sobre la imagen */
  pillClass: string
  /** Si el CTA principal debe verse en modo “urgente” (rojo) */
  ctaUrgent: boolean
}

export function getProductStockUrgency(stock: number): StockUrgency | null {
  if (stock <= 0) {
    return {
      level: 'critical',
      label: 'Sin stock',
      pillClass: 'bg-neutral-800 text-neutral-light ring-1 ring-white/20',
      ctaUrgent: false,
    }
  }
  if (stock === 1) {
    return {
      level: 'critical',
      label: 'Última unidad',
      pillClass:
        'bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg shadow-red-900/50 ring-2 ring-red-400/80',
      ctaUrgent: true,
    }
  }
  if (stock <= 5) {
    return {
      level: 'critical',
      label: `Últimas ${stock} u.`,
      pillClass: 'bg-red-600 text-white font-black shadow-md shadow-red-900/40 ring-1 ring-red-300/60',
      ctaUrgent: true,
    }
  }
  if (stock <= 15) {
    return {
      level: 'high',
      label: 'Stock bajo',
      pillClass: 'bg-gradient-to-r from-orange-600 to-red-500 text-white font-bold shadow-md ring-1 ring-orange-300/50',
      ctaUrgent: true,
    }
  }
  if (stock <= 35) {
    return {
      level: 'warm',
      label: 'Se agota rápido',
      pillClass: 'bg-amber-500/95 text-dark font-bold ring-1 ring-amber-200/80',
      ctaUrgent: false,
    }
  }
  return null
}
