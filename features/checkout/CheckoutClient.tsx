'use client'

// /checkout: la pantalla única de datos del pedido, en el estilo de /clase (filas con líneas finas, un acento).
// Arriba el resumen leído del carrito; abajo nombre, correo, WhatsApp, DNI, entrega y envío. «Confirmar pedido»
// lo manda a POST /api/pedido, que recalcula todo en el servidor. Después: el número del pedido y el botón para
// mandarlo por WhatsApp (o, con Mercado Pago prendido y elegido, la página de pago).
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'
import { armarLineas, resumirCarrito, type LineaCarrito } from '@/features/cart/lineas'
import { useCatalogo } from '@/features/cart/useCatalogo'
import { coloresDisponibles } from '@/features/store/colores'
import { COMBO_MIN_UNITS, roundMoney } from '@/shared/lib/combo-promo'
import { formatCurrency } from '@/shared/lib/country'
import { leerOrigen } from '@/shared/lib/origen'
import { RUTAS } from '@/shared/legal/politicas'
import AvisoDatos from '@/components/AvisoDatos'
import type { CheckoutShippingMethod, OpcionEnvio } from '@/shared/lib/cart-checkout'

type FormaPago = 'whatsapp' | 'mercadopago'

/** Lo que responde POST /api/pedido */
interface Resultado {
  numero: string
  formaPago: FormaPago
  pagar: string | null
  whatsapp: string
  resumen: {
    lineas: { nombre: string; cantidad: number; total: number }[]
    descuentoCombo: number
    totalProductos: number
    envio: OpcionEnvio
    total: number
  } | null
  /** Cuándo se hizo (para mostrarlo otra vez si recarga la página) */
  hecho?: number
  /** Eligió Mercado Pago pero no se pudo abrir: el pago se coordina por WhatsApp */
  sinMercadoPago?: boolean
}

/** El último pedido de esta pestaña: si recarga la página, vuelve a ver su número y el botón de WhatsApp. */
const CLAVE_ULTIMO = 'rrboxing_ultimo_pedido'
const VIGENCIA_ULTIMO_MS = 2 * 3_600_000

function leerUltimo(): Resultado | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE_ULTIMO)
    if (!crudo) return null
    const r = JSON.parse(crudo) as Resultado
    if (!r?.numero || !r.whatsapp?.startsWith('https://wa.me/') || !r.hecho || Date.now() - r.hecho > VIGENCIA_ULTIMO_MS) return null
    return r
  } catch {
    return null
  }
}

function guardarUltimo(r: Resultado | null) {
  try {
    if (r) sessionStorage.setItem(CLAVE_ULTIMO, JSON.stringify(r))
    else sessionStorage.removeItem(CLAVE_ULTIMO)
  } catch {
    /* sin sessionStorage: no pasa nada */
  }
}

const soles = (n: number) => formatCurrency(n, 'PEN', 'es-PE')
const envioMonto = (e: OpcionEnvio) => (e.monto > 0 ? soles(e.monto) : 'Gratis')

const campo =
  'mt-2 block w-full rounded-lg border border-dark-300 bg-dark px-4 py-3 text-base text-white placeholder:text-neutral-dark focus:border-accent focus:outline-none aria-[invalid=true]:border-red-500'
const etiqueta = 'mt-4 block text-sm text-neutral-light first:mt-0'
const fila = 'flex items-baseline justify-between gap-4 px-5 py-4'

type Campos = 'nombre' | 'correo' | 'whatsapp' | 'dni' | 'distrito' | 'direccion' | 'referencia'

export default function CheckoutClient({ envios, pagoEnLinea }: { envios: OpcionEnvio[]; pagoEnLinea: boolean }) {
  const { items, clearCart } = useCart()
  const { country } = useCountry()
  const { productos, cargado } = useCatalogo()

  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [colores, setColores] = useState<Record<string, string>>({})
  const [envio, setEnvio] = useState<CheckoutShippingMethod>('standard')
  const [pago, setPago] = useState<FormaPago>(pagoEnLinea ? 'mercadopago' : 'whatsapp')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<{ mensaje: string; campo?: string } | null>(null)
  const formulario = useRef<HTMLFormElement>(null)

  // Si recargó después de confirmar, vuelve a ver su pedido
  useEffect(() => {
    const ultimo = leerUltimo()
    if (ultimo) setResultado(ultimo)
  }, [])

  // En soles siempre: enviamos solo dentro del Perú
  const lineas = useMemo(() => armarLineas(items, productos, 'PE'), [items, productos])
  const resumen = useMemo(() => resumirCarrito(lineas), [lineas])
  const agotadas = lineas.filter((l) => l.agotado)
  const opcionEnvio = envios.find((e) => e.metodo === envio) ?? envios[0]
  const totalConEnvio = roundMoney(resumen.combo.total + (opcionEnvio?.monto ?? 0))

  /** El color de una línea: el del carrito o el que eligió aquí. null si el producto no tiene colores. */
  const colorDe = (l: LineaCarrito): string | null => {
    if (coloresDisponibles(l.product).length === 0) return null
    return l.variante?.color ?? colores[l.clave] ?? ''
  }

  // Después de confirmar (o si recarga con el carrito ya vacío): el número y el botón de WhatsApp
  if (resultado && cargado && items.length === 0) return <PedidoRecibido resultado={resultado} />

  const cargando = !cargado
  const vacio = cargado && resumen.disponibles.length === 0

  async function confirmar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setError(null)
    const sinColor = resumen.disponibles.find((l) => colorDe(l) === '')
    if (sinColor) {
      setError({ mensaje: `Elige el color de ${sinColor.product.name.trim()}.`, campo: 'color' })
      document.getElementById(`color-${sinColor.clave}`)?.focus()
      return
    }
    const datos = new FormData(evento.currentTarget)
    const valor = (nombre: string) => String(datos.get(nombre) ?? '')
    setEnviando(true)
    try {
      const respuesta = await fetch('/api/pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: valor('nombre'),
          correo: valor('correo'),
          whatsapp: valor('whatsapp'),
          dni: valor('dni'),
          distrito: valor('distrito'),
          direccion: valor('direccion'),
          referencia: valor('referencia'),
          envio,
          pago: pagoEnLinea ? pago : 'whatsapp',
          items: resumen.disponibles.map((l) => {
            const color = colorDe(l)
            return { productId: l.productId, quantity: l.quantity, ...(color ? { color } : {}) }
          }),
          origen: leerOrigen(),
          sitio: valor('sitio'),
        }),
      })
      const json = (await respuesta.json().catch(() => ({}))) as Partial<Resultado> & { error?: string; campo?: string }
      if (!respuesta.ok || !json.numero || !json.whatsapp) {
        const campoError = json.campo
        setError({ mensaje: json.error ?? 'No pudimos registrar tu pedido.', campo: campoError })
        if (campoError) formulario.current?.querySelector<HTMLElement>(`[name="${campoError}"]`)?.focus()
        setEnviando(false)
        return
      }
      const r: Resultado = {
        numero: json.numero,
        formaPago: json.formaPago === 'mercadopago' ? 'mercadopago' : 'whatsapp',
        pagar: typeof json.pagar === 'string' && json.pagar.startsWith('https://') ? json.pagar : null,
        whatsapp: json.whatsapp,
        resumen: json.resumen ?? null,
        hecho: Date.now(),
        sinMercadoPago: pagoEnLinea && pago === 'mercadopago' && json.formaPago !== 'mercadopago',
      }
      guardarUltimo({ ...r, pagar: null })
      clearCart()
      if (r.pagar) {
        window.location.href = r.pagar
        return
      }
      setResultado(r)
      setEnviando(false)
      window.scrollTo({ top: 0 })
    } catch {
      setError({ mensaje: 'No pudimos registrar tu pedido. Revisa tu conexión e inténtalo otra vez.' })
      setEnviando(false)
    }
  }

  const invalido = (nombre: Campos) => (error?.campo === nombre ? true : undefined)

  return (
    <div className="px-4 py-10 text-white sm:py-14">
      <div className="mx-auto w-full max-w-lg">
        <h1 className="font-heading text-5xl leading-none text-white sm:text-6xl">Tu pedido</h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-light">
          {pagoEnLinea
            ? 'Revisa tus productos y déjanos tus datos para enviarte tu pedido.'
            : 'Revisa tus productos y déjanos tus datos. Te confirmamos el envío y cómo pagar por WhatsApp.'}
        </p>

        {cargando ? (
          <div className="mt-8 h-40 animate-pulse rounded-2xl border border-dark-300 bg-dark-100" aria-label="Cargando tu pedido" />
        ) : vacio ? (
          <div className="mt-8 rounded-2xl border border-dark-300 bg-dark-100 p-5">
            <p className="text-base leading-relaxed text-white">
              {agotadas.length > 0
                ? 'Lo que tienes en el carrito está agotado por ahora, así que no hay nada que pedir.'
                : 'Tu carrito está vacío.'}
            </p>
            <Link
              href="/"
              className="mt-5 block rounded-lg bg-accent px-6 py-3.5 text-center font-bold text-dark transition-colors hover:bg-accent-dark"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <>
            <section aria-labelledby="resumen-titulo" className="mt-8">
              <h2 id="resumen-titulo" className="sr-only">
                Resumen
              </h2>
              <dl className="rounded-2xl border border-dark-300 bg-dark-100">
                {resumen.disponibles.map((l, i) => {
                  const opciones = coloresDisponibles(l.product)
                  const color = colorDe(l)
                  return (
                    <div key={l.clave} className={`px-5 py-4 ${i > 0 ? 'border-t border-dark-300' : ''}`}>
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="min-w-0 text-base">
                          {l.product.name.trim()}
                          <span className="block text-sm text-neutral">
                            {l.quantity} × {soles(l.price.amount)}
                            {l.variante?.color ? ` · ${l.variante.color}` : ''}
                          </span>
                        </dt>
                        <dd className="shrink-0 text-right text-base font-medium tabular-nums">{soles(l.lineTotal)}</dd>
                      </div>
                      {opciones.length > 0 && !l.variante?.color && (
                        <label className="mt-3 flex items-center justify-between gap-4 text-sm text-neutral-light">
                          Color
                          <select
                            id={`color-${l.clave}`}
                            value={color ?? ''}
                            required
                            aria-invalid={error?.campo === 'color' && !color ? true : undefined}
                            onChange={(e) => setColores((c) => ({ ...c, [l.clave]: e.target.value }))}
                            className="rounded-lg border border-dark-300 bg-dark px-3 py-2 text-base text-white focus:border-accent focus:outline-none aria-[invalid=true]:border-red-500"
                          >
                            <option value="" disabled>
                              Elige
                            </option>
                            {opciones.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                  )
                })}
                {resumen.combo.descuento > 0 && (
                  <>
                    <div className={`${fila} border-t border-dark-300`}>
                      <dt className="text-sm text-neutral">Subtotal</dt>
                      <dd className="text-base tabular-nums">{soles(resumen.combo.subtotal)}</dd>
                    </div>
                    <div className={`${fila} border-t border-dark-300`}>
                      <dt className="text-sm text-accent">Combo 10%</dt>
                      <dd className="text-base font-medium tabular-nums text-accent">−{soles(resumen.combo.descuento)}</dd>
                    </div>
                  </>
                )}
                <div className={`${fila} border-t border-dark-300`}>
                  <dt className="text-sm text-neutral">Total de productos</dt>
                  <dd className="text-lg font-bold tabular-nums">{soles(resumen.combo.total)}</dd>
                </div>
              </dl>
              {resumen.combo.descuento === 0 && resumen.hayProductosDelCombo && (
                <p className="mt-2 text-sm text-neutral">Con {COMBO_MIN_UNITS} o más productos del combo tienes 10% menos.</p>
              )}
              {agotadas.map((l) => (
                <p key={l.clave} className="mt-2 text-sm text-neutral">
                  {l.product.name.trim()} está agotado y no va en tu pedido.
                </p>
              ))}
              {country !== 'PE' && (
                <p className="mt-2 text-sm text-neutral">Enviamos solo dentro del Perú: el pedido va en soles.</p>
              )}
              <Link href="/cart" className="mt-3 inline-block text-sm text-neutral-light underline underline-offset-2 hover:text-accent">
                Cambiar productos
              </Link>
            </section>

            <form ref={formulario} onSubmit={confirmar} className="mt-10">
              <fieldset>
                <legend className="font-heading text-3xl leading-none text-white">Tus datos</legend>
                <div className="mt-5">
                  <label className={etiqueta}>
                    Nombre y apellido
                    <input name="nombre" required minLength={2} maxLength={80} autoComplete="name" aria-invalid={invalido('nombre')} className={campo} />
                  </label>
                  <label className={etiqueta}>
                    Correo
                    <input
                      name="correo"
                      type="email"
                      inputMode="email"
                      required
                      maxLength={120}
                      autoComplete="email"
                      placeholder="tucorreo@gmail.com"
                      aria-invalid={invalido('correo')}
                      className={campo}
                    />
                  </label>
                  <label className={etiqueta}>
                    WhatsApp
                    <input
                      name="whatsapp"
                      type="tel"
                      inputMode="tel"
                      required
                      minLength={6}
                      maxLength={30}
                      autoComplete="tel"
                      placeholder="987 654 321"
                      aria-invalid={invalido('whatsapp')}
                      className={campo}
                    />
                  </label>
                  <label className={etiqueta}>
                    DNI (opcional)
                    <input
                      name="dni"
                      inputMode="numeric"
                      maxLength={20}
                      autoComplete="off"
                      aria-invalid={invalido('dni')}
                      className={campo}
                    />
                    <span className="mt-1.5 block text-xs text-neutral">O tu carné de extranjería.</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="mt-10">
                <legend className="font-heading text-3xl leading-none text-white">Entrega</legend>
                <div className="mt-5">
                  <label className={etiqueta}>
                    Distrito
                    <input
                      name="distrito"
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="address-level2"
                      placeholder="Surco"
                      aria-invalid={invalido('distrito')}
                      className={campo}
                    />
                    <span className="mt-1.5 block text-xs text-neutral">Si no estás en Lima, pon también tu ciudad.</span>
                  </label>
                  <label className={etiqueta}>
                    Dirección
                    <input
                      name="direccion"
                      required
                      minLength={5}
                      maxLength={200}
                      autoComplete="street-address"
                      placeholder="Av. Primavera 123, dpto. 401"
                      aria-invalid={invalido('direccion')}
                      className={campo}
                    />
                  </label>
                  <label className={etiqueta}>
                    Referencia (opcional)
                    <input
                      name="referencia"
                      maxLength={200}
                      autoComplete="off"
                      placeholder="Frente al parque"
                      aria-invalid={invalido('referencia')}
                      className={campo}
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className="mt-10">
                <legend className="font-heading text-3xl leading-none text-white">Envío</legend>
                <div className="mt-5 rounded-2xl border border-dark-300 bg-dark-100">
                  {envios.map((e, i) => (
                    <label
                      key={e.metodo}
                      className={`flex cursor-pointer items-start gap-3 px-5 py-4 ${i > 0 ? 'border-t border-dark-300' : ''}`}
                    >
                      <input
                        type="radio"
                        name="envio"
                        value={e.metodo}
                        checked={envio === e.metodo}
                        onChange={() => setEnvio(e.metodo)}
                        className="mt-1 h-4 w-4 shrink-0 accent-accent"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-base text-white">{e.nombre}</span>
                        <span className="block text-sm text-neutral">{e.plazo}</span>
                      </span>
                      <span className="shrink-0 text-base font-medium tabular-nums">{envioMonto(e)}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-neutral">Son costos de referencia: te confirmamos el envío por WhatsApp según tu distrito.</p>
              </fieldset>

              {pagoEnLinea && (
                <fieldset className="mt-10">
                  <legend className="font-heading text-3xl leading-none text-white">Pago</legend>
                  <div className="mt-5 rounded-2xl border border-dark-300 bg-dark-100">
                    {(
                      [
                        { valor: 'mercadopago', titulo: 'Pagar ahora con Mercado Pago', nota: 'Yape, tarjeta y más' },
                        { valor: 'whatsapp', titulo: 'Coordinar el pago por WhatsApp', nota: 'Te escribimos para confirmar el envío y cómo pagar' },
                      ] as const
                    ).map((o, i) => (
                      <label
                        key={o.valor}
                        className={`flex cursor-pointer items-start gap-3 px-5 py-4 ${i > 0 ? 'border-t border-dark-300' : ''}`}
                      >
                        <input
                          type="radio"
                          name="pago"
                          value={o.valor}
                          checked={pago === o.valor}
                          onChange={() => setPago(o.valor)}
                          className="mt-1 h-4 w-4 shrink-0 accent-accent"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-base text-white">{o.titulo}</span>
                          <span className="block text-sm text-neutral">{o.nota}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <dl className="mt-10 rounded-2xl border border-dark-300 bg-dark-100">
                <div className={fila}>
                  <dt className="text-sm text-neutral">Total de productos</dt>
                  <dd className="text-base tabular-nums">{soles(resumen.combo.total)}</dd>
                </div>
                <div className={`${fila} border-t border-dark-300`}>
                  <dt className="text-sm text-neutral">Envío {opcionEnvio?.nombre.toLowerCase()}</dt>
                  <dd className="text-base tabular-nums">{opcionEnvio ? envioMonto(opcionEnvio) : '—'}</dd>
                </div>
                <div className={`${fila} border-t border-dark-300`}>
                  <dt className="text-base text-white">Total</dt>
                  <dd className="text-xl font-bold tabular-nums text-accent">{soles(totalConEnvio)}</dd>
                </div>
              </dl>

              <input name="sitio" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              <button
                type="submit"
                disabled={enviando}
                className="mt-6 block w-full rounded-lg bg-accent px-6 py-4 text-center text-lg font-bold text-dark transition-colors hover:bg-accent-dark disabled:opacity-60"
              >
                {enviando ? 'Un momento…' : pagoEnLinea && pago === 'mercadopago' ? 'Confirmar y pagar' : 'Confirmar pedido'}
              </button>

              {error && (
                <p role="alert" className="mt-3 text-sm text-red-400">
                  {error.mensaje}
                </p>
              )}

              <AvisoDatos
                para="preparar y enviar tu pedido, y escribirte sobre él por WhatsApp o por correo"
                donde={
                  pagoEnLinea && pago === 'mercadopago'
                    ? 'Supabase y Vercel, y Mercado Pago recibe tu nombre y tu correo para cobrarte'
                    : undefined
                }
                className="mt-4"
              />
              <p className="mt-2 text-xs leading-relaxed text-neutral">
                Al confirmar aceptas los{' '}
                <Link href={RUTAS.terminos} className="text-neutral-light underline underline-offset-2 hover:text-accent">
                  Términos
                </Link>{' '}
                y la política de{' '}
                <Link href={RUTAS.cambios} className="text-neutral-light underline underline-offset-2 hover:text-accent">
                  Cambios y devoluciones
                </Link>
                .
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/** Después de confirmar: el número del pedido y el botón para mandarlo por WhatsApp. */
function PedidoRecibido({ resultado }: { resultado: Resultado }) {
  const r = resultado.resumen
  return (
    <div className="px-4 py-10 text-white sm:py-14">
      <div className="mx-auto w-full max-w-lg">
        <h1 className="font-heading text-5xl leading-none text-white sm:text-6xl">Pedido recibido</h1>

        <dl className="mt-8 rounded-2xl border border-dark-300 bg-dark-100">
          <div className={fila}>
            <dt className="text-sm text-neutral">Número de pedido</dt>
            <dd className="text-right font-mono text-lg font-bold tracking-wide text-accent">{resultado.numero}</dd>
          </div>
          {r?.lineas.map((l, i) => (
            <div key={`${l.nombre}-${i}`} className={`${fila} border-t border-dark-300`}>
              <dt className="min-w-0 text-base">
                {l.nombre}
                <span className="block text-sm text-neutral">{l.cantidad === 1 ? '1 unidad' : `${l.cantidad} unidades`}</span>
              </dt>
              <dd className="shrink-0 text-right text-base tabular-nums">{soles(l.total)}</dd>
            </div>
          ))}
          {r && r.descuentoCombo > 0 && (
            <div className={`${fila} border-t border-dark-300`}>
              <dt className="text-sm text-accent">Combo 10%</dt>
              <dd className="text-base tabular-nums text-accent">−{soles(r.descuentoCombo)}</dd>
            </div>
          )}
          {r && (
            <>
              <div className={`${fila} border-t border-dark-300`}>
                <dt className="text-sm text-neutral">
                  Envío {r.envio.nombre.toLowerCase()}
                  <span className="block text-xs">de referencia</span>
                </dt>
                <dd className="text-base tabular-nums">{envioMonto(r.envio)}</dd>
              </div>
              <div className={`${fila} border-t border-dark-300`}>
                <dt className="text-base text-white">Total</dt>
                <dd className="text-xl font-bold tabular-nums">{soles(r.total)}</dd>
              </div>
            </>
          )}
        </dl>

        {resultado.sinMercadoPago && (
          <p className="mt-8 text-base leading-relaxed text-white">
            No pudimos abrir Mercado Pago. Tu pedido igual quedó registrado: coordinamos el pago por WhatsApp.
          </p>
        )}
        <p className="mt-8 text-base leading-relaxed text-white">
          Mándanos tu pedido por WhatsApp para terminar. Ya va escrito con tu número de pedido.
        </p>
        <a
          href={resultado.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block rounded-lg bg-accent px-6 py-4 text-center text-lg font-bold text-dark transition-colors hover:bg-accent-dark"
        >
          Enviar pedido por WhatsApp
        </a>
        <p className="mt-3 text-center text-sm text-neutral-light">Te confirmamos el envío y cómo pagar.</p>

        <Link href="/" className="mt-10 block text-center text-sm text-neutral-light underline underline-offset-2 hover:text-accent">
          Volver a la tienda
        </Link>
      </div>
    </div>
  )
}
