// Aplica un pago de Mercado Pago a su pedido: lo consulta a la API con el token (GET /v1/payments/{id}) y, si está
// aprobado, es de ese pedido, en soles y por el mismo monto al céntimo, marca el pedido pagado (decidirPago en
// shared/lib/mercadopago.ts). Si el monto no coincide, no lo marca y deja un aviso para revisarlo a mano.
// Lo usan el webhook (/api/mercadopago/webhook) y la vuelta del pago (/checkout/success).
// No es una ruta: Next solo sirve los archivos route.ts.
import { getOrderById, insertAdminNotification, updateOrder } from '@/shared/lib/data-store'
import { consultarPago, decidirPago, type DecisionPago } from '@/shared/lib/mercadopago'

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
    await insertAdminNotification({
      type: 'order_manual_review',
      severity: 'warning',
      title: `Revisa el pago del pedido ${pedido.id}`,
      body: `Mercado Pago aprobó el pago N.º ${pago.id}, pero no cuadra: ${decision.motivo}. El pedido no se marcó pagado.`,
      link: `/admin/orders/${pedido.id}`,
      entityType: 'order',
      entityId: pedido.id,
    }).catch(() => null)
  }

  return { ...decision, pedidoId: pedido?.id ?? '' }
}
