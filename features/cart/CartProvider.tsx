'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem } from '@/shared/types/commerce'
import { MAX_UNIDADES_LINEA, claveLinea } from '@/features/cart/lineas'
import { limpiarVariante } from '@/features/store/colores'
import CarritoLateral from '@/features/cart/CarritoLateral'

export type VarianteCarrito = NonNullable<CartItem['variante']>

interface CartContextValue {
  /**
   * Las líneas del carrito. Cada una es un producto con su color (`variante`, opcional): dos colores del mismo
   * producto son dos líneas. Para juntarlas con el catálogo, `armarLineas` de features/cart/lineas.ts.
   */
  items: CartItem[]
  /** Suma al carrito sin borrar lo que ya había. Mismo producto y mismo color: suma a esa línea. */
  addItem: (productId: string, quantity?: number, variante?: CartItem['variante']) => void
  /** Varias líneas de una vez (por ejemplo, un pack de la ficha). */
  addItems: (lineas: CartItem[]) => void
  /** Quita la línea de ese producto con ese color (sin color: la línea sin color). */
  removeItem: (productId: string, variante?: CartItem['variante']) => void
  updateQuantity: (productId: string, quantity: number, variante?: CartItem['variante']) => void
  clearCart: () => void
  /** Unidades en total */
  count: number
  /** Carrito lateral: se abre al agregar y con el ícono del carrito del menú. */
  panelAbierto: boolean
  abrirPanel: () => void
  cerrarPanel: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const CLAVE_GUARDADO = 'rrboxing_cart'

/** Suma `nuevas` a `lineas`: mismo producto y color, una sola línea. */
function sumarLineas(lineas: CartItem[], nuevas: CartItem[]): CartItem[] {
  const resultado = lineas.map((l) => ({ ...l }))
  for (const nueva of nuevas) {
    const quantity = Math.min(MAX_UNIDADES_LINEA, Math.max(1, Math.floor(nueva.quantity) || 1))
    const variante = limpiarVariante(nueva.variante)
    const clave = claveLinea(nueva.productId, variante)
    const existente = resultado.find((l) => claveLinea(l.productId, l.variante) === clave)
    if (existente) existente.quantity = Math.min(MAX_UNIDADES_LINEA, existente.quantity + quantity)
    else resultado.push({ productId: nueva.productId, quantity, ...(variante ? { variante } : {}) })
  }
  return resultado
}

/** Lo guardado en el navegador puede venir de una versión anterior o estar dañado: se limpia al leerlo. */
function leerGuardado(crudo: string | null): CartItem[] {
  if (!crudo) return []
  const datos: unknown = JSON.parse(crudo)
  if (!Array.isArray(datos)) return []
  const validas = datos.flatMap((d): CartItem[] => {
    if (!d || typeof d !== 'object') return []
    const { productId, quantity, variante } = d as Record<string, unknown>
    if (typeof productId !== 'string' || !productId || typeof quantity !== 'number' || quantity < 1) return []
    return [{ productId, quantity, variante: limpiarVariante(variante as CartItem['variante']) }]
  })
  return sumarLineas([], validas)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  /** Evita escribir [] en localStorage antes de leer (eso borraba el carrito en cada carga). */
  const [hydrated, setHydrated] = useState(false)
  const [panelAbierto, setPanelAbierto] = useState(false)

  useEffect(() => {
    try {
      setItems(leerGuardado(localStorage.getItem(CLAVE_GUARDADO)))
    } catch {
      /* ignore corrupt storage */
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(items))
    } catch {
      /* navegador sin localStorage: el carrito dura mientras la página esté abierta */
    }
  }, [items, hydrated])

  const addItems = useCallback((lineas: CartItem[]) => {
    if (lineas.length === 0) return
    setItems((prev) => sumarLineas(prev, lineas))
  }, [])

  const addItem = useCallback(
    (productId: string, quantity = 1, variante?: CartItem['variante']) => {
      addItems([{ productId, quantity, variante }])
    },
    [addItems]
  )

  const removeItem = useCallback((productId: string, variante?: CartItem['variante']) => {
    const clave = claveLinea(productId, limpiarVariante(variante))
    setItems((prev) => prev.filter((item) => claveLinea(item.productId, item.variante) !== clave))
  }, [])

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variante?: CartItem['variante']) => {
      const clave = claveLinea(productId, limpiarVariante(variante))
      if (quantity <= 0) {
        setItems((prev) => prev.filter((item) => claveLinea(item.productId, item.variante) !== clave))
        return
      }
      const q = Math.min(MAX_UNIDADES_LINEA, Math.floor(quantity))
      setItems((prev) =>
        prev.map((item) => (claveLinea(item.productId, item.variante) === clave ? { ...item, quantity: q } : item))
      )
    },
    []
  )

  const clearCart = useCallback(() => setItems([]), [])
  const abrirPanel = useCallback(() => setPanelAbierto(true), [])
  const cerrarPanel = useCallback(() => setPanelAbierto(false), [])

  const count = items.reduce((acc, item) => acc + item.quantity, 0)

  const value = useMemo(
    () => ({
      items,
      addItem,
      addItems,
      removeItem,
      updateQuantity,
      clearCart,
      count,
      panelAbierto,
      abrirPanel,
      cerrarPanel,
    }),
    [items, addItem, addItems, removeItem, updateQuantity, clearCart, count, panelAbierto, abrirPanel, cerrarPanel]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      <CarritoLateral
        abierto={panelAbierto}
        items={items}
        onCerrar={cerrarPanel}
        onCambiarCantidad={updateQuantity}
        onQuitar={removeItem}
      />
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
