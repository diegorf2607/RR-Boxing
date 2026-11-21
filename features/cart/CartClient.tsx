'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import { getCountryConfig, formatCurrency } from '@/shared/lib/country'
import { COMBO_MIN_UNITS } from '@/shared/lib/combo-promo'
import { getStockStatus } from '@/features/store/stockUrgency'
import { enlaceConsultaAgotado, enlacePedidoLineas } from '@/features/store/pedidoWhatsappProducto'
import { armarLineas, resumirCarrito, topeLinea } from '@/features/cart/lineas'
import { useCatalogo } from '@/features/cart/useCatalogo'
import SelectorCantidad from '@/features/cart/SelectorCantidad'
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
import { nombreConVariante } from '@/features/store/colores'

function CartLineSkeleton() {
  return (
    <div className="flex gap-4 border-b border-linea py-5 motion-safe:animate-pulse">
      <div className="h-24 w-24 shrink-0 bg-gris md:h-28 md:w-28" />
      <div className="min-w-0 flex-1 space-y-3 py-1">
        <div className="h-5 w-3/4 max-w-xs bg-gris" />
        <div className="h-4 w-24 bg-gris" />
        <div className="h-11 w-36 bg-gris" />
      </div>
    </div>
  )
}

/**
 * /cart, en la línea de la tienda: página blanca, las líneas del carrito separadas por líneas finas y el resumen en un
 * cuadro gris al lado (abajo en el celular). Al quitar una línea, el foco pasa al título «Carrito» para no caerse al
 * <body>.
 */
export default function CartClient() {
  const { items, removeItem, updateQuantity } = useCart()
  const titulo = useRef<HTMLHeadingElement>(null)
  const { country } = useCountry()
  const { productos, cargado: productsLoaded } = useCatalogo()

  // Cada línea es un producto con su color: dos colores del mismo producto son dos líneas.
  const rows = armarLineas(items, productos, country)

  const config = getCountryConfig(country)
  const currency = rows[0]?.price.currency ?? config.currency
  // Lo agotado se queda en el carrito, pero no entra en el resumen, ni en el combo, ni en el pedido.
  const resumen = resumirCarrito(rows)
  const { disponibles, todoAgotado, hayProductosDelCombo, unidades: itemCount } = resumen
  const subtotal = resumen.combo.subtotal
  const comboDiscount = resumen.combo.descuento
  const subtotalConCombo = resumen.combo.total
  const dinero = (amount: number) => formatCurrency(amount, currency, config.locale)

  // Cada línea va con su color; si a una le falta (un carrito guardado antes), el mensaje pregunta el color.
  const enlacePedido = enlacePedidoLineas(disponibles, country)

  const waitingForCatalog = items.length > 0 && !productsLoaded
  const trulyEmpty = items.length === 0
  const orphanLines = productsLoaded && items.length > 0 && rows.length === 0

  return (
    <section className="pb-16 pt-4 md:pb-24 md:pt-6">
      <div className="contenedor">
        <div className="mb-6 md:mb-8">
          <Link
            href="/"
            className="mb-2 inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold underline-offset-[3px] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Seguir comprando
          </Link>
          <h1 ref={titulo} tabIndex={-1} className="page-title outline-none">
            Carrito
          </h1>
          {!trulyEmpty && !waitingForCatalog && !orphanLines && (
            <p className="mt-2 text-suave">{itemCount === 1 ? '1 producto' : `${itemCount} productos`}</p>
          )}
        </div>

        {waitingForCatalog ? (
          <div className="max-w-3xl border-t border-linea">
            <CartLineSkeleton />
            <CartLineSkeleton />
          </div>
        ) : trulyEmpty ? (
          <div className="max-w-lg border-t border-linea pt-6">
            <h2 className="text-xl font-bold">Tu carrito está vacío</h2>
            <p className="mt-2 leading-relaxed text-tinta-2">Agrega productos desde la tienda y aquí armas tu pedido.</p>
            <Link href="/" className="btn-primary mt-6">
              Ir a la tienda
            </Link>
          </div>
        ) : orphanLines ? (
          <div className="max-w-lg border-t border-linea pt-6">
            <p className="leading-relaxed text-tinta-2">
              Hay productos en tu carrito que ya no están disponibles. Vuelve a la tienda y agrégalos de nuevo.
            </p>
            <Link href="/" className="btn-secondary mt-6">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-14">
            <ul className="border-t border-linea">
              {rows.map((row) => {
                const stock = getStockStatus(row.product.stock)
                const agotado = stock.kind === 'agotado'

                return (
                  <li key={row.clave} className="border-b border-linea py-5">
                    <article className="flex gap-4 md:gap-6">
                      {/* La foto lleva a la ficha con el dedo o el mouse; para el teclado basta el enlace del nombre */}
                      <Link
                        href={`/product/${row.product.slug}`}
                        tabIndex={-1}
                        aria-hidden="true"
                        className="relative h-24 w-24 shrink-0 overflow-hidden bg-gris md:h-28 md:w-28"
                      >
                        {row.product.imageUrls[0] ? (
                          <Image
                            src={row.product.imageUrls[0]}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 96px, 112px"
                            className="object-contain p-2 mix-blend-multiply"
                          />
                        ) : null}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="text-base font-semibold leading-snug md:text-lg">
                              <Link
                                href={`/product/${row.product.slug}`}
                                className="underline-offset-[3px] hover:underline"
                              >
                                {row.product.name}
                              </Link>
                            </h2>
                            {row.variante?.color ? (
                              <p className="mt-0.5 text-sm text-tinta-2">Color: {row.variante.color}</p>
                            ) : null}
                            <p className="mt-0.5 text-sm text-suave">
                              {formatCurrency(row.price.amount, row.price.currency, config.locale)} c/u
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              removeItem(row.productId, row.variante)
                              // El botón desaparece con la línea: el foco pasa al título para no caerse al <body>
                              requestAnimationFrame(() => titulo.current?.focus())
                            }}
                            className="-mr-3 -mt-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-suave transition-colors hover:bg-gris hover:text-tinta"
                            aria-label={`Quitar ${row.product.name.trim()}${row.variante?.color ? ` (${row.variante.color})` : ''} del carrito`}
                          >
                            <Trash2 className="h-[18px] w-[18px]" aria-hidden />
                          </button>
                        </div>

                        {agotado ? (
                          <div className="mt-3 text-sm">
                            <p className="font-bold">{stock.label}</p>
                            <p className="mt-1 text-tinta-2">
                              No va en tu pedido.{' '}
                              <a
                                href={enlaceConsultaAgotado(row.product)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="enlace text-tinta"
                              >
                                Preguntar cuándo vuelve
                              </a>
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 flex flex-nowrap items-center justify-between gap-3">
                            <SelectorCantidad
                              tamano="sm"
                              valor={row.quantity}
                              max={topeLinea(row.product.stock)}
                              etiqueta={`Cantidad de ${nombreConVariante(row.product.name, row.variante)}`}
                              onCambiar={(q) => updateQuantity(row.productId, q, row.variante)}
                            />
                            <p className="num text-[22px] leading-none md:text-2xl">
                              {formatCurrency(row.lineTotal, row.price.currency, config.locale)}
                            </p>
                          </div>
                        )}

                        {stock.kind === 'pocas' && <p className="mt-2 text-sm text-suave">{stock.label}</p>}
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>

            {/* Una sección dentro de <main> (no un <aside>): el resumen es parte del contenido principal */}
            <section aria-labelledby="resumen-carrito" className="bg-gris p-5 md:p-6 lg:sticky lg:top-[92px]">
              <h2 id="resumen-carrito" className="titulo-bloque text-[40px] md:text-[44px]">
                Resumen
              </h2>
              <dl className="mt-5 space-y-2.5 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-tinta-2">Subtotal</dt>
                  <dd className="tabular-nums">{dinero(subtotal)}</dd>
                </div>
                {comboDiscount > 0 ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt>
                      <span className="etiqueta">Combo 10%</span>
                    </dt>
                    <dd className="font-semibold tabular-nums">−{dinero(comboDiscount)}</dd>
                  </div>
                ) : hayProductosDelCombo ? (
                  <p className="text-sm text-suave">Con {COMBO_MIN_UNITS} o más productos del combo tienes 10% menos.</p>
                ) : null}
              </dl>
              <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-linea-fuerte pt-4">
                <span className="font-bold">Total de productos</span>
                <span className="num text-[32px] leading-none">{dinero(subtotalConCombo)}</span>
              </div>
              {todoAgotado ? (
                <>
                  <button type="button" disabled className="btn-primary mt-5">
                    Continuar con mi pedido
                  </button>
                  <p className="mt-3 text-center text-sm leading-relaxed text-tinta-2">
                    Lo que tienes en el carrito está agotado por ahora, así que no hay nada que pedir. Agrega otros
                    productos desde la tienda.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1.5 text-sm text-suave">No incluye el envío.</p>
                  <Link href="/checkout" className="btn-primary mt-5">
                    Continuar con mi pedido
                  </Link>
                  <a href={enlacePedido} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-2">
                    <IconoWhatsapp />
                    Pedir directo por WhatsApp
                  </a>
                  <p className="mt-3 text-center text-sm leading-relaxed text-tinta-2">
                    Por WhatsApp, el mensaje sale con tu pedido ya escrito.
                  </p>
                </>
              )}
              <Link
                href="/"
                className="mt-2 flex min-h-[44px] items-center justify-center text-[15px] font-semibold underline underline-offset-[3px] hover:decoration-2"
              >
                Agregar más productos
              </Link>
            </section>
          </div>
        )}
      </div>
    </section>
  )
}
