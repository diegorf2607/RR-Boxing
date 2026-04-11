'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem } from '@/shared/types/commerce'

interface CartContextValue {
  items: CartItem[]
  addItem: (productId: string, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  count: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  /** Evita escribir [] en localStorage antes de leer (eso borraba el carrito en cada carga). */
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rrboxing_cart')
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[]
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {
      /* ignore corrupt storage */
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('rrboxing_cart', JSON.stringify(items))
  }, [items, hydrated])

  const addItem = (productId: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...prev, { productId, quantity }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(productId)
    setItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => setItems([])

  const count = items.reduce((acc, item) => acc + item.quantity, 0)

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, count }),
    [items, count]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
