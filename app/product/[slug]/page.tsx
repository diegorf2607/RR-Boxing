import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MainNav from '@/components/MainNav'
import { getProductBySlug, getProducts } from '@/shared/lib/data-store'
import AddToCartButton from '@/features/store/AddToCartButton'
import ProductPrice from '@/features/store/ProductPrice'
import ProductTrustBlocks from '@/features/store/ProductTrustBlocks'
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
  const related = (await getProducts())
    .filter((item) => item.id !== product.id && item.active)
    .slice(0, 3)
    .map(productoPublico)

  return (
    <main className="min-h-screen bg-dark">
      <script
        type="application/ld+json"
        // «<» escapado para que ningún texto del producto pueda cerrar la etiqueta
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosProducto(product)).replace(/</g, '\\u003c') }}
      />
      <MainNav />
      <section className="container mx-auto grid gap-6 px-4 py-6 md:grid-cols-2 md:gap-8 md:py-10">
        <div className="space-y-3 md:space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-dark-300 bg-white md:aspect-square">
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain md:object-cover"
            />
          </div>
          {product.imageUrls.length > 1 ? (
            <div className="hidden md:grid md:grid-cols-3 md:gap-3">
              {product.imageUrls.slice(0, 3).map((url) => (
                <div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-dark-300">
                  <Image src={url} alt={product.name} fill sizes="(min-width: 768px) 16vw, 20vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">{product.name}</h1>
          <ProductPrice product={publico} />
          <p className="mt-4 text-neutral-light">{product.description}</p>

          <div className="mt-6">
            <AddToCartButton product={publico} />
          </div>

          {product.comboEligible !== false ? (
            <p className="mt-4 text-sm text-neutral-light">
              Con 2 o más unidades en tu pedido, <span className="text-white">10% de descuento</span> en productos.{' '}
              <a href="/#combos" className="text-accent underline underline-offset-2 hover:text-white">
                Ver combos sugeridos
              </a>
            </p>
          ) : null}

          {product.attributes && product.attributes.length > 0 ? (
            <dl className="mt-8 grid gap-2 text-sm sm:grid-cols-2">
              {product.attributes.map((attr) => (
                <div key={attr.label} className="rounded-lg border border-dark-300 bg-dark-100/80 px-3 py-2">
                  <dt className="text-xs text-neutral">{attr.label}</dt>
                  <dd className="mt-0.5 font-medium text-white">{attr.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {product.longDescription ? (
            <p className="mt-6 text-sm leading-relaxed text-neutral-light">{product.longDescription}</p>
          ) : null}
          {product.features && product.features.length > 0 ? (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold text-white">Características</h2>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-neutral-light">
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <ProductTrustBlocks product={publico} />
          <Link href="/consulta" className="mt-4 inline-block text-accent underline">
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
    </main>
  )
}
