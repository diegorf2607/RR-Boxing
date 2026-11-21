'use client'

// /checkout: la pantalla única de datos del pedido, en la línea de la tienda (página blanca, líneas finas, campos
// rectos). El resumen leído del carrito va arriba en el celular y a la derecha en escritorio; los datos (nombre, correo,
// WhatsApp, DNI), la entrega y el envío, en una columna. «Confirmar pedido»
// lo manda a POST /api/pedido, que recalcula todo en el servidor. Después: el número del pedido y el botón para
// mandarlo por WhatsApp (o, con Mercado Pago prendido y elegido, la página de pago).
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'
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
import IconoWhatsapp from '@/features/cart/IconoWhatsapp'
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

// Campos rectos de 52 px con línea gris; con error, borde negro de 2 px y el mensaje al lado (sin rojo). El foco es el
// contorno negro de todo el sitio (globals.css). El texto de ejemplo va en gris oscuro (6,9:1) y empieza con «Ej.:»
// para que no parezca ya escrito.
const campo =
  'mt-2 block min-h-[52px] w-full border border-linea-fuerte bg-white px-4 py-3 text-base font-normal text-tinta placeholder:text-suave hover:border-tinta focus:border-tinta aria-[invalid=true]:border-2 aria-[invalid=true]:border-tinta'
const etiqueta = 'mt-5 block text-[15px] font-semibold first:mt-0'
const ayuda = 'mt-1.5 block text-sm font-normal text-suave'
const leyenda = 'titulo-bloque text-[40px] md:text-[44px]'
/** Filas del resumen sobre gris y de los totales sobre blanco */
const fila = 'flex items-baseline justify-between gap-4 border-b border-linea-fuerte py-3.5'
const filaBlanca = 'flex items-baseline justify-between gap-4 border-b border-linea py-4'
/** Cuadro de opción (envío, pago), como los packs de la ficha: al elegirlo, borde negro de 2 px y el círculo lleno */
const opcion =
  'grid cursor-pointer grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 border border-linea-fuerte bg-white px-4 py-3.5 transition-colors hover:border-tinta has-[:checked]:border-2 has-[:checked]:border-tinta has-[:checked]:px-[15px] has-[:checked]:py-[13px] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tinta'
const circulo =
  'row-span-2 h-5 w-5 rounded-full border-2 border-[#9A9A9A] peer-checked:border-[6px] peer-checked:border-tinta'

type Campos = 'nombre' | 'correo' | 'whatsapp' | 'dni' | 'distrito' | 'direccion' | 'referencia'
/** Los errores de estos campos salen junto al campo; los demás (stock, conexión…) van encima del botón */
const CAMPOS: readonly string[] = ['nombre', 'correo', 'whatsapp', 'dni', 'distrito', 'direccion', 'referencia']

/** El color guardado en el carrito, si sigue siendo uno de los colores del producto (con su escritura). */
function colorValido(l: LineaCarrito): string | null {
  const guardado = l.variante?.color?.trim().toLowerCase()
  if (!guardado) return null
  return coloresDisponibles(l.product).find((c) => c.toLowerCase() === guardado) ?? null
}

export default function CheckoutClient({ envios, pagoEnLinea }: { envios: OpcionEnvio[]; pagoEnLinea: boolean }) {
  const { items, clearCart } = useCart()
  const { country } = useCountry()
  const { productos, cargado } = useCatalogo()

  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [colores, setColores] = useState<Record<string, string>>({})
  const [envio, setEnvio] = useState<CheckoutShippingMethod>('standard')
  const [pago, setPago] = useState<FormaPago>(pagoEnLinea ? 'mercadopago' : 'whatsapp')
  const [enviando, setEnviando] = useState(false)
  /** clave: la línea del carrito a la que le falta el color (para mostrar el error junto a su selector) */
  const [error, setError] = useState<{ mensaje: string; campo?: string; clave?: string } | null>(null)
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

  /**
   * El color de una línea: el del carrito si sigue entre los colores del producto, o el que eligió aquí ('' si
   * todavía no eligió). null si el producto no tiene colores.
   */
  const colorDe = (l: LineaCarrito): string | null => {
    if (coloresDisponibles(l.product).length === 0) return null
    return colorValido(l) ?? colores[l.clave] ?? ''
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
      setError({ mensaje: `Elige el color de ${sinColor.product.name.trim()}.`, campo: 'color', clave: sinColor.clave })
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
  /** Junto al campo: el mensaje del error, enlazado con aria-describedby (como en el Libro de Reclamaciones) */
  const errorDe = (nombre: Campos) =>
    error?.campo === nombre ? <MensajeError id={`error-${nombre}`}>{error.mensaje}</MensajeError> : null
  const describe = (nombre: Campos) => (error?.campo === nombre ? `error-${nombre}` : undefined)
  // El error de color va junto al selector de su línea; si no hay selector a la vista, va encima del botón
  const claveErrorColor =
    error?.campo === 'color' ? error.clave ?? resumen.disponibles.find((l) => colorDe(l) === '')?.clave : undefined
  const errorGeneral = error && !(error.campo && CAMPOS.includes(error.campo)) && !claveErrorColor ? error : null
  /** Al corregir el campo con error, el mensaje ya no aplica */
  const alEscribir = (evento: React.FormEvent<HTMLFormElement>) => {
    const nombre = (evento.target as HTMLInputElement).name
    if (error?.campo && nombre === error.campo) setError(null)
  }

  return (
    <div className="contenedor pb-16 pt-6 md:pb-24 md:pt-10">
      {/* Escritorio: los datos a la izquierda y el resumen a la derecha, fijo al bajar. Celular: el resumen arriba. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-x-16">
        <header className="max-w-[640px] lg:col-start-1 lg:row-start-1">
          <h1 className="page-title">Tu pedido</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-tinta-2">
            {pagoEnLinea
              ? 'Revisa tus productos y déjanos tus datos para enviarte tu pedido.'
              : 'Revisa tus productos y déjanos tus datos. Te confirmamos el envío y cómo pagar por WhatsApp.'}
          </p>
        </header>

        {cargando ? (
          <div
            className="mt-8 h-40 max-w-[640px] bg-gris motion-safe:animate-pulse lg:col-start-1 lg:row-start-2"
            aria-label="Cargando tu pedido"
          />
        ) : vacio ? (
          <div className="mt-8 max-w-[640px] border-t border-linea pt-6 lg:col-start-1 lg:row-start-2">
            <p className="text-lg leading-relaxed">
              {agotadas.length > 0
                ? 'Lo que tienes en el carrito está agotado por ahora, así que no hay nada que pedir.'
                : 'Tu carrito está vacío.'}
            </p>
            <Link href="/" className="btn-primary mt-6">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <>
            <section
              aria-labelledby="resumen-titulo"
              className="mt-8 bg-gris p-5 md:p-6 lg:sticky lg:top-[92px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0"
            >
              <h2 id="resumen-titulo" className="titulo-bloque text-[40px] md:text-[44px]">
                Resumen
              </h2>
              <dl className="mt-4 border-t border-linea-fuerte">
                {resumen.disponibles.map((l) => {
                  const opciones = coloresDisponibles(l.product)
                  const color = colorDe(l)
                  // Si el color guardado ya no es uno de los del producto, no se muestra y se vuelve a pedir
                  const guardado = colorValido(l)
                  const errorAqui = claveErrorColor === l.clave
                  return (
                    // En un <dl>, cada grupo es un <div> con <dt> y <dd> como hijos directos: el color va en otro <dd>
                    <div
                      key={l.clave}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-linea-fuerte py-3.5"
                    >
                      <dt className="min-w-0 font-semibold leading-snug">
                        {l.product.name.trim()}
                        <span className="block text-sm font-normal text-tinta-2">
                          {l.quantity} × {soles(l.price.amount)}
                          {guardado ? ` · ${guardado}` : ''}
                        </span>
                      </dt>
                      <dd className="text-right font-semibold tabular-nums">{soles(l.lineTotal)}</dd>
                      {opciones.length > 0 && !guardado && (
                        <dd className="col-span-2">
                          <label className="mt-3 flex items-center justify-between gap-4 text-[15px] font-semibold">
                            Color
                            <select
                              id={`color-${l.clave}`}
                              value={color ?? ''}
                              required
                              aria-invalid={error?.campo === 'color' && !color ? true : undefined}
                              aria-describedby={errorAqui ? 'error-color' : undefined}
                              onChange={(e) => {
                                setColores((c) => ({ ...c, [l.clave]: e.target.value }))
                                if (errorAqui) setError(null)
                              }}
                              className="min-h-[44px] border border-linea-fuerte bg-white px-3 text-base font-normal text-tinta hover:border-tinta focus:border-tinta aria-[invalid=true]:border-2 aria-[invalid=true]:border-tinta"
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
                          {errorAqui && error ? (
                            <MensajeError id="error-color" className="justify-end text-right">
                              {error.mensaje}
                            </MensajeError>
                          ) : null}
                        </dd>
                      )}
                    </div>
                  )
                })}
                {resumen.combo.descuento > 0 && (
                  <>
                    <div className={fila}>
                      <dt className="text-tinta-2">Subtotal</dt>
                      <dd className="tabular-nums">{soles(resumen.combo.subtotal)}</dd>
                    </div>
                    <div className={fila}>
                      <dt>
                        <span className="etiqueta">Combo 10%</span>
                      </dt>
                      <dd className="font-semibold tabular-nums">−{soles(resumen.combo.descuento)}</dd>
                    </div>
                  </>
                )}
                <div className={fila}>
                  <dt className="font-bold">Total de productos</dt>
                  <dd className="num text-2xl leading-none">{soles(resumen.combo.total)}</dd>
                </div>
              </dl>
              {resumen.combo.descuento === 0 && resumen.hayProductosDelCombo && (
                <p className="mt-3 text-sm text-suave">Con {COMBO_MIN_UNITS} o más productos del combo tienes 10% menos.</p>
              )}
              {agotadas.map((l) => (
                <p key={l.clave} className="mt-3 text-sm text-tinta-2">
                  {l.product.name.trim()} está agotado y no va en tu pedido.
                </p>
              ))}
              {country !== 'PE' && (
                <p className="mt-3 text-sm text-tinta-2">Enviamos solo dentro del Perú: el pedido va en soles.</p>
              )}
              <Link
                href="/cart"
                className="mt-2 inline-flex min-h-[44px] items-center text-[15px] font-semibold underline underline-offset-[3px] hover:decoration-2"
              >
                Cambiar productos
              </Link>
            </section>

            <form
              ref={formulario}
              onSubmit={confirmar}
              onInput={alEscribir}
              className="mt-10 max-w-[640px] lg:col-start-1 lg:row-start-2"
            >
              <fieldset>
                <legend className={leyenda}>Tus datos</legend>
                <div className="mt-6">
                  <label className={etiqueta}>
                    Nombre y apellido
                    <input
                      name="nombre"
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="name"
                      aria-invalid={invalido('nombre')}
                      aria-describedby={describe('nombre')}
                      className={campo}
                    />
                  </label>
                  {errorDe('nombre')}
                  <label className={etiqueta}>
                    Correo
                    <input
                      name="correo"
                      type="email"
                      inputMode="email"
                      required
                      maxLength={120}
                      autoComplete="email"
                      placeholder="Ej.: tucorreo@gmail.com"
                      aria-invalid={invalido('correo')}
                      aria-describedby={describe('correo')}
                      className={campo}
                    />
                  </label>
                  {errorDe('correo')}
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
                      placeholder="Ej.: 987 654 321"
                      aria-invalid={invalido('whatsapp')}
                      aria-describedby={describe('whatsapp')}
                      className={campo}
                    />
                  </label>
                  {errorDe('whatsapp')}
                  <label className={etiqueta}>
                    DNI (opcional)
                    <input
                      name="dni"
                      inputMode="numeric"
                      maxLength={20}
                      autoComplete="off"
                      aria-invalid={invalido('dni')}
                      aria-describedby={describe('dni')}
                      className={campo}
                    />
                    <span className={ayuda}>O tu carné de extranjería.</span>
                  </label>
                  {errorDe('dni')}
                </div>
              </fieldset>

              <fieldset className="mt-12">
                <legend className={leyenda}>Entrega</legend>
                <div className="mt-6">
                  <label className={etiqueta}>
                    Distrito
                    <input
                      name="distrito"
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="address-level2"
                      placeholder="Ej.: Surco"
                      aria-invalid={invalido('distrito')}
                      aria-describedby={describe('distrito')}
                      className={campo}
                    />
                    <span className={ayuda}>Si no estás en Lima, pon también tu ciudad.</span>
                  </label>
                  {errorDe('distrito')}
                  <label className={etiqueta}>
                    Dirección
                    <input
                      name="direccion"
                      required
                      minLength={5}
                      maxLength={200}
                      autoComplete="street-address"
                      placeholder="Ej.: Av. Primavera 123, dpto. 401"
                      aria-invalid={invalido('direccion')}
                      aria-describedby={describe('direccion')}
                      className={campo}
                    />
                  </label>
                  {errorDe('direccion')}
                  <label className={etiqueta}>
                    Referencia (opcional)
                    <input
                      name="referencia"
                      maxLength={200}
                      autoComplete="off"
                      placeholder="Ej.: Frente al parque"
                      aria-invalid={invalido('referencia')}
                      aria-describedby={describe('referencia')}
                      className={campo}
                    />
                  </label>
                  {errorDe('referencia')}
                </div>
              </fieldset>

              <fieldset className="mt-12">
                <legend className={leyenda}>Envío</legend>
                <div className="mt-6 grid gap-2">
                  {envios.map((e) => (
                    <label key={e.metodo} className={opcion}>
                      <input
                        type="radio"
                        name="envio"
                        value={e.metodo}
                        checked={envio === e.metodo}
                        onChange={() => setEnvio(e.metodo)}
                        className="peer sr-only"
                      />
                      <span aria-hidden className={circulo} />
                      <span className="col-start-2 row-start-1 font-bold leading-snug">{e.nombre}</span>
                      <span className="col-start-2 row-start-2 text-sm text-suave">{e.plazo}</span>
                      <span className="num col-start-3 row-span-2 row-start-1 text-right text-xl leading-none">
                        {envioMonto(e)}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-suave">
                  {pagoEnLinea && pago === 'mercadopago'
                    ? 'Es la tarifa que pagas. Si tu distrito tuviera otro costo, te avisamos antes de enviar y no se cobra nada que no aceptes.'
                    : 'Si tu distrito tuviera otro costo, te avisamos por WhatsApp antes de cobrarte.'}
                </p>
              </fieldset>

              {pagoEnLinea && (
                <fieldset className="mt-12">
                  <legend className={leyenda}>Pago</legend>
                  <div className="mt-6 grid gap-2">
                    {(
                      [
                        { valor: 'mercadopago', titulo: 'Pagar ahora con Mercado Pago', nota: 'Yape, tarjeta y más' },
                        { valor: 'whatsapp', titulo: 'Coordinar el pago por WhatsApp', nota: 'Te escribimos para confirmar el envío y cómo pagar' },
                      ] as const
                    ).map((o) => (
                      <label key={o.valor} className={opcion}>
                        <input
                          type="radio"
                          name="pago"
                          value={o.valor}
                          checked={pago === o.valor}
                          onChange={() => setPago(o.valor)}
                          className="peer sr-only"
                        />
                        <span aria-hidden className={circulo} />
                        <span className="col-start-2 row-start-1 font-bold leading-snug">{o.titulo}</span>
                        <span className="col-start-2 row-start-2 text-sm text-suave">{o.nota}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <dl className="mt-12 border-t border-linea">
                <div className={filaBlanca}>
                  <dt className="text-tinta-2">Total de productos</dt>
                  <dd className="tabular-nums">{soles(resumen.combo.total)}</dd>
                </div>
                <div className={filaBlanca}>
                  <dt className="text-tinta-2">Envío {opcionEnvio?.nombre.toLowerCase()}</dt>
                  <dd className="tabular-nums">{opcionEnvio ? envioMonto(opcionEnvio) : '—'}</dd>
                </div>
                <div className={filaBlanca}>
                  <dt className="text-lg font-bold">Total</dt>
                  <dd className="num text-[32px] leading-none">{soles(totalConEnvio)}</dd>
                </div>
              </dl>

              <input name="sitio" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              {/* Los errores sin campo (stock, conexión…) van aquí, a la vista del botón; los de un campo, junto a él */}
              {errorGeneral && (
                <p role="alert" className="mt-6 flex items-start gap-1.5 text-[15px] font-semibold">
                  <AlertCircle className="mt-0.5 h-[18px] w-[18px] shrink-0" aria-hidden />
                  {errorGeneral.mensaje}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className={`btn-primary min-h-[58px] text-[17px] ${errorGeneral ? 'mt-3' : 'mt-6'}`}
              >
                {enviando ? 'Un momento…' : pagoEnLinea && pago === 'mercadopago' ? 'Confirmar y pagar' : 'Confirmar pedido'}
              </button>

              <AvisoDatos
                para="preparar y enviar tu pedido, y escribirte sobre él por WhatsApp o por correo"
                donde={
                  pagoEnLinea && pago === 'mercadopago'
                    ? 'Supabase y Vercel, y Mercado Pago recibe tu nombre y tu correo para cobrarte'
                    : undefined
                }
                className="mt-4"
              />
              <p className="mt-2 text-xs leading-relaxed text-suave">
                Al confirmar aceptas los{' '}
                <Link href={RUTAS.terminos} className="text-tinta underline underline-offset-2 hover:decoration-2">
                  Términos
                </Link>{' '}
                y la política de{' '}
                <Link href={RUTAS.cambios} className="text-tinta underline underline-offset-2 hover:decoration-2">
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

/** Un error junto a su campo: negro, en negrita y con el ícono de aviso (sin rojo, como pide la línea de la tienda). */
function MensajeError({ id, className = '', children }: { id: string; className?: string; children: React.ReactNode }) {
  return (
    <span id={id} className={`mt-2 flex items-start gap-1.5 text-sm font-semibold text-tinta ${className}`}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </span>
  )
}

/** Después de confirmar: el número del pedido y el botón para mandarlo por WhatsApp. */
function PedidoRecibido({ resultado }: { resultado: Resultado }) {
  const r = resultado.resumen
  const titulo = useRef<HTMLHeadingElement>(null)
  // «Confirmar pedido» desaparece al confirmar: el foco pasa al título para que se oiga «Pedido recibido»
  useEffect(() => {
    titulo.current?.focus({ preventScroll: true })
  }, [])
  return (
    <div className="contenedor pb-16 pt-6 md:pb-24 md:pt-10">
      <div className="max-w-[640px]">
        <h1 ref={titulo} tabIndex={-1} className="page-title outline-none">
          Pedido recibido
        </h1>

        <dl className="mt-8 border-t border-linea">
          <div className={filaBlanca}>
            <dt className="text-tinta-2">Número de pedido</dt>
            <dd className="num bg-accent px-2.5 py-1 text-2xl leading-none tracking-wide">{resultado.numero}</dd>
          </div>
          {r?.lineas.map((l, i) => (
            <div key={`${l.nombre}-${i}`} className={filaBlanca}>
              <dt className="min-w-0 font-semibold leading-snug">
                {l.nombre}
                <span className="block text-sm font-normal text-tinta-2">
                  {l.cantidad === 1 ? '1 unidad' : `${l.cantidad} unidades`}
                </span>
              </dt>
              <dd className="shrink-0 text-right tabular-nums">{soles(l.total)}</dd>
            </div>
          ))}
          {r && r.descuentoCombo > 0 && (
            <div className={filaBlanca}>
              <dt>
                <span className="etiqueta">Combo 10%</span>
              </dt>
              <dd className="font-semibold tabular-nums">−{soles(r.descuentoCombo)}</dd>
            </div>
          )}
          {r && (
            <>
              <div className={filaBlanca}>
                <dt className="text-tinta-2">
                  Envío {r.envio.nombre.toLowerCase()}
                  {/* «Gratis de referencia» se contradice: el aviso va solo cuando el envío tiene costo */}
                  {r.envio.monto > 0 ? <span className="block text-sm text-suave">de referencia</span> : null}
                </dt>
                <dd className="tabular-nums">{envioMonto(r.envio)}</dd>
              </div>
              <div className={filaBlanca}>
                <dt className="text-lg font-bold">Total</dt>
                <dd className="num text-[32px] leading-none">{soles(r.total)}</dd>
              </div>
            </>
          )}
        </dl>

        {resultado.sinMercadoPago && (
          <p className="mt-8 text-[17px] leading-relaxed">
            No pudimos abrir Mercado Pago. Tu pedido igual quedó registrado: coordinamos el pago por WhatsApp.
          </p>
        )}
        <p className="mt-8 text-[17px] leading-relaxed">
          Mándanos tu pedido por WhatsApp para terminar. Ya va escrito con tu número de pedido.
        </p>
        <a href={resultado.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 min-h-[58px] text-[17px]">
          <IconoWhatsapp />
          Enviar pedido por WhatsApp
        </a>
        <p className="mt-3 text-center text-sm text-tinta-2">Te confirmamos el envío y cómo pagar.</p>

        <Link
          href="/"
          className="mt-8 flex min-h-[44px] items-center justify-center text-[15px] font-semibold underline underline-offset-[3px] hover:decoration-2"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  )
}
