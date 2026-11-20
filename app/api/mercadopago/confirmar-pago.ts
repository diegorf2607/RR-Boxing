// Aplica un pago de Mercado Pago a su pedido: lo consulta a la API con el token (GET /v1/payments/{id}) y, si está
// aprobado, es de ese pedido, en soles y por el mismo monto al céntimo, marca el pedido pagado (decidirPago en
// shared/lib/mercadopago.ts). Si el monto no coincide, no lo marca y deja un aviso para revisarlo a mano.
// Lo usan el webhook (/api/mercadopago/webhook) y la vuelta del pago (/checkout/success).
// No es una ruta: Next solo sirve los archivos route.ts.
import { getOrderById, insertAdminNotification, updateOrder } from '@/shared/lib/data-store'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'
import { consultarPago, decidirPago, type DecisionPago } from '@/shared/lib/mercadopago'

/** ¿Ya hay un aviso de este tipo para el pedido que mencione este texto? Evita repetir avisos en cada reintento. */
async function yaAvisado(pedidoId: string, tipo: string, texto: string): Promise<boolean> {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from('admin_notifications')
    .select('body')
    .eq('type', tipo)
    .eq('entity_id', pedidoId)
    .limit(200)
  if (error) return false
  return ((data ?? []) as { body: string | null }[]).some((f) => (f.body ?? '').includes(texto))
}

export async function confirmarPagoMercadoPago(pagoId: string): Promise<DecisionPago & { pedidoId: string }> {
  const pago = await consultarPago(pagoId)
  const pedido = pago.pedidoId ? await getOrderById(pago.pedidoId) : null
  const decision = decidirPago(pago, pedido)

  if (decision.accion === 'marcar_pagado' && pedido) {
    await updateOrder(pedido.id, {
      paymentStatus: 'paid',
      paymentMethod: 'mercadopago',
      // Si Richard ya lo movió (en proceso, enviado…), el estado se queda donde está
      ...(pedido.status === 'pending' ? { status: 'paid' as const } : {}),
    })
    await insertAdminNotification({
      type: 'order_paid',
      severity: 'info',
      title: `Pedido ${pedido.id} pagado con Mercado Pago`,
      body: `S/ ${pedido.totalAmount.toFixed(2)} · pago N.º ${pago.id}`,
      link: `/admin/orders/${pedido.id}`,
      entityType: 'order',
      entityId: pedido.id,
    }).catch(() => null)
  } else if (decision.accion === 'revisar' && pedido) {
    const texto = `pago N.º ${pago.id} (${pago.estado})`
    if (!(await yaAvisado(pedido.id, 'order_manual_review', texto))) {
      await insertAdminNotification({
        type: 'order_manual_review',
        severity: 'warning',
        title: `Revisa el pago del pedido ${pedido.id}`,
        body: `Mercado Pago, ${texto}: ${decision.motivo}. Revísalo antes de enviar el pedido.`,
        link: `/admin/orders/${pedido.id}`,
        entityType: 'order',
        entityId: pedido.id,
      }).catch(() => null)
    }
  } else if (decision.accion === 'ya_pagado' && pedido && pago.estado === 'approved') {
    // Otro pago aprobado para un pedido ya pagado (pagó dos veces, o Richard ya lo había marcado pagado a mano)
    const yaAplicado = await yaAvisado(pedido.id, 'order_paid', `N.º ${pago.id}`)
    const texto = `pago N.º ${pago.id} (otro pago)`
    if (!yaAplicado && !(await yaAvisado(pedido.id, 'order_manual_review', texto))) {
      await insertAdminNotification({
        type: 'order_manual_review',
        severity: 'warning',
        title: `Posible cobro doble en el pedido ${pedido.id}`,
        body: `Mercado Pago aprobó otro pago (${texto}) por S/ ${Number.isFinite(pago.monto) ? pago.monto.toFixed(2) : '?'} para un pedido que ya estaba pagado. Revisa si hay que devolverlo.`,
        link: `/admin/orders/${pedido.id}`,
        entityType: 'order',
        entityId: pedido.id,
      }).catch(() => null)
    }
  }

  return { ...decision, pedidoId: pedido?.id ?? '' }
}
