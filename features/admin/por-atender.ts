// Qué pedidos tiene que atender Richard: los que falta cobrar y los de la web ya pagados que falta enviar. Lo usan el
// listado de /admin/orders (filtro «Por atender») y el panel (/admin), para que los dos cuenten lo mismo.
import type { Order } from '@/shared/types/commerce'

type PedidoMinimo = Pick<Order, 'id' | 'status' | 'paymentStatus'>

/**
 * Los pedidos de la web llevan el código RR-… (app/api/pedido). Las ventas registradas a mano en /admin/ventas
 * (ord_…) ya se cerraron fuera de la web: si están pagadas, no se dan por pendientes de envío.
 */
export const esDeLaWeb = (id: string) => id.startsWith('RR-')

/** «Falta el pago» o «Falta enviarlo»; null si el pedido ya no necesita nada (enviado, entregado o cancelado). */
export function queFalta(o: PedidoMinimo): string | null {
  if (o.status === 'cancelled' || o.status === 'shipped' || o.status === 'delivered') return null
  if (o.paymentStatus === 'refunded') return null
  if (o.paymentStatus !== 'paid') return 'Falta el pago'
  return esDeLaWeb(o.id) ? 'Falta enviarlo' : null
}

export const porAtender = (o: PedidoMinimo): boolean => queFalta(o) !== null
