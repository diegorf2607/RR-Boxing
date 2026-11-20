'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@/features/cart/CartProvider'

/** Vacía el carrito al volver de pagar un pedido (/checkout/success?pedido=…). */
export default function ClearCartOnSuccess({ pedido }: { pedido?: string }) {
  const { items, clearCart } = useCart()
  // Se vacía una sola vez, cuando el carrito ya se leyó del navegador, para no entrar en un bucle de renders.
  const yaVaciado = useRef(false)
  const hayProductos = items.length > 0

  useEffect(() => {
    if (!pedido || !hayProductos || yaVaciado.current) return
    yaVaciado.current = true
    clearCart()
  }, [pedido, hayProductos, clearCart])

  return null
}
