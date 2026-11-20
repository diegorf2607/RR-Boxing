/**
 * Pago en línea de la tienda (Mercado Pago, Checkout Pro: Yape, tarjeta y más).
 *
 * Se prende solo cuando existe la variable MERCADOPAGO_ACCESS_TOKEN en Vercel (ver shared/lib/mercadopago.ts).
 * Sin ella, /checkout ofrece solo «Coordinar el pago por WhatsApp» y no se llama a Mercado Pago.
 *
 * Solo el servidor sabe si está prendido: en el navegador la variable no existe y esto siempre da false.
 * Un componente del navegador que lo necesite debe recibirlo como prop desde una página del servidor
 * (como app/checkout/page.tsx con CheckoutClient).
 */
export function pagoEnLineaActivo(): boolean {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
}

/**
 * Cómo se paga, cuando el pago en línea está prendido: la fila «Pago» de la ficha y la pregunta «¿Cómo pago?» del
 * inicio dicen lo mismo. Sin pago en línea, cada una conserva su texto de WhatsApp.
 */
export const TEXTO_PAGO_EN_LINEA = 'Pagas en línea con Mercado Pago (Yape, tarjeta y más) o lo coordinamos por WhatsApp.'

/**
 * Lo mismo, leído al cargar el módulo. En el servidor vale para páginas dinámicas; en el navegador siempre es false.
 * Para lo nuevo, usa pagoEnLineaActivo() en el servidor.
 */
export const PAGO_EN_LINEA_ACTIVO: boolean = pagoEnLineaActivo()
