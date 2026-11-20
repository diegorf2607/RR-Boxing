// Enlaces de WhatsApp de RR Boxing. Un solo número para toda la web.
// Se puede cambiar con NEXT_PUBLIC_WHATSAPP_PHONE (solo dígitos, con el 51 de Perú).

const NUMERO_POR_DEFECTO = '51986964194'

export const WHATSAPP_NUMERO =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, '') || NUMERO_POR_DEFECTO

/** «51986964194» → «986 964 194», para mostrarlo en pantalla. */
export const WHATSAPP_LEGIBLE = WHATSAPP_NUMERO.startsWith('51') && WHATSAPP_NUMERO.length === 11
  ? `${WHATSAPP_NUMERO.slice(2, 5)} ${WHATSAPP_NUMERO.slice(5, 8)} ${WHATSAPP_NUMERO.slice(8)}`
  : `+${WHATSAPP_NUMERO}`

/** Enlace wa.me con el mensaje ya escrito. */
export function enlaceWhatsapp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`
}

export interface LineaPedidoWhatsapp {
  nombre: string
  cantidad: number
  /** Total de la línea ya con formato de moneda, por ejemplo «S/ 124.99». */
  total: string
}

export interface PedidoWhatsapp {
  lineas: LineaPedidoWhatsapp[]
  /** Subtotal de productos con formato de moneda. */
  subtotal: string
  /** Descuento del combo con formato de moneda; vacío si no aplica. */
  descuento?: string
  /** Total de productos después del descuento, con formato de moneda. */
  total: string
  /** Preguntas para que la persona complete (por ejemplo, el color); van después de «Mi correo:». */
  preguntas?: string[]
}

/**
 * Mensaje para pedir por WhatsApp con el carrito ya escrito. Deja líneas para que la
 * persona complete su nombre, su correo y el distrito, así RR tiene los datos antes de cobrar.
 */
export function mensajePedidoWhatsapp(pedido: PedidoWhatsapp): string {
  const lineas = pedido.lineas.map((l) => `• ${l.cantidad} × ${l.nombre}: ${l.total}`)
  const partes = [
    'Hola, RR Boxing. Quiero hacer este pedido:',
    '',
    ...lineas,
    '',
    `Subtotal: ${pedido.subtotal}`,
    ...(pedido.descuento ? [`Combo 10%: −${pedido.descuento}`] : []),
    `Total de productos: ${pedido.total}`,
    '',
    'Mi nombre:',
    'Mi correo:',
    ...(pedido.preguntas ?? []),
    'Distrito y dirección de envío:',
    '',
    '¿Me confirman el envío y cómo pago?',
  ]
  return partes.join('\n')
}
