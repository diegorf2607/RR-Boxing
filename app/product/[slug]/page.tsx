import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check } from 'lucide-react'
import MainNav from '@/components/MainNav'
import { getProductBySlug, getProducts } from '@/shared/lib/data-store'
import CajaCompra from '@/features/store/CajaCompra'
import GaleriaProducto from '@/features/store/GaleriaProducto'
import PreguntasProducto from '@/features/store/PreguntasProducto'
import ProductPrice from '@/features/store/ProductPrice'
import ProductTrustBlocks from '@/features/store/ProductTrustBlocks'
import { ID_FIN_FICHA } from '@/features/store/packs'
import { productoPublico } from '@/shared/lib/producto-publico'
import { pagoEnLineaActivo } from '@/shared/config/pagos'
import { textoTarifas } from '@/shared/config/envios'
import { LISTA_ENVIOS } from '@/shared/lib/cart-checkout'
import type { Product } from '@/shared/types/commerce'

const SITIO = 'https://www.rrboxing.com'

// La metadata y la página piden el mismo producto: con cache() se consulta una sola vez por visita.
const productoPorSlug = cache((slug: string) => getProductBySlug(slug))

/** Precio en Perú (PEN), el que se cobra en la tienda. */
const precioPeru = (product: Product) => product.prices.find((p) => p.country === 'PE' && p.currency === 'PEN')

const soles = (monto: number) => `S/ ${monto.toFixed(2)}`

/** Lo que no va en el resumen bajo el nombre: los colores se eligen abajo, y la marca y la foto no lo describen. */
const FUERA_DEL_RESUMEN = ['colores disponibles', 'marca', 'color de las fotos']

/** «Cuero PU · 12 oz», «4.5 metros»: la medida y el material junto al nombre, que es lo primero que se pregunta. */
const resumenDe = (product: Product) =>
  (product.attributes ?? [])
    .filter((a) => !FUERA_DEL_RESUMEN.includes(a.label.trim().toLowerCase()) && a.value.trim())
    .map((a) => a.value.trim())
    .join(' · ')

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
  // Si hay pago en línea (MERCADOPAGO_ACCESS_TOKEN) lo sabe solo el servidor: va como prop a las filas y preguntas
  const pagoEnLinea = pagoEnLineaActivo()
  const nombre = product.name.trim()
  const resumen = resumenDe(product)
  // «Guantes · Woesad»: la categoría y la marca del producto, encima del nombre (como en la maqueta)
  const marca = product.attributes?.find((a) => a.label.trim().toLowerCase() === 'marca')?.value.trim()
  const antetitulo = [product.category?.trim(), marca].filter(Boolean).join(' · ')
  const atributos = (product.attributes ?? []).filter((a) => a.label.trim() && a.value.trim())
  const caracteristicas = (product.features ?? []).filter((f) => f.trim())
  const hayDetalle = atributos.length > 0 || caracteristicas.length > 0 || Boolean(product.longDescription)

  return (
    <main className="min-h-screen bg-dark">
      <script
        type="application/ld+json"
        // «<» escapado para que ningún texto del producto pueda cerrar la etiqueta
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosProducto(product)).replace(/</g, '\\u003c') }}
      />
      <MainNav />

      {/* Línea A (maqueta opcion-a.html, ficha): fotos a la izquierda (quietas al bajar) y la caja de compra a la
          derecha desde 900 px; en el celular, fotos de borde a borde, nombre, compra y las filas de envío y garantía. */}
      <div className="wrap">
        {/* Las migas: el enlace mide 44 px de alto para el dedo, por eso el margen de arriba es menor que en la maqueta */}
        <nav aria-label="Estás en" className="pt-[9px] text-sm text-neutral">
          <Link href="/" className="inline-flex min-h-[44px] items-center text-neutral-light hover:text-white">
            Tienda
          </Link>{' '}
          / <span aria-current="page">{nombre}</span>
        </nav>

        <div className="grid items-start gap-6 pb-14 pt-px min-[900px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] min-[900px]:gap-14 min-[900px]:pb-16 min-[900px]:pt-[9px]">
          <div className="min-w-0 min-[900px]:sticky min-[900px]:top-[88px]">
            <GaleriaProducto imagenes={product.imageUrls} nombre={nombre} />
          </div>

          <div className="flex min-w-0 flex-col gap-[22px]">
            <div>
              {antetitulo ? <p className="text-sm text-neutral">{antetitulo}</p> : null}
              <h1 className="page-title mt-1.5">{nombre}</h1>
              {resumen ? <p className="mt-2 text-neutral-light">{resumen}</p> : null}
            </div>
            <CajaCompra product={publico} candidatos={otros} />
            <ProductTrustBlocks pagoEnLinea={pagoEnLinea} tarifas={textoTarifas(LISTA_ENVIOS)} />
          </div>
        </div>
      </div>

      {hayDetalle ? (
        <section className="seccion" aria-label={`Detalle de ${nombre}`}>
          <div className="wrap grid items-start gap-5 min-[900px]:grid-cols-2">
            {caracteristicas.length > 0 || product.longDescription ? (
              <div className="min-w-0">
                <h2 className="card-title mb-4">Características</h2>
                {product.longDescription ? (
                  <p className="mb-5 max-w-[40em] text-neutral-light">{product.longDescription}</p>
                ) : null}
                {caracteristicas.length > 0 ? (
                  <ul className="lista-lineas">
                    {caracteristicas.map((f) => (
                      <li key={f}>
                        <Check strokeWidth={1.8} aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
            {atributos.length > 0 ? (
              <div className="min-w-0">
                <h2 className="card-title mb-4">Ficha técnica</h2>
                <dl className="filas">
                  {atributos.map((attr) => (
                    <div key={attr.label}>
                      <dt>{attr.label}</dt>
                      <dd>{attr.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="seccion" aria-labelledby="productos-relacionados">
          <div className="wrap">
            <div className="seccion-cab">
              <h2 id="productos-relacionados" className="section-title">
                Productos relacionados
              </h2>
            </div>
            <div className="grid gap-5 min-[900px]:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="flex items-center gap-[18px] rounded-2xl border border-dark-300 bg-dark-100 p-3.5 transition-colors hover:border-dark-400 motion-reduce:transition-none"
                >
                  <span className="tile relative aspect-square w-[112px] shrink-0 rounded-xl sm:w-[132px]">
                    {item.imageUrls[0] ? (
                      <Image src={item.imageUrls[0]} alt="" fill sizes="132px" className="object-contain p-[9%]" />
                    ) : null}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="text-[16.5px] font-semibold leading-tight text-white min-[900px]:text-[19px]">
                      {item.name.trim()}
                    </h3>
                    <p className="line-clamp-3 text-[13.5px] leading-snug text-neutral-light min-[900px]:text-[14.5px]">
                      {item.description}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <ProductPrice product={item} size="sm" />
                      <span aria-hidden className="link text-[14.5px] text-neutral-light">
                        Ver producto
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="seccion" aria-labelledby="preguntas-producto">
        <div className="wrap">
          <PreguntasProducto
            nombre={product.name}
            participaDelCombo={product.comboEligible !== false}
            pagoEnLinea={pagoEnLinea}
          />
          {/* El paso a las clases (antes, el enlace «Quiero clases personalizadas»), en una caja como la de la maqueta.
              Los textos son los de la sección de clases del inicio. */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-2xl border border-dark-300 bg-dark-100 p-5 sm:p-6">
            <div className="min-w-0">
              <h2 className="font-heading text-[28px] leading-[0.95] text-white">Clases personalizadas 1 a 1</h2>
              <p className="mt-1.5 text-neutral-light">Entrena a tu ritmo, con un plan para lo que buscas.</p>
            </div>
            <Link href="/consulta" className="btn-secondary sm:inline-flex sm:w-auto">
              Quiero clases personalizadas
            </Link>
          </div>
        </div>
      </section>

      {/* Espacio para la barra de compra del celular: al llegar aquí se esconde y no tapa el pie */}
      <div id={ID_FIN_FICHA} aria-hidden className="h-[72px] min-[900px]:hidden" />
    </main>
  )
}
