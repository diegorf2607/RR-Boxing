import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MainNav from '@/components/MainNav'
import Footer from '@/components/Footer'
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

/** «Guantes · Woesad»: la categoría y, si el producto la trae en sus atributos, la marca. */
const lineaMarca = (product: Product) => {
  const marca = product.attributes?.find((a) => a.label.trim().toLowerCase() === 'marca')?.value.trim()
  return [product.category?.trim(), marca].filter(Boolean).join(' · ')
}

/** Los datos de la ficha técnica (todos menos «Color de las fotos», que es una nota interna para la caja). */
const datosTecnicos = (product: Product) =>
  (product.attributes ?? []).filter((a) => a.label.trim().toLowerCase() !== 'color de las fotos' && a.value.trim())

/** «Cómo son» (guantes, vendas) o «Cómo es» (cuerda): según si el nombre empieza en plural. */
const comoEsDe = (product: Product) => (/s$/i.test(product.name.trim().split(/\s+/)[0] ?? '') ? 'Cómo son' : 'Cómo es')

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
  const marca = lineaMarca(product)
  const tecnicos = datosTecnicos(product)
  const caracteristicas = product.features?.filter((f) => f.trim()) ?? []
  const hayDetalle = Boolean(product.description || product.longDescription || caracteristicas.length || tecnicos.length)
  const participaDelCombo = product.comboEligible !== false

  return (
    <>
      <MainNav />
      <main className="pb-6 lg:pb-[88px]">
        <script
          type="application/ld+json"
          // «<» escapado para que ningún texto del producto pueda cerrar la etiqueta
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosProducto(product)).replace(/</g, '\\u003c') }}
        />
        <div className="contenedor">
          <nav aria-label="Ruta" className="py-1 text-sm text-suave md:py-2.5">
            <ol className="flex flex-wrap items-center gap-x-1.5">
              <li>
                <Link href="/#catalogo" className="inline-flex min-h-[44px] items-center underline underline-offset-[3px] hover:text-tinta">
                  Tienda
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page">{nombre}</li>
            </ol>
          </nav>

          {/* Escritorio: las fotos en grilla a la izquierda y la compra a la derecha, fija al bajar. Celular: fotos que
              se deslizan, y debajo el nombre y la compra. */}
          <div className="lg:grid lg:grid-cols-[7fr_5fr] lg:items-start lg:gap-12">
            <GaleriaProducto imagenes={product.imageUrls} nombre={nombre} />

            <div className="mt-5 lg:sticky lg:top-[92px] lg:mt-0">
              {marca ? <p className="font-medium text-suave">{marca}</p> : null}
              <h1 className="page-title mb-2.5 mt-1.5">{nombre}</h1>
              {resumen ? <p className="text-[17px] text-tinta-2">{resumen}</p> : null}
              <CajaCompra product={publico} candidatos={otros} />
              <ProductTrustBlocks pagoEnLinea={pagoEnLinea} tarifas={textoTarifas(LISTA_ENVIOS)} />
            </div>
          </div>

          {hayDetalle ? (
            <section
              aria-labelledby="como-es"
              className={`mt-14 grid gap-10 border-t border-linea pt-10 lg:mt-[88px] lg:gap-14 ${
                tecnicos.length > 0 ? 'lg:grid-cols-2' : ''
              }`}
            >
              <div className="max-w-2xl">
                <h2 id="como-es" className="titulo-bloque mb-[18px]">
                  {comoEsDe(product)}
                </h2>
                {product.description ? <p className="text-lg leading-relaxed">{product.description}</p> : null}
                {product.longDescription ? (
                  <p className="mt-4 leading-relaxed text-tinta-2">{product.longDescription}</p>
                ) : null}
                {caracteristicas.length > 0 ? (
                  <ul className="lista-amarilla mt-6">
                    {caracteristicas.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {tecnicos.length > 0 ? (
                <dl className="filas self-start">
                  {tecnicos.map((attr) => (
                    <div key={attr.label}>
                      <dt>{attr.label}</dt>
                      <dd>{attr.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </section>
          ) : null}

          <PreguntasProducto nombre={nombre} participaDelCombo={participaDelCombo} pagoEnLinea={pagoEnLinea}>
            <p className="mt-5">
              <Link href="/consulta" className="enlace inline-flex min-h-[44px] items-center">
                Quiero clases personalizadas
              </Link>
            </p>
          </PreguntasProducto>

          {related.length > 0 ? (
            <section aria-labelledby="completa-tu-equipo" className="mt-14 lg:mt-[88px]">
              <div className="mb-5 flex flex-col gap-1.5 md:mb-7 md:flex-row md:items-end md:justify-between md:gap-6">
                <h2 id="completa-tu-equipo" className="section-title">
                  Completa tu equipo
                </h2>
                {participaDelCombo ? (
                  <p className="text-suave md:max-w-[420px] md:text-right">Con otro producto en tu pedido ya tienes el 10%.</p>
                ) : null}
              </div>
              <ul className="grid grid-cols-2 gap-x-1 gap-y-[22px] lg:grid-cols-4 lg:gap-x-2 lg:gap-y-7">
                {related.map((item) => {
                  const detalle = resumenDe(item)
                  return (
                    <li key={item.id}>
                      <Link href={`/product/${item.slug}`} className="group block">
                        <span className="relative block aspect-square bg-gris">
                          <span className="absolute inset-x-[5%] inset-y-[7%]">
                            <Image
                              src={item.imageUrls[0]}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 25vw, 50vw"
                              className="object-contain mix-blend-multiply"
                            />
                          </span>
                        </span>
                        <span className="grid gap-x-4 gap-y-1 px-0.5 pt-2.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline md:pt-3.5">
                          <span className="text-base font-semibold leading-snug group-hover:underline group-hover:underline-offset-[3px] md:text-lg">
                            {item.name.trim()}
                          </span>
                          <span className="md:row-span-2 md:text-right">
                            <ProductPrice product={item} size="sm" />
                          </span>
                          {detalle ? <span className="text-sm text-suave md:text-[15px]">{detalle}</span> : null}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}
        </div>
        {/* Al llegar aquí, la barra de compra del celular se esconde y no tapa el pie */}
        <div id={ID_FIN_FICHA} aria-hidden className="h-14 lg:hidden" />
      </main>
      <Footer />
    </>
  )
}
