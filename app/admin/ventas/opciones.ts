// Las opciones del formulario de ventas a mano (/admin/ventas). Las usan la página y POST /api/admin/ventas.

/** Cómo pagó. El texto es lo que queda en el pedido (payment_method) y se ve en el panel. */
export const FORMAS_DE_PAGO = [
  { valor: 'yape', texto: 'Yape' },
  { valor: 'plin', texto: 'Plin' },
  { valor: 'transferencia', texto: 'Transferencia' },
  { valor: 'efectivo', texto: 'Efectivo' },
  { valor: 'otro', texto: 'Otro' },
] as const

/**
 * De dónde llegó el cliente, si lo sabes. El valor va como «fuente» del origen (shared/lib/origen.ts), igual que
 * los atajos rrboxing.com/ig, /tt, /fb, /yt y /wa: así el tablero los suma juntos.
 */
export const ORIGENES_MANUALES = [
  { valor: 'instagram', texto: 'Instagram' },
  { valor: 'tiktok', texto: 'TikTok' },
  { valor: 'facebook', texto: 'Facebook' },
  { valor: 'youtube', texto: 'YouTube' },
  { valor: 'whatsapp', texto: 'WhatsApp' },
  { valor: 'google', texto: 'Google' },
  { valor: 'recomendacion', texto: 'Se lo recomendaron' },
  { valor: 'presencial', texto: 'En persona' },
  { valor: 'otro', texto: 'Otro' },
] as const
