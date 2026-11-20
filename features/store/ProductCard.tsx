'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/shared/types/commerce'
import { useCountry } from '@/features/country/CountryProvider'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'
import { useCart } from '@/features/cart/CartProvider'
import { getStockStatus } from '@/features/store/stockUrgency'
import { enlaceConsultaAgotado, enlacePedidoProducto } from '@/features/store/pedidoWhatsappProducto'
import { coloresDisponibles } from '@/features/store/colores'

export default function ProductCard({ product }: { product: Product }) {
  const { country } = useCountry()
  const { addItem, abrirPanel } = useCart()
  const price = getPriceForCountry(product, country)
  const locale = getCountryConfig(country).locale
  const status = getStockStatus(product.stock)
  const out = status.kind === 'agotado'
  // Si viene en varios colores, el color se elige en la ficha antes de agregar
  const eligeColor = !out && coloresDisponibles(product).length > 0

  return (
    <article className="card flex h-full flex-col">
      {/* La foto lleva a la ficha para el dedo y el mouse; para el teclado y el lector basta el enlace del título */}
      <Link
        href={`/product/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative mb-4 block aspect-square overflow-hidden rounded-xl bg-white"
      >
        {/* Entera (contain) sobre blanco: las fotos del producto ya tienen fondo blanco y así no se cortan */}
        <Image
          src={product.imageUrls[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain"
        />
      </Link>
      <p className="mb-1 text-sm text-neutral">{product.category}</p>
      {/* h2: va justo debajo del h1 «Tienda RR Boxing» */}
      <h2 className="mb-2 text-lg font-bold">
        <Link href={`/product/${product.slug}`} className="hover:text-accent">
          {product.name}
        </Link>
      </h2>
      <p className="mb-4 text-sm text-neutral-light">{product.description}</p>
      <div className="mt-auto">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xl font-bold text-accent">{formatCurrency(price.amount, price.currency, locale)}</p>
          {status.kind !== 'disponible' ? <p className="text-sm text-neutral">{status.label}</p> : null}
        </div>
        {/* Una acción principal a todo el ancho; el pedido directo por WhatsApp queda como enlace de texto */}
        <div className="mt-3 grid gap-1">
          {eligeColor ? (
            <Link href={`/product/${product.slug}`} className="btn-primary">
              Elegir color
            </Link>
          ) : (
            <button
              type="button"
              disabled={out}
              onClick={() => {
                addItem(product.id)
                abrirPanel()
              }}
              className="btn-primary"
            >
              {out ? 'Agotado' : 'Agregar al carrito'}
            </button>
          )}
          <a
            href={out ? enlaceConsultaAgotado(product) : enlacePedidoProducto(product, country, 1)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-center text-center text-sm text-neutral-light underline underline-offset-2 hover:text-accent"
          >
            {out ? 'Preguntar por WhatsApp cuándo vuelve' : 'o pídelo directo por WhatsApp'}
          </a>
        </div>
      </div>
    </article>
  )
}
