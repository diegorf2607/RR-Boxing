/**
 * Pago en línea de la tienda.
 *
 * Se pone en true cuando haya una pasarela que funcione en Perú.
 * Mientras sea false, los pedidos se hacen por WhatsApp desde el carrito, /checkout manda al carrito
 * y la API de pago no crea sesiones.
 */
export const PAGO_EN_LINEA_ACTIVO: boolean = false
