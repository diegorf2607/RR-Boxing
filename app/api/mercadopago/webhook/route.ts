// POST /api/mercadopago/webhook: los avisos de pago de Mercado Pago (Webhooks). Modelo: Longev (app/api/mercadopago).
// - Lo que no es un pago se acepta (200) y se ignora: Mercado Pago espera una respuesta rápida.
// - Si está MERCADOPAGO_WEBHOOK_SECRET, revisa la firma (x-signature); si no coincide, 401.
// - Nunca confía en el aviso: consulta el pago a la API con el token y lo aplica con confirmarPagoMercadoPago
//   (aprobado + mismo pedido + soles + mismo monto → pagado; si no cuadra, aviso para revisarlo a mano).
// - Sin MERCADOPAGO_ACCESS_TOKEN responde 503. Con un error responde 500 y Mercado Pago vuelve a avisar más tarde.
import { notificacionValida, mercadoPagoListo } from '@/shared/lib/mercadopago'
import { confirmarPagoMercadoPago } from '../confirmar-pago'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const cuerpo = (await req.json().catch(() => ({}))) as { type?: string; topic?: string; data?: { id?: string | number } }
  const tipo = cuerpo.type ?? cuerpo.topic ?? url.searchParams.get('type') ?? url.searchParams.get('topic')
  const dataId = String(url.searchParams.get('data.id') ?? cuerpo.data?.id ?? url.searchParams.get('id') ?? '')
  if (tipo !== 'payment' || !/^\d{1,20}$/.test(dataId)) return new Response(null, { status: 200 })

  const secreto = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim()
  if (secreto && !notificacionValida(req.headers.get('x-signature'), req.headers.get('x-request-id'), dataId, secreto)) {
    return new Response(null, { status: 401 })
  }
  if (!mercadoPagoListo()) return new Response(null, { status: 503 })

  try {
    const r = await confirmarPagoMercadoPago(dataId)
    console.info('mercadopago', JSON.stringify({ pago: dataId, pedido: r.pedidoId, accion: r.accion }))
    return new Response(null, { status: 200 })
  } catch (e) {
    console.error('mercadopago: no se pudo aplicar el pago', dataId, e instanceof Error ? e.message : 'error')
    return new Response(null, { status: 500 })
  }
}
