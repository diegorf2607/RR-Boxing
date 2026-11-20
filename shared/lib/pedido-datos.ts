// Los datos de un pedido que no tienen columna en `orders`: WhatsApp, DNI, distrito, dirección, referencia, envío
// elegido, forma de pago, colores, origen de la visita y los montos del combo. No se pueden crear tablas en el
// Supabase de RR, así que van en `admin_notifications`:
//   type pedido_datos · entity_type order · entity_id = id del pedido · body = estos datos en JSON
//   read_at ya marcado (no es un aviso): el listado de avisos del panel no los muestra (shared/lib/data-store.ts).
// `internal_notes` del pedido queda libre para Richard.
// Las ventas que Richard registra a mano en el panel (/admin/ventas) también dejan un pedido_datos, con menos campos
// y su propia forma de pago en texto («Yape», «Efectivo»…): por eso al leer casi todo es opcional.
// Solo para el servidor (usa la clave de servicio).
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'
import { limpiarOrigen, type Origen } from '@/shared/lib/origen'
import type { CheckoutShippingMethod, OpcionEnvio, PedidoCalculado } from '@/shared/lib/cart-checkout'
import { formatCurrency } from '@/shared/lib/country'

export const TIPO_PEDIDO_DATOS = 'pedido_datos'
const TABLA = 'admin_notifications'

export type FormaPago = 'whatsapp' | 'mercadopago'

/** Para el panel y los avisos */
export const FORMA_PAGO_TEXTO: Record<FormaPago, string> = {
  whatsapp: 'Por WhatsApp',
  mercadopago: 'Mercado Pago',
}

/** «whatsapp» → «Por WhatsApp»; una forma escrita en el panel («Yape») queda tal cual. */
export const formaPagoTexto = (forma: string) => (forma in FORMA_PAGO_TEXTO ? FORMA_PAGO_TEXTO[forma as FormaPago] : forma)

export interface PedidoDatos {
  version: 1
  /** «web» (/checkout) o «panel» (venta registrada a mano en /admin/ventas) */
  canal: 'web' | 'panel'
  /** Solo dígitos, con el código del país (51… en Perú); vacío si no se sabe */
  whatsapp: string
  dni: string | null
  distrito: string | null
  direccion: string | null
  referencia: string | null
  /** El envío elegido en /checkout; null en una venta del panel */
  envio: OpcionEnvio | null
  /** «whatsapp» o «mercadopago» desde /checkout; en una venta del panel, lo que se escribió («Yape», «Efectivo»…) */
  formaPago: FormaPago | string
  /** Los productos que se pidieron con color */
  colores: { producto: string; color: string; cantidad: number }[]
  origen: Origen | null
  /** Los montos que calculó el servidor en /checkout; null en una venta del panel */
  montos: { subtotal: number; descuentoCombo: number; totalProductos: number; envio: number; total: number } | null
  /** Huella de la conexión (sha256 con sal, no la IP): sirve para el límite de pedidos por hora */
  huella?: string
}

// Sin los tipos de la base (como insertAdminNotification en data-store.ts)
const db = () => getSupabaseAdmin() as any

const METODOS: CheckoutShippingMethod[] = ['standard', 'express', 'urgent']
const numero = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const texto = (v: unknown, max = 200) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)

/** Lee el body guardado. null si no se entiende (una fila rota no tumba el panel). */
export function leerCuerpoPedidoDatos(body: string | null | undefined): PedidoDatos | null {
  if (!body) return null
  let d: Record<string, unknown>
  try {
    const crudo = JSON.parse(body)
    if (!crudo || typeof crudo !== 'object') return null
    d = crudo as Record<string, unknown>
  } catch {
    return null
  }
  const envio = d.envio && typeof d.envio === 'object' ? (d.envio as Record<string, unknown>) : null
  const metodo = METODOS.includes(envio?.metodo as CheckoutShippingMethod) ? (envio?.metodo as CheckoutShippingMethod) : null
  const montos = d.montos && typeof d.montos === 'object' ? (d.montos as Record<string, unknown>) : null
  return {
    version: 1,
    canal: d.canal === 'panel' ? 'panel' : 'web',
    whatsapp: texto(d.whatsapp, 30)?.replace(/\D/g, '') ?? '',
    dni: texto(d.dni, 20),
    distrito: texto(d.distrito, 80),
    direccion: texto(d.direccion),
    referencia: texto(d.referencia),
    envio:
      envio && metodo
        ? {
            metodo,
            nombre: texto(envio.nombre, 40) ?? metodo,
            plazo: texto(envio.plazo, 60) ?? '',
            monto: numero(envio.monto),
          }
        : null,
    formaPago: texto(d.formaPago, 80) ?? 'whatsapp',
    colores: Array.isArray(d.colores)
      ? d.colores.flatMap((c) => {
          const x = (c ?? {}) as Record<string, unknown>
          const producto = texto(x.producto, 120)
          const color = texto(x.color, 40)
          return producto && color ? [{ producto, color, cantidad: numero(x.cantidad) }] : []
        })
      : [],
    origen: limpiarOrigen(d.origen),
    montos: montos
      ? {
          subtotal: numero(montos.subtotal),
          descuentoCombo: numero(montos.descuentoCombo),
          totalProductos: numero(montos.totalProductos),
          envio: numero(montos.envio),
          total: numero(montos.total),
        }
      : null,
    ...(texto(d.huella, 40) ? { huella: texto(d.huella, 40) as string } : {}),
  }
}

/** Guarda los datos de un pedido. Lanza si no se pudo. */
export async function guardarPedidoDatos(pedidoId: string, datos: PedidoDatos): Promise<void> {
  const { error } = await db()
    .from(TABLA)
    .insert({
      type: TIPO_PEDIDO_DATOS,
      severity: 'info',
      title: `Datos del pedido ${pedidoId}`,
      body: JSON.stringify(datos),
      link: `/admin/orders/${pedidoId}`,
      entity_type: 'order',
      entity_id: pedidoId,
      read_at: new Date().toISOString(),
    })
  if (error) throw new Error(`pedido_datos: ${error.message}`)
}

/** Los datos de un pedido (la última fila, si hubiera más de una), o null. */
export async function leerPedidoDatos(pedidoId: string): Promise<PedidoDatos | null> {
  try {
    const { data, error } = await db()
      .from(TABLA)
      .select('body,created_at')
      .eq('type', TIPO_PEDIDO_DATOS)
      .eq('entity_type', 'order')
      .eq('entity_id', pedidoId)
      .order('created_at', { ascending: false })
      .limit(1)
    if (error || !Array.isArray(data) || !data[0]) return null
    return leerCuerpoPedidoDatos((data[0] as { body: string | null }).body)
  } catch {
    return null
  }
}

/** Los datos de los últimos pedidos, por id de pedido. Si falla, vacío: el listado se ve igual, sin esos datos. */
export async function leerVariosPedidoDatos(limite = 500): Promise<Record<string, PedidoDatos>> {
  try {
    const { data, error } = await db()
      .from(TABLA)
      .select('entity_id,body,created_at')
      .eq('type', TIPO_PEDIDO_DATOS)
      .eq('entity_type', 'order')
      .order('created_at', { ascending: false })
      .limit(limite)
    if (error || !Array.isArray(data)) return {}
    const salida: Record<string, PedidoDatos> = {}
    for (const fila of data as { entity_id: string | null; body: string | null }[]) {
      // Vienen del más nuevo al más viejo: se queda la primera de cada pedido
      if (!fila.entity_id || salida[fila.entity_id]) continue
      const datos = leerCuerpoPedidoDatos(fila.body)
      if (datos) salida[fila.entity_id] = datos
    }
    return salida
  } catch {
    return {}
  }
}

/**
 * Pedidos de la última hora: todos o los de una huella. Si el conteo falla, 0: no se bloquea a nadie.
 * La huella va dentro del body (entity_type es «order»), así que con huella se leen los datos de la última hora
 * (como mucho 500: en una hora no llegan tantos pedidos de verdad) y se cuentan aquí.
 */
export async function pedidosUltimaHora(huella?: string): Promise<number> {
  const desde = new Date(Date.now() - 3_600_000).toISOString()
  try {
    if (!huella) {
      const { count, error } = await db()
        .from(TABLA)
        .select('id', { count: 'exact', head: true })
        .eq('type', TIPO_PEDIDO_DATOS)
        .gte('created_at', desde)
      return error ? 0 : count ?? 0
    }
    const { data, error } = await db()
      .from(TABLA)
      .select('body')
      .eq('type', TIPO_PEDIDO_DATOS)
      .gte('created_at', desde)
      .order('created_at', { ascending: false })
      .limit(500)
    if (error || !Array.isArray(data)) return 0
    return (data as { body: string | null }[]).filter((f) => leerCuerpoPedidoDatos(f.body)?.huella === huella).length
  } catch {
    return 0
  }
}

const soles = (n: number) => formatCurrency(n, 'PEN', 'es-PE')

/** «Express, 24 a 48 horas · S/ 9.90» o «Estándar, 2 a 3 días hábiles · gratis» */
export const envioTexto = (e: OpcionEnvio) => `${e.nombre}, ${e.plazo.charAt(0).toLowerCase()}${e.plazo.slice(1)} · ${e.monto > 0 ? soles(e.monto) : 'gratis'}`

/** Las líneas del pedido y sus montos, para el mensaje de WhatsApp y los correos. */
export function resumenTexto(p: Pick<PedidoCalculado, 'lineas' | 'subtotal' | 'descuentoCombo' | 'totalProductos' | 'envio' | 'total'>): string[] {
  return [
    ...p.lineas.map((l) => `• ${l.cantidad} × ${l.nombre}: ${soles(l.total)}`),
    '',
    ...(p.descuentoCombo > 0 ? [`Subtotal: ${soles(p.subtotal)}`, `Combo 10%: −${soles(p.descuentoCombo)}`] : []),
    `Total de productos: ${soles(p.totalProductos)}`,
    `Envío: ${envioTexto(p.envio)} (de referencia)`,
    `Total: ${soles(p.total)}`,
  ]
}

/** El mensaje que la persona manda por WhatsApp después de confirmar el pedido. */
export function mensajeWhatsappPedido(
  pedidoId: string,
  p: Parameters<typeof resumenTexto>[0],
  datos: { nombre: string; distrito: string; direccion: string; referencia: string | null },
  formaPago: FormaPago
): string {
  return [
    `Hola, RR Boxing. Hice el pedido ${pedidoId} en la web:`,
    '',
    ...resumenTexto(p),
    '',
    `Nombre: ${datos.nombre}`,
    `Distrito: ${datos.distrito}`,
    `Dirección: ${datos.direccion}`,
    ...(datos.referencia ? [`Referencia: ${datos.referencia}`] : []),
    '',
    formaPago === 'mercadopago' ? 'Lo pagué con Mercado Pago. ¿Me confirman el envío?' : '¿Me confirman el envío y cómo pago?',
  ].join('\n')
}
