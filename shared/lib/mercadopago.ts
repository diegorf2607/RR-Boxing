// Mercado Pago (Checkout Pro) por su API REST, sin SDK. Modelo: Longev (lib/tienda/mercadopago.ts).
// Solo para el servidor (lee el token). No importa nada con «@/»: así se prueba suelto, con un fetch simulado.
//
// Está listo pero apagado: sin MERCADOPAGO_ACCESS_TOKEN no se ofrece en /checkout y no se llama a Mercado Pago.
// Para prenderlo (lo hace Diego):
//   1. En https://www.mercadopago.com.pe/developers/panel/app crea una aplicación de «Checkout Pro» con la cuenta de
//      vendedor de RR Boxing y copia el Access Token de PRODUCCIÓN (empieza con APP_USR-).
//   2. En Vercel → Settings → Environment Variables:
//        MERCADOPAGO_ACCESS_TOKEN    el Access Token de producción (con esto solo, /checkout ya ofrece pagar).
//        MERCADOPAGO_WEBHOOK_SECRET  opcional: la «clave secreta» de Webhooks de esa aplicación. Si está, se revisa la
//                                    firma de cada aviso que la traiga; igual, el pago siempre se confirma consultándolo a la API.
//        NEXT_PUBLIC_APP_URL         https://www.rrboxing.com (para las direcciones de vuelta y de avisos).
//   3. En la aplicación de Mercado Pago → Webhooks: https://www.rrboxing.com/api/mercadopago/webhook, evento «Pagos».
//      (Cada preferencia manda también notification_url, así que llega aunque no lo configures ahí.)
//   4. Vuelve a publicar y haz una compra pequeña de verdad: en /admin/orders el pedido debe pasar a «Cobrado».
//   5. Antes de prenderlo, revisa los Términos: hoy dicen que el envío se confirma por WhatsApp antes de cobrar.
// Qué hace:
//   - crearPreferencia: un cobro por el pedido, en soles: los productos (ya con el combo) en una línea y el envío en
//     otra, así el total es exactamente el del pedido. external_reference = id del pedido. Vuelve a /checkout/success
//     o /checkout/error, y avisa a /api/mercadopago/webhook.
//   - consultarPago: lee el pago en GET /v1/payments/{id} con el token (nunca se confía en lo que trae el aviso).
//   - decidirPago: con el pago y el pedido, qué hacer: marcarlo pagado solo si está aprobado, es de ese pedido, en
//     soles y por el mismo monto al céntimo; si el monto no coincide, aviso para revisarlo a mano.
// Lo que no se pudo probar sin token: la respuesta real de Mercado Pago. La lógica se probó con un fetch simulado.
import { createHmac, timingSafeEqual } from 'node:crypto'

const API = 'https://api.mercadopago.com'
type Fetch = typeof fetch

export const tokenMercadoPago = (): string | null => process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || null
export const mercadoPagoListo = (): boolean => !!tokenMercadoPago()

const redondear = (n: number) => Math.round(n * 100) / 100
const recortar = (texto: string, max: number) => (texto.length > max ? `${texto.slice(0, max - 1)}…` : texto)

export interface CobroPedido {
  /** El id del pedido (va como external_reference) */
  pedidoId: string
  /** «2 × Vendas para boxeo, 1 × Guantes de boxeo (Negro)» */
  detalle: string
  /** Productos ya con el combo */
  totalProductos: number
  envio: { nombre: string; monto: number }
  /** totalProductos + envío */
  total: number
  pagador: { nombre: string; correo: string }
}

/** El cuerpo de la preferencia de Checkout Pro. `sitio`: «https://www.rrboxing.com», sin barra al final. */
export function cuerpoPreferencia(c: CobroPedido, sitio: string): Record<string, unknown> {
  const base = sitio.replace(/\/+$/, '')
  const pedido = encodeURIComponent(c.pedidoId)
  const [nombre, ...resto] = c.pagador.nombre.trim().split(/\s+/)
  const items = [
    {
      id: c.pedidoId,
      title: recortar(`Pedido ${c.pedidoId}: ${c.detalle}`, 250),
      quantity: 1,
      currency_id: 'PEN',
      unit_price: redondear(c.totalProductos),
    },
    ...(c.envio.monto > 0
      ? [{ id: 'envio', title: `Envío ${c.envio.nombre.toLowerCase()}`, quantity: 1, currency_id: 'PEN', unit_price: redondear(c.envio.monto) }]
      : []),
  ]
  return {
    items,
    payer: { name: nombre, ...(resto.length ? { surname: resto.join(' ') } : {}), email: c.pagador.correo },
    external_reference: c.pedidoId,
    back_urls: {
      success: `${base}/checkout/success?pedido=${pedido}`,
      pending: `${base}/checkout/success?pedido=${pedido}&estado=pendiente`,
      failure: `${base}/checkout/error?pedido=${pedido}`,
    },
    // Mercado Pago vuelve solo a la tienda con un pago aprobado; con una dirección de prueba (http) no se pide
    ...(base.startsWith('https://') ? { auto_return: 'approved' } : {}),
    notification_url: `${base}/api/mercadopago/webhook`,
    statement_descriptor: 'RR BOXING',
    metadata: { pedido: c.pedidoId },
  }
}

/** Crea el cobro y devuelve la página de pago de Mercado Pago. Lanza si no hay token o si Mercado Pago no lo acepta. */
export async function crearPreferencia(c: CobroPedido, sitio: string, f: Fetch = fetch): Promise<{ id: string; url: string }> {
  const token = tokenMercadoPago()
  if (!token) throw new Error('Falta MERCADOPAGO_ACCESS_TOKEN')
  if (redondear(c.totalProductos + c.envio.monto) !== redondear(c.total)) throw new Error('El cobro no suma el total del pedido')
  const r = await f(`${API}/checkout/preferences`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': c.pedidoId },
    body: JSON.stringify(cuerpoPreferencia(c, sitio)),
    signal: AbortSignal.timeout(8000),
  })
  if (!r.ok) throw new Error(`Mercado Pago respondió ${r.status}`)
  const d = (await r.json().catch(() => ({}))) as { id?: unknown; init_point?: unknown }
  if (typeof d.init_point !== 'string' || !d.init_point.startsWith('https://')) {
    throw new Error('Mercado Pago no devolvió la página de pago')
  }
  return { id: typeof d.id === 'string' || typeof d.id === 'number' ? String(d.id) : '', url: d.init_point }
}

export interface PagoMercadoPago {
  id: string
  /** approved, pending, in_process, rejected, cancelled, refunded, charged_back… */
  estado: string
  /** external_reference: el id del pedido */
  pedidoId: string
  monto: number
  moneda: string
}

/** Lee un pago con el token. El id de un pago es un número: cualquier otra cosa se rechaza sin llamar a nadie. */
export async function consultarPago(id: string, f: Fetch = fetch): Promise<PagoMercadoPago> {
  const token = tokenMercadoPago()
  if (!token) throw new Error('Falta MERCADOPAGO_ACCESS_TOKEN')
  if (!/^\d{1,20}$/.test(id)) throw new Error('El id del pago no es válido')
  const r = await f(`${API}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  })
  if (!r.ok) throw new Error(`Mercado Pago respondió ${r.status}`)
  const d = (await r.json()) as {
    id?: number | string
    status?: string
    external_reference?: string | null
    transaction_amount?: number
    currency_id?: string
  }
  return {
    id: String(d.id ?? id),
    estado: d.status ?? 'desconocido',
    pedidoId: d.external_reference ?? '',
    monto: typeof d.transaction_amount === 'number' ? d.transaction_amount : Number.NaN,
    moneda: d.currency_id ?? '',
  }
}

export type DecisionPago =
  /** Aprobado, de ese pedido, en soles y por el mismo monto: se marca pagado */
  | { accion: 'marcar_pagado' }
  /** El pedido ya estaba pagado: no se hace nada (Mercado Pago avisa varias veces) */
  | { accion: 'ya_pagado' }
  /** Aprobado pero no cuadra (monto o moneda): no se marca; aviso para revisarlo a mano */
  | { accion: 'revisar'; motivo: string }
  /** Todavía no está aprobado (pendiente, rechazado…): no se hace nada */
  | { accion: 'nada'; motivo: string }

/** Qué hacer con un pago y su pedido. No toca nada: lo aplica app/api/mercadopago/confirmar-pago.ts. */
export function decidirPago(
  pago: PagoMercadoPago,
  pedido: { id: string; totalAmount: number; currency: string; paymentStatus: string } | null
): DecisionPago {
  if (!pedido) return { accion: 'nada', motivo: 'sin_pedido' }
  if (pago.pedidoId !== pedido.id) return { accion: 'nada', motivo: 'otro_pedido' }
  if (pedido.paymentStatus === 'paid') {
    // Un pago ya aplicado que después se devuelve, se reclama o se cancela: Richard tiene que saberlo antes de enviar
    if (['refunded', 'charged_back', 'cancelled', 'in_mediation'].includes(pago.estado)) {
      return { accion: 'revisar', motivo: `el pago quedó «${pago.estado}» en Mercado Pago` }
    }
    return { accion: 'ya_pagado' }
  }
  if (pago.estado !== 'approved') return { accion: 'nada', motivo: pago.estado }
  if (pago.moneda !== 'PEN' || pedido.currency !== 'PEN') return { accion: 'revisar', motivo: `moneda ${pago.moneda || '?'}` }
  if (!Number.isFinite(pago.monto) || Math.round(pago.monto * 100) !== Math.round(pedido.totalAmount * 100)) {
    return { accion: 'revisar', motivo: `pagó S/ ${Number.isFinite(pago.monto) ? pago.monto.toFixed(2) : '?'} y el pedido es S/ ${pedido.totalAmount.toFixed(2)}` }
  }
  return { accion: 'marcar_pagado' }
}

/**
 * Revisa la firma de un aviso (cabecera x-signature: «ts=…,v1=…»). El mensaje firmado es
 * «id:<data.id>;request-id:<x-request-id>;ts:<ts>;» con HMAC-SHA256 y la clave secreta de Webhooks.
 */
export function notificacionValida(
  firma: string | null,
  requestId: string | null,
  dataId: string,
  secreto: string | undefined
): boolean {
  if (!firma || !secreto) return false
  const partes = Object.fromEntries(
    firma.split(',').map((p) => {
      const [k, ...v] = p.trim().split('=')
      return [k, v.join('=')]
    })
  ) as Record<string, string | undefined>
  if (!partes.ts || !partes.v1) return false
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId
  const mensaje = `id:${id};${requestId ? `request-id:${requestId};` : ''}ts:${partes.ts};`
  const esperada = Buffer.from(createHmac('sha256', secreto).update(mensaje).digest('hex'))
  const recibida = Buffer.from(partes.v1)
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida)
}
