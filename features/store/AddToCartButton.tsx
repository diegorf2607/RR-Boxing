'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Product } from '@/shared/types/commerce'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import { getStockStatus } from '@/features/store/stockUrgency'
import { enlaceConsultaAgotado, enlacePedidoProducto } from '@/features/store/pedidoWhatsappProducto'

/**
 * Compra desde la ficha: «Agregar al carrito» suma al carrito sin borrar lo que había y
 * «Pedir por WhatsApp» abre el chat con este producto y la cantidad ya escritos.
 * La ficha no lleva a /checkout: hoy la tienda no puede cobrar en línea.
 */
export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { country } = useCountry()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const status = getStockStatus(product.stock)
  const out = status.kind === 'agotado'
  const maxQty = product.stock > 0 ? product.stock : 1

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 4000)
    return () => clearTimeout(t)
  }, [added])

  const whatsappHref = out ? enlaceConsultaAgotado(product) : enlacePedidoProducto(product, country, qty)

  return (
    <div className="max-w-md">
      <p className={`text-sm ${out ? 'text-neutral' : 'text-neutral-light'}`}>{status.label}</p>

      <div className="mt-3 flex gap-3">
        <label className="sr-only" htmlFor={`qty-${product.id}`}>
          Cantidad
        </label>
        <input
          id={`qty-${product.id}`}
          type="number"
          inputMode="numeric"
          min={1}
          max={maxQty}
          value={qty}
          onChange={(e) => setQty(Math.min(maxQty, Math.max(1, Math.floor(Number(e.target.value)) || 1)))}
          disabled={out}
          className="w-20 rounded-lg border border-dark-300 bg-dark-100 px-3 py-3 text-white disabled:opacity-40"
        />
        <button
          type="button"
          disabled={out}
          onClick={() => {
            addItem(product.id, qty)
            setAdded(true)
          }}
          className="flex-1 rounded-lg bg-accent px-6 py-3 font-bold text-dark transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {out ? 'Agotado' : 'Agregar al carrito'}
        </button>
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block rounded-lg border border-accent px-6 py-3 text-center font-bold text-accent transition-colors hover:bg-accent/10"
      >
        {out ? 'Preguntar por WhatsApp' : 'Pedir por WhatsApp'}
      </a>

      <div role="status" aria-live="polite">
        {added ? (
          <p className="mt-3 text-sm text-neutral-light">
            Listo, está en tu carrito.{' '}
            <Link href="/cart" className="text-accent underline underline-offset-2 hover:text-white">
              Ver carrito
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  )
}
