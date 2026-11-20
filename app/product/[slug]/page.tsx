import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MainNav from '@/components/MainNav'
import { getProductBySlug, getProducts } from '@/shared/lib/data-store'
import CajaCompra from '@/features/store/CajaCompra'
import GaleriaProducto from '@/features/store/GaleriaProducto'
import PreguntasProducto from '@/features/store/PreguntasProducto'
import ProductPrice from '@/features/store/ProductPrice'
import ProductTrustBlocks from '@/features/store/ProductTrustBlocks'
import { ID_FIN_FICHA } from '@/features/store/packs'
import { productoPublico } from '@/shared/lib/producto-publico'
import type { Product } from '@/shared/types/commerce'

const SITIO = 'https://www.rrboxing.com'

// La metadata y la página piden el mismo producto: con cache() se consulta una sola vez por visita.
const productoPorSlug = cache((slug: string) => getProductBySlug(slug))

/** Precio en Perú (PEN), el que se cobra en la tienda. */
const precioPeru = (product: Product) => product.prices.find((p) => p.country === 'PE' && p.currency === 'PEN')

const soles = (monto: number) => `S/ ${monto.toFixed(2)}`

/** Ruta relativa → dirección completa (los buscadores y WhatsApp la necesitan entera). */
const absoluta = (url: string) => (/^https?:\/\//.test(url) ? url : `${SITIO}${url.startsWith('/') ? '' : '/'}${url}`)

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await productoPorSlug(params.slug)
  if (!product) return { title: 'Producto no encontrado' }

  const nombre = product.name.trim()
  const precio = precioPeru(product)
  const titulo = precio ? `${nombre} · ${soles(precio.amount)}` : nombre
  const ruta = `/product/${product.slug}`
  const imagen = product.imageUrls[0]

  return {
    title: titulo,
    description: product.description,
    alternates: { canonical: ruta },
    openGraph: {
      title: titulo,
      description: product.description,
      type: 'website',
      url: ruta,
      locale: 'es_PE',
      siteName: 'RR Boxing',
      ...(imagen ? { images: [{ url: imagen, alt: nombre }] } : {}),
    },
    // Si no, X/Twitter mostraría la imagen general de la tienda en vez de la del producto.
    twitter: {
      card: 'summary',
      ...(imagen ? { images: [{ url: imagen, alt: nombre }] } : {}),
    },
  }
}

/**
 * Datos estructurados para Google (schema.org/Product): precio en soles y disponibilidad según el stock.
 * La marca va solo si el producto la trae en sus atributos (la misma que se ve en la ficha). Sin calificaciones:
 * todavía no hay reseñas reales.
 */
function datosProducto(product: Product) {
  const precio = precioPeru(product)
  const marca = product.attributes?.find((a) => a.label.trim().toLowerCase() === 'marca')?.value.trim()
  const url = absoluta(`/product/${product.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name.trim(),
    description: product.longDescription || product.description,
    url,
    image: product.imageUrls.map(absoluta),
    category: product.category,
    ...(product.sku ? { sku: product.sku } : {}),
    ...(marca ? { brand: { '@type': 'Brand', name: marca } } : {}),
    ...(precio
      ? {
          offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'PEN',
            price: precio.amount.toFixed(2),
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: 'RR Boxing' },
          },
        }
      : {}),
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await productoPorSlug(params.slug)
  if (!product) notFound()

  // Lo que va a componentes del navegador queda escrito en el HTML: sin valoraciones ni notas internas
  const publico = productoPublico(product)
  const otros = (await getProducts()).filter((item) => item.id !== product.id && item.active).map(productoPublico)
  const related = otros.slice(0, 3)

  return (
    <main className="min-h-screen bg-dark">
      <script
        type="application/ld+json"
        // «<» escapado para que ningún texto del producto pueda cerrar la etiqueta
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosProducto(product)).replace(/</g, '\\u003c') }}
      />
      <MainNav />
      {/* Escritorio: fotos y detalle a la izquierda, compra a la derecha. Celular: fotos, nombre, compra y detalle. */}
      <section className="container mx-auto grid items-start gap-6 px-4 py-6 md:grid-cols-2 md:grid-rows-[auto_1fr] md:gap-x-10 md:gap-y-8 md:py-10">
        <div className="md:col-start-1 md:row-start-1">
          <GaleriaProducto imagenes={product.imageUrls} nombre={product.name.trim()} />
        </div>

        <div className="md:col-start-2 md:row-span-2 md:row-start-1">
          <h1 className="mb-1 text-3xl font-bold leading-tight md:text-4xl">{product.name}</h1>
          <CajaCompra product={publico} candidatos={otros} />
          <ProductTrustBlocks />
          <PreguntasProducto nombre={product.name} participaDelCombo={product.comboEligible !== false} />
        </div>

        <div className="space-y-6 md:col-start-1 md:row-start-2">
          {product.attributes && product.attributes.length > 0 ? (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {product.attributes.map((attr) => (
                <div key={attr.label} className="rounded-lg border border-dark-300 bg-dark-100/80 px-3 py-2">
                  <dt className="text-xs text-neutral">{attr.label}</dt>
                  <dd className="mt-0.5 font-medium text-white">{attr.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {product.longDescription ? (
            <p className="text-sm leading-relaxed text-neutral-light">{product.longDescription}</p>
          ) : null}
          {product.features && product.features.length > 0 ? (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-white">Características</h2>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-neutral-light">
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link href="/consulta" className="inline-block text-accent underline">
            Quiero clases personalizadas
          </Link>
        </div>
      </section>
      {related.length > 0 ? (
        <section className="container mx-auto px-4 pb-16">
          <h2 className="mb-4 text-2xl font-bold">Productos relacionados</h2>
          <div className="grid gap-3 md:grid-cols-3 md:gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-dark-300 bg-dark-100 p-3 transition-colors hover:border-accent/60"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-dark-300">
                  <Image src={item.imageUrls[0]} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white">{item.name}</p>
                  <ProductPrice product={item} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {/* Espacio para la barra de compra del celular: al llegar aquí se esconde y no tapa el pie */}
      <div id={ID_FIN_FICHA} aria-hidden className="h-14 md:hidden" />
    </main>
  )
}
