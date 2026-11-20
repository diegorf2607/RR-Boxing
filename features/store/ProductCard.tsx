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
      <Link href={`/product/${product.slug}`} className="relative mb-4 block aspect-square overflow-hidden rounded-xl">
        <Image
          src={product.imageUrls[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </Link>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-block rounded-full bg-dark-300 px-2 py-1 text-xs text-neutral-light">
          {product.category}
        </span>
        {product.comboEligible !== false ? (
          <span className="inline-block rounded-full border border-accent/50 bg-dark px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            Disponible para combo
          </span>
        ) : null}
      </div>
      <h3 className="mb-2 text-lg font-bold">
        <Link href={`/product/${product.slug}`} className="hover:text-accent">
          {product.name}
        </Link>
      </h3>
      <p className="mb-4 text-sm text-neutral-light">{product.description}</p>
      <div className="mt-auto">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xl font-bold text-accent">{formatCurrency(price.amount, price.currency, locale)}</p>
          {status.kind !== 'disponible' ? <p className="text-sm text-neutral">{status.label}</p> : null}
        </div>
        <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
          {eligeColor ? (
            <Link
              href={`/product/${product.slug}`}
              className="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-bold text-dark transition-colors hover:bg-accent-dark"
            >
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
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-dark transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {out ? 'Agotado' : 'Agregar'}
            </button>
          )}
          <a
            href={out ? enlaceConsultaAgotado(product) : enlacePedidoProducto(product, country, 1)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-accent px-2 py-2.5 text-center text-sm font-bold text-accent transition-colors hover:bg-accent/10"
          >
            {out ? 'Preguntar por WhatsApp' : 'Pedir por WhatsApp'}
          </a>
        </div>
      </div>
    </article>
  )
}
