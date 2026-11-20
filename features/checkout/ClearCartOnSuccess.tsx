'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@/features/cart/CartProvider'

export default function ClearCartOnSuccess({ sessionId }: { sessionId?: string }) {
  const { items, clearCart } = useCart()
  // clearCart cambia en cada render: se vacía una sola vez, cuando el carrito ya se leyó del navegador,
  // para no entrar en un bucle de renders.
  const yaVaciado = useRef(false)
  const hayProductos = items.length > 0

  useEffect(() => {
    if (!sessionId || !hayProductos || yaVaciado.current) return
    yaVaciado.current = true
    clearCart()
  }, [sessionId, hayProductos, clearCart])

  return null
}
