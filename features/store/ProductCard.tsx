'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/shared/types/commerce'
import { useCountry } from '@/features/country/CountryProvider'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'
import { getStockStatus } from '@/features/store/stockUrgency'
import { coloresDisponibles } from '@/features/store/colores'
import { datosDeFoto } from '@/shared/config/fotos-producto'

/** Ancho de la foto: 2 columnas en el celular y 3 desde 768 px, dentro de 1320 px. */
export const TAMANO_FOTO_TARJETA = '(min-width: 1320px) 430px, (min-width: 768px) 33vw, 50vw'

const valorDe = (product: Product, etiqueta: string) =>
  product.attributes?.find((a) => a.label.trim().toLowerCase() === etiqueta)?.value.trim() || ''

/**
 * La línea corta debajo del nombre, armada con los datos del panel: material, medida y colores
 * («Cuero PU · 12 oz · negro o blanco»). Si el producto no tiene esos datos, va su descripción.
 */
export function resumenProducto(product: Product): string {
  const colores = coloresDisponibles(product).map((c) => c.toLocaleLowerCase('es-PE'))
  const partes = [
    valorDe(product, 'material'),
    valorDe(product, 'medida'),
    colores.length > 1 ? `${colores.slice(0, -1).join(', ')} o ${colores[colores.length - 1]}` : '',
  ].filter(Boolean)
  return partes.length > 0 ? partes.join(' · ') : product.description.trim()
}

/**
 * La tarjeta del catálogo, como en la maqueta: toda la tarjeta lleva a la ficha (ahí se elige el color, el combo y
 * la cantidad, y se agrega al carrito). La foto «producto» va entera sobre el gris (multiply funde su fondo blanco);
 * una foto «ambiente» llena el cuadro.
 */
export default function ProductCard({ product }: { product: Product }) {
  const { country } = useCountry()
  const price = getPriceForCountry(product, country)
  const locale = getCountryConfig(country).locale
  const status = getStockStatus(product.stock)
  const foto = product.imageUrls[0]
  const ambiente = foto ? datosDeFoto(foto)?.tipo === 'ambiente' : false

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-gris">
        {foto ? (
          <div className={ambiente ? 'absolute inset-0' : 'absolute inset-x-[5%] inset-y-[7%]'}>
            <Image
              src={foto}
              alt=""
              fill
              sizes={TAMANO_FOTO_TARJETA}
              className={ambiente ? 'object-cover' : 'object-contain mix-blend-multiply'}
            />
          </div>
        ) : null}
        {status.kind === 'agotado' ? (
          <span className="absolute left-0 top-0 bg-tinta px-2 py-1 text-xs font-bold text-white md:px-2.5 md:py-1.5 md:text-sm">
            {status.label}
          </span>
        ) : null}
      </div>
      <div className="grid gap-x-4 gap-y-0.5 px-0.5 pt-2.5 md:grid-cols-[1fr_auto] md:items-baseline md:pt-3.5">
        <h3 className="text-base font-semibold leading-snug decoration-1 underline-offset-[3px] group-hover:underline md:text-lg">
          {product.name.trim()}
        </h3>
        <p className="num mt-1 text-[26px] leading-none md:row-span-2 md:mt-0 md:text-right md:text-[30px]">
          {formatCurrency(price.amount, price.currency, locale)}
        </p>
        <p className="line-clamp-2 text-sm text-suave md:text-[15px]">{resumenProducto(product)}</p>
        {status.kind === 'pocas' ? <p className="text-sm font-semibold text-tinta-2">{status.label}</p> : null}
      </div>
    </Link>
  )
}
