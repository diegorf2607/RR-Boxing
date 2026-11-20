// POST /api/admin/orders/[id]/pagado (solo el panel): marca como pagado un pedido que ya existe, con la forma en que
// pagó (Yape, Plin, transferencia, efectivo u otro). Es para los pedidos de la web (RR-…) que se pagan por WhatsApp:
// así no se registra en /admin/ventas un pedido nuevo y la venta no se cuenta dos veces.
// Deja payment_status en paid, payment_method con la forma de pago y, si estaba pendiente, el estado en paid (si
// Richard ya lo movió a «en proceso» o «enviado», se queda ahí, como con Mercado Pago). Deja un aviso order_paid.
// Body: { formaPago, formaPagoOtra? }. Responde { order } o { error, campo } (400), 401, 404, 409.
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import { getOrderById, insertAdminNotification } from '@/shared/lib/data-store'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'
import { formatCurrency } from '@/shared/lib/country'
import { FORMAS_DE_PAGO } from '@/app/admin/ventas/opciones'

export const dynamic = 'force-dynamic'

const schema = z.object({
  formaPago: z.enum(FORMAS_DE_PAGO.map((f) => f.valor) as [string, ...string[]]),
  formaPagoOtra: z.string().trim().max(40).optional(),
})

/** Los estados de pago desde los que se puede marcar pagado: sin pagar, o un intento de pago que falló */
const SE_PUEDE_MARCAR = ['unpaid', 'failed']

export async function POST(req: Request, { params }: { params: { id: string } }) {
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
    return NextResponse.json({ error: 'Elige cómo te pagó', campo: 'formaPago' }, { status: 400 })
  }
  const { formaPago, formaPagoOtra } = parsed.data

  const pedido = await getOrderById(params.id)
  if (!pedido) return NextResponse.json({ error: 'No encontramos ese pedido' }, { status: 404 })
  if (pedido.paymentStatus === 'paid') {
    return NextResponse.json({ error: 'Este pedido ya figura como pagado.' }, { status: 409 })
  }
  if (pedido.status === 'cancelled') {
    return NextResponse.json(
      { error: 'Este pedido está cancelado. Si sí lo pagó, primero cámbialo de estado más abajo.' },
      { status: 409 }
    )
  }
  if (!SE_PUEDE_MARCAR.includes(pedido.paymentStatus)) {
    return NextResponse.json(
      { error: 'Este pedido tiene un reembolso registrado. Cambia el estado de pago a mano más abajo.' },
      { status: 409 }
    )
  }

  const forma = FORMAS_DE_PAGO.find((f) => f.valor === formaPago)
  // Lo mismo que guarda /admin/ventas: «Yape», «Efectivo», «Otro: …»
  const formaTexto = formaPago === 'otro' && formaPagoOtra ? `Otro: ${formaPagoOtra}` : (forma?.texto ?? formaPago)

  // Se actualiza solo si nadie lo cambió desde que se leyó (dos toques seguidos, o Mercado Pago justo a la vez):
  // así no quedan dos avisos ni se pisa un estado nuevo.
  const { data, error } = await (getSupabaseAdmin() as any)
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_method: formaTexto,
      ...(pedido.status === 'pending' ? { status: 'paid' } : {}),
    })
    .eq('id', pedido.id)
    .eq('payment_status', pedido.paymentStatus)
    .eq('status', pedido.status)
    .select('id')
  if (error) {
    console.error('admin/pagado: no se pudo actualizar el pedido', pedido.id, error.message)
    return NextResponse.json({ error: 'No se pudo guardar. Prueba otra vez.' }, { status: 500 })
  }
  if (!Array.isArray(data) || data.length === 0) {
    return NextResponse.json({ error: 'El pedido cambió mientras tanto. Recarga la página y revísalo.' }, { status: 409 })
  }

  await insertAdminNotification({
    type: 'order_paid',
    severity: 'info',
    title: `Pedido ${pedido.id} pagado (${formaTexto})`,
    body: `${formatCurrency(pedido.totalAmount, pedido.currency, 'es-PE')} · marcado como pagado en el panel por ${session.email}`,
    link: `/admin/orders/${pedido.id}`,
    entityType: 'order',
    entityId: pedido.id,
  }).catch((e) => console.error('admin/pagado: no se dejó el aviso', pedido.id, e instanceof Error ? e.message : 'error'))

  return NextResponse.json({ order: await getOrderById(pedido.id) })
}
