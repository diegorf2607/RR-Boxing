import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MainNav from '@/components/MainNav'
import { getProductBySlug, getProducts } from '@/shared/lib/data-store'
import AddToCartButton from '@/features/store/AddToCartButton'
import ProductPrice from '@/features/store/ProductPrice'
import ProductTrustBlocks from '@/features/store/ProductTrustBlocks'

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const related = (await getProducts())
    .filter((item) => item.id !== product.id && item.active)
    .slice(0, 3)

  return (
    <main className="min-h-screen bg-dark">
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
          <ProductPrice product={product} />
          <p className="mt-4 text-neutral-light">{product.description}</p>

          <div className="mt-6">
            <AddToCartButton product={product} />
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
          <ProductTrustBlocks product={product} />
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
