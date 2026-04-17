import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MainNav from '@/components/MainNav'
import { getProductBySlug, getProducts } from '@/shared/lib/data-store'
import AddToCartButton from '@/features/store/AddToCartButton'
import ProductTrustBlocks from '@/features/store/ProductTrustBlocks'
import { getProductStockUrgency } from '@/features/store/stockUrgency'

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()
  const stockUrgency = getProductStockUrgency(product.stock)

  const related = (await getProducts())
    .filter((item) => item.id !== product.id && item.category === product.category && item.active)
    .slice(0, 3)

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-dark-300">
            <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover" />
            {stockUrgency ? (
              <span
                className={`absolute left-3 top-3 z-10 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wide sm:text-sm ${stockUrgency.pillClass} ${stockUrgency.level === 'critical' && product.stock > 0 && product.stock <= 3 ? 'animate-pulse' : ''}`}
              >
                {stockUrgency.label}
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {product.imageUrls.slice(0, 3).map((url) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-dark-300">
                <Image src={url} alt={product.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="rounded-full bg-dark-300 px-2 py-1 text-xs text-neutral-light">{product.category}</span>
          <h1 className="mt-3 text-4xl font-bold">{product.name}</h1>
          <p className="mt-4 text-neutral-light">{product.description}</p>
          <p className="mt-4 text-sm text-neutral-light">
            {product.stock > 0 ? (
              <>
                <span className="font-semibold text-white">{product.stock}</span> unidades disponibles
                {stockUrgency?.ctaUrgent ? (
                  <span className="mt-2 block text-xs font-bold uppercase tracking-wide text-red-400">
                    Quedan pocas: completá el pago para asegurar la tuya.
                  </span>
                ) : null}
              </>
            ) : (
              <span className="font-semibold text-red-400">Momentáneamente sin stock.</span>
            )}
          </p>
          <div className="mt-6">
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>
          <ProductTrustBlocks product={product} />
          <Link href="/consulta" className="mt-4 inline-block text-accent underline">
            Quiero clases personalizadas
          </Link>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-16">
        <h2 className="mb-4 text-2xl font-bold">Productos relacionados</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {related.map((item) => (
            <Link key={item.id} href={`/product/${item.slug}`} className="card block">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-neutral-light">{item.category}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
