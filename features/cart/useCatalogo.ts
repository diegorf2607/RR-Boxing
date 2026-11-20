'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/shared/types/commerce'

// El catálogo público (/api/products) se pide una sola vez por visita y lo comparten el carrito lateral y /cart.
let pedido: Promise<Product[]> | null = null
let guardado: Product[] | null = null

function pedirCatalogo(): Promise<Product[]> {
  if (!pedido) {
    pedido = fetch('/api/products')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { products?: Product[] }) => {
        guardado = Array.isArray(data.products) ? data.products : []
        return guardado
      })
      .catch((error) => {
        // Si falla, la próxima vez se vuelve a intentar
        pedido = null
        throw error
      })
  }
  return pedido
}

/** Pide el catálogo antes de que haga falta (por ejemplo, en la ficha, antes de abrir el carrito lateral). */
export function precargarCatalogo(): void {
  if (guardado === null) pedirCatalogo().catch(() => {})
}

/**
 * Los productos del catálogo. `activo` en false no pide nada (por ejemplo, con el carrito lateral cerrado).
 * `cargado` es true cuando terminó, salió bien o mal.
 */
export function useCatalogo(activo = true): { productos: Product[]; cargado: boolean } {
  const [productos, setProductos] = useState<Product[]>(() => guardado ?? [])
  const [cargado, setCargado] = useState(() => guardado !== null)

  useEffect(() => {
    if (!activo || guardado !== null) {
      if (guardado !== null) {
        setProductos(guardado)
        setCargado(true)
      }
      return
    }
    let vigente = true
    pedirCatalogo()
      .then((lista) => {
        if (vigente) setProductos(lista)
      })
      .catch(() => {
        /* sin catálogo: el carrito muestra que no pudo cargar */
      })
      .finally(() => {
        if (vigente) setCargado(true)
      })
    return () => {
      vigente = false
    }
  }, [activo])

  return { productos, cargado }
}
