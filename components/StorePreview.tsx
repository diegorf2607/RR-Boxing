import Link from 'next/link'
import { getProducts } from '@/shared/lib/data-store'

export default async function StorePreview() {
  const products = (await getProducts()).filter((p) => p.active).slice(0, 3)

  return (
    <section className="bg-dark-100 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="section-title !mb-2 !text-left">Tienda Oficial RRBOXING</h2>
            <p className="text-neutral-light">Equipamiento premium para sostener tu progreso.</p>
          </div>
          <Link href="/store" className="hidden text-accent underline md:block">
            Ver tienda completa
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="card">
              <p className="text-xs text-neutral-light">{product.category}</p>
              <h3 className="mt-1 text-xl font-bold">{product.name}</h3>
              <p className="mt-2 text-sm text-neutral-light">{product.description}</p>
              <Link href={`/product/${product.slug}`} className="mt-4 inline-block text-accent underline">
                Ver detalle
              </Link>
            </article>
          ))}
        </div>
        <Link href="/store" className="mt-6 inline-block text-accent underline md:hidden">
          Ver tienda completa
        </Link>
      </div>
    </section>
  )
}
