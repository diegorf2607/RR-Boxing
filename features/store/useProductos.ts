'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/shared/types/commerce'

export type EstadoProductos = 'cargando' | 'listo' | 'error'

/**
 * Una sola petición a /api/products para todo el inicio: el catálogo, los combos y «Así se ven puestos» la piden a la
 * vez al cargar y comparten la misma respuesta. Cuando termina se olvida, así que la próxima visita al inicio vuelve
 * a pedir los precios al día.
 */
let enCurso: Promise<Product[]> | null = null

function pedirProductos(): Promise<Product[]> {
  if (!enCurso) {
    enCurso = fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((data) => (data.products ?? []) as Product[])
      .finally(() => {
        enCurso = null
      })
  }
  return enCurso
}

export function useProductos(): { productos: Product[]; estado: EstadoProductos } {
  const [productos, setProductos] = useState<Product[]>([])
  const [estado, setEstado] = useState<EstadoProductos>('cargando')

  useEffect(() => {
    let vivo = true
    pedirProductos()
      .then((lista) => {
        if (!vivo) return
        setProductos(lista)
        setEstado('listo')
      })
      .catch(() => {
        if (vivo) setEstado('error')
      })
    return () => {
      vivo = false
    }
  }, [])

  return { productos, estado }
}
