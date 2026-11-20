'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/shared/types/commerce'
import { useCountry } from '@/features/country/CountryProvider'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { getPriceForCountry } from '@/features/store/pricing'
import { getStockStatus } from '@/features/store/stockUrgency'

/**
 * Productos cuya foto es chica (la de la cuerda mide 185 px): llevan más margen dentro del recuadro gris para que no
 * se estiren ni se vean borrosas, como «tile--chica» en la maqueta. Si se cambia por una foto grande, se saca de aquí.
 */
const FOTO_CHICA = new Set(['cuerda-salto-boxeo'])

/**
 * La tarjeta de producto de la línea A. Toda la tarjeta lleva a la ficha (el enlace es el nombre y se estira sobre la
 * tarjeta: una sola parada de Tab y el lector dice solo el nombre); el color, el pack y «Agregar al carrito» se eligen
 * en la ficha. Desde 900 px es una tarjeta con la foto arriba; en el celular es una fila (foto de 96 px a la izquierda)
 * dentro de la caja del catálogo (features/store/StoreClient.tsx), y el foco se dibuja por dentro para que esa caja
 * no lo corte.
 */
export default function ProductCard({ product }: { product: Product }) {
  const { country } = useCountry()
  const price = getPriceForCountry(product, country)
  const locale = getCountryConfig(country).locale
  const status = getStockStatus(product.stock)
  const nombre = product.name.trim()
  const foto = product.imageUrls[0]

  return (
    <article
      className={[
        'relative flex items-center gap-3.5 border-t border-dark-300 p-3.5 first:border-t-0',
        'has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-accent',
        'min-[900px]:flex-col min-[900px]:items-stretch min-[900px]:gap-0 min-[900px]:overflow-hidden min-[900px]:rounded-2xl min-[900px]:border min-[900px]:bg-dark-100 min-[900px]:p-0 min-[900px]:transition-colors min-[900px]:first:border-t min-[900px]:hover:border-dark-400 min-[900px]:has-[a:focus-visible]:outline-offset-[3px] motion-reduce:transition-none',
      ].join(' ')}
    >
      <div className="tile aspect-square w-24 flex-none rounded-xl min-[900px]:aspect-[4/3] min-[900px]:w-full min-[900px]:rounded-none">
        {foto ? (
          <Image
            src={foto}
            alt=""
            fill
            sizes="(min-width: 900px) 400px, 96px"
            className={`object-contain ${FOTO_CHICA.has(product.slug) ? 'p-[22%]' : 'p-[9%]'}`}
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[3px] min-[900px]:gap-1.5 min-[900px]:px-5 min-[900px]:pb-5 min-[900px]:pt-[18px]">
        {/* h3: va debajo del h2 «Tienda RR Boxing» (el h1 es el de la portada) */}
        <h3 className="text-[16.5px] font-[650] leading-tight min-[900px]:text-[19px]">
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {nombre}
          </Link>
        </h3>
        <p className="text-[13.5px] leading-[1.45] text-neutral-light min-[900px]:text-[14.5px]">{product.description}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-1.5 min-[900px]:pt-3">
          <div>
            <p className="precio text-[17px] min-[900px]:text-[21px]">
              {formatCurrency(price.amount, price.currency, locale)}
            </p>
            {status.kind !== 'disponible' ? <p className="text-[13px] text-neutral">{status.label}</p> : null}
          </div>
          {/* Solo se ve: el enlace de la tarjeta es el nombre */}
          <span aria-hidden className="link text-[14.5px] text-neutral-light">
            Ver producto
          </span>
        </div>
      </div>
    </article>
  )
}
