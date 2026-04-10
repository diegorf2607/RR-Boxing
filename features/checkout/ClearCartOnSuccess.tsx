'use client'

import { useEffect } from 'react'
import { useCart } from '@/features/cart/CartProvider'

export default function ClearCartOnSuccess({ sessionId }: { sessionId?: string }) {
  const { clearCart } = useCart()

  useEffect(() => {
    if (!sessionId) return
    clearCart()
  }, [sessionId, clearCart])

  return null
}
