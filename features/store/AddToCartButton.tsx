'use client'

import { useState } from 'react'
import { useCart } from '@/features/cart/CartProvider'
import { getProductStockUrgency } from '@/features/store/stockUrgency'

export default function AddToCartButton({
  productId,
  stock,
}: {
  productId: string
  /** Si no se pasa, sin modo urgente en el botón */
  stock?: number
}) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const urgency = stock != null ? getProductStockUrgency(stock) : null
  const out = stock != null && stock <= 0
  const urgent = urgency?.ctaUrgent && !out

  const btnClass = urgent
    ? 'rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-6 py-3 font-black uppercase tracking-wide text-white shadow-xl shadow-red-900/35 ring-1 ring-red-400/50 transition hover:brightness-110 disabled:opacity-40'
    : 'rounded-xl bg-accent px-6 py-3 font-bold text-dark hover:bg-accent-dark disabled:opacity-40'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="number"
        min={1}
        max={stock && stock > 0 ? stock : undefined}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        disabled={out}
        className="w-20 rounded-lg border border-dark-300 bg-dark-100 px-3 py-2 text-white disabled:opacity-40"
      />
      <button type="button" disabled={out} onClick={() => addItem(productId, qty)} className={btnClass}>
        {out ? 'Sin stock' : urgent ? 'Reservar en carrito' : 'Agregar al carrito'}
      </button>
    </div>
  )
}
