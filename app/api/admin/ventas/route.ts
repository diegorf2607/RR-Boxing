import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { appendOrder, getAdminProducts } from '@/shared/lib/data-store'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'
import { normalizarWhatsapp } from '@/shared/lib/clase-virtual'
import { limpiarOrigen } from '@/shared/lib/origen'
import { diaIso } from '@/shared/lib/plazos'
import { roundMoney } from '@/shared/lib/combo-promo'
import { getPriceForCountry } from '@/features/store/pricing'
import type { Order, OrderItem } from '@/shared/types/commerce'
import { FORMAS_DE_PAGO, ORIGENES_MANUALES } from '@/app/admin/ventas/opciones'

// Una venta que se cerró fuera de la web (por WhatsApp, en persona…): se registra desde /admin/ventas como un
// pedido ya pagado. El WhatsApp, la forma de pago y el origen van también en admin_notifications type pedido_datos
// (entity_id = id del pedido, read_at marcado: no es un aviso), como los pedidos de la web.

const DIA_MS = 24 * 60 * 60 * 1000

const schema = z.object({
  cliente: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(6).max(30),
  correo: z.union([z.literal(''), z.string().trim().toLowerCase().email().max(120)]).optional(),
  productos: z
    .array(z.object({ productId: z.string().min(1).max(100), cantidad: z.number().int().min(1).max(99) }))
    .min(1)
    .max(20),
  total: z.number().positive().max(100_000),
  formaPago: z.enum(FORMAS_DE_PAGO.map((f) => f.valor) as [string, ...string[]]),
  formaPagoOtra: z.string().trim().max(40).optional(),
  origen: z.union([z.literal(''), z.enum(ORIGENES_MANUALES.map((o) => o.valor) as [string, ...string[]])]).optional(),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  nota: z.string().trim().max(1000).optional(),
})

/** El instante del pedido: ahora si la venta es de hoy; si es de otro día, las 12:00 de Lima de ese día */
function fechaDelPedido(fecha: string | undefined, ahora: Date): { iso: string } | { error: string } {
  const hoy = diaIso(ahora)
  if (!fecha || fecha === hoy) return { iso: ahora.toISOString() }
  const t = Date.parse(`${fecha}T12:00:00-05:00`)
  if (Number.isNaN(t) || fecha > hoy) return { error: 'La fecha no puede ser de mañana en adelante' }
  if (ahora.getTime() - t > 366 * DIA_MS) return { error: 'La fecha es de hace más de un año' }
  return { iso: new Date(t).toISOString() }
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const campo = String(parsed.error.issues[0]?.path[0] ?? '')
    const textos: Record<string, string> = {
      cliente: 'Escribe el nombre del cliente',
      whatsapp: 'Escribe el WhatsApp del cliente',
      correo: 'El correo no parece válido',
      productos: 'Elige al menos un producto',
      total: 'Escribe el total que pagó',
      formaPago: 'Elige la forma de pago',
      fecha: 'Revisa la fecha',
    }
    return NextResponse.json({ error: textos[campo] ?? 'Revisa los datos', campo }, { status: 400 })
  }
  const d = parsed.data

  const whatsapp = normalizarWhatsapp(d.whatsapp)
  if (!whatsapp) {
    return NextResponse.json({ error: 'Ese número de WhatsApp no parece válido', campo: 'whatsapp' }, { status: 400 })
  }

  const ahora = new Date()
  const fecha = fechaDelPedido(d.fecha, ahora)
  if ('error' in fecha) return NextResponse.json({ error: fecha.error, campo: 'fecha' }, { status: 400 })

  // Las cantidades del mismo producto se juntan; el precio de cada línea es el del catálogo (en soles)
  const cantidades = new Map<string, number>()
  for (const p of d.productos) cantidades.set(p.productId, (cantidades.get(p.productId) ?? 0) + p.cantidad)
  const catalogo = await getAdminProducts()
  const items: OrderItem[] = []
  for (const [productId, quantity] of Array.from(cantidades)) {
    const producto = catalogo.find((p) => p.id === productId)
    if (!producto) {
      return NextResponse.json({ error: 'Uno de los productos ya no está en el catálogo', campo: 'productos' }, { status: 400 })
    }
    const precio = getPriceForCountry(producto, 'PE')
    items.push({
      productId,
      productName: producto.name,
      quantity,
      unitAmount: precio?.amount ?? 0,
      currency: 'PEN',
    })
  }

  const forma = FORMAS_DE_PAGO.find((f) => f.valor === d.formaPago)
  const formaTexto =
    d.formaPago === 'otro' && d.formaPagoOtra ? `Otro: ${d.formaPagoOtra}` : (forma?.texto ?? d.formaPago)
  const origen = d.origen ? limpiarOrigen({ fuente: d.origen, fecha: fecha.iso }) : null

  const order: Order = {
    id: `ord_${Date.now()}_${randomBytes(2).toString('hex')}`,
    customerEmail: d.correo ?? '',
    customerName: d.cliente,
    country: 'PE',
    items,
    totalAmount: roundMoney(d.total),
    currency: 'PEN',
    status: 'paid',
    paymentStatus: 'paid',
    paymentMethod: formaTexto,
    internalNotes: d.nota || null,
    createdAt: fecha.iso,
  }

  try {
    await appendOrder(order)
  } catch (e) {
    console.error('admin/ventas: no se pudo guardar el pedido', e instanceof Error ? e.message : 'error')
    return NextResponse.json({ error: 'No se pudo guardar la venta. Prueba otra vez.' }, { status: 500 })
  }

  // Los datos sin columna. Si esto falla, el pedido igual quedó: solo falta el WhatsApp y el origen.
  let datosGuardados = true
  const { error } = await (getSupabaseAdmin() as any).from('admin_notifications').insert({
    type: 'pedido_datos',
    severity: 'info',
    title: `Datos del pedido ${order.id}`,
    body: JSON.stringify({
      version: 1,
      canal: 'panel',
      whatsapp,
      formaPago: formaTexto,
      origen,
      registradoPor: session.email,
    }),
    link: `/admin/orders/${order.id}`,
    entity_type: 'order',
    entity_id: order.id,
    read_at: ahora.toISOString(),
  })
  if (error) {
    datosGuardados = false
    console.error('admin/ventas: no se guardaron los datos del pedido', error.message)
  }

  return NextResponse.json({ ok: true, id: order.id, datosGuardados })
}
