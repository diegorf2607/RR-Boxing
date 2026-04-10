'use client'

import { useState } from 'react'
import { useCart } from '@/features/cart/CartProvider'

export default function AddToCartButton({ productId }: { productId: string }) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        className="w-20 rounded-lg border border-dark-300 bg-dark-100 px-3 py-2"
      />
      <button
        onClick={() => addItem(productId, qty)}
        className="rounded-xl bg-accent px-6 py-3 font-bold text-dark hover:bg-accent-dark"
      >
        Agregar al carrito
      </button>
    </div>
  )
}
