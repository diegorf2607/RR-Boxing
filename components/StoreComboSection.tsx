import Link from 'next/link'
import { Gift, Percent } from 'lucide-react'

const PEN = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 2 }).format(n)

const COMBOS = [
  {
    id: 'basico',
    title: 'Combo básico',
    items: 'Vendas + Cuerda',
    original: 19.99 + 24.99,
    final: 40.48,
  },
  {
    id: 'entrenamiento',
    title: 'Combo entrenamiento',
    items: 'Guantes + Vendas',
    original: 124.99 + 19.99,
    final: 130.48,
  },
  {
    id: 'completo',
    title: 'Combo completo',
    items: 'Guantes + Vendas + Cuerda',
    original: 124.99 + 19.99 + 24.99,
    final: 152.97,
  },
] as const

export default function StoreComboSection() {
  return (
    <section
      id="combos"
      className="scroll-mt-24 border-y border-dark-300 bg-gradient-to-b from-dark-100/80 to-dark bg-[length:100%_100%] py-12 md:py-16"
      aria-labelledby="combos-heading"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-2 font-heading text-xs uppercase tracking-[0.35em] text-accent">Promoción</p>
          <h2 id="combos-heading" className="font-heading text-3xl font-bold text-white md:text-4xl">
            Arma tu combo
          </h2>
          <p className="mt-2 text-sm text-neutral md:text-base">
            Complemento a la tienda: armá tu pedido arriba y acá ves ideas de packs con beneficio.
          </p>
          <p className="mt-3 text-base text-neutral-light md:text-lg">
            Combina tus productos favoritos y obtén <strong className="text-white">10% de descuento</strong> +{' '}
            <strong className="text-accent">un regalo sorpresa</strong>. Llévate cualquier combo con beneficio
            especial: añadí 2 o más unidades al carrito y el descuento se aplica solo en el checkout.
          </p>
          <p className="mt-2 text-sm font-semibold text-accent">
            Promo combo: 10% OFF + regalo sorpresa · Válido con 2+ artículos en tu pedido.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {COMBOS.map((c) => {
            const off = Math.round((c.original - c.final) * 100) / 100
            return (
              <article
                key={c.id}
                className="flex flex-col rounded-2xl border border-accent/30 bg-dark-100 p-6 shadow-lg shadow-black/30 ring-1 ring-white/5"
              >
                <div className="mb-4 flex items-center gap-2 text-accent">
                  <Percent className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="text-xs font-bold uppercase tracking-wider">{c.title}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-white">{c.items}</h3>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-light">
                  <span className="line-through opacity-70">{PEN(c.original)}</span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">−10%</span>
                </p>
                <p className="mt-3 font-heading text-2xl font-bold text-accent">{PEN(c.final)}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  <Gift className="h-4 w-4 text-accent" aria-hidden />
                  Incluye regalo
                </p>
                <p className="mt-1 text-xs text-neutral">Ahorro referencial: {PEN(off)} vs. precio de lista.</p>
                <Link
                  href="#catalogo"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-accent bg-transparent py-3 text-sm font-bold text-accent transition hover:bg-accent/10"
                >
                  Ver productos
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
