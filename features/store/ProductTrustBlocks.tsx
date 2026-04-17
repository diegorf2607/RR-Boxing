import Link from 'next/link'
import { Star, Truck, RotateCcw, Shield } from 'lucide-react'
import type { Product } from '@/shared/types/commerce'

export default function ProductTrustBlocks({ product }: { product: Product }) {
  const rating = product.rating ?? 4.9
  const reviews = product.reviewCount ?? 0

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-xl border border-dark-300 bg-dark-100 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Star className="h-5 w-5 text-accent" aria-hidden />
          <h3 className="font-semibold">Reseñas y comunidad</h3>
        </div>
        <p className="text-sm text-neutral-light">
          {rating.toFixed(1)} / 5 · {reviews} opiniones verificadas de la comunidad RRBOXING.
        </p>
      </div>

      <div className="rounded-xl border border-dark-300 bg-dark-100 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Truck className="h-5 w-5 text-accent" aria-hidden />
          <h3 className="font-semibold">Envío</h3>
        </div>
        <p className="text-sm text-neutral-light">
          Despacho según tu país seleccionado en la tienda. Ver coste estimado de envío en el carrito antes de pagar.
        </p>
      </div>

      <div className="rounded-xl border border-dark-300 bg-dark-100 p-4">
        <div className="mb-2 flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-accent" aria-hidden />
          <h3 className="font-semibold">Cambios y devoluciones</h3>
        </div>
        <p className="text-sm text-neutral-light">
          Producto sin uso y en empaque original. Escríbenos desde tu cuenta o el correo de confirmación para gestionar tu caso.
        </p>
      </div>

      <div className="rounded-xl border border-accent/30 bg-dark-100/80 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" aria-hidden />
          <h3 className="font-semibold">Confianza RRBOXING</h3>
        </div>
        <p className="text-sm text-neutral-light">
          Marca con trayectoria en enseñanza y entrenamiento. No es una tienda genérica: es el canal oficial de quienes
          entrenan con método y disciplina. Condiciones de garantía y devoluciones:{' '}
          <Link href="/garantia" className="text-accent underline hover:text-accent-light">
            ver documento de garantía de compra
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
