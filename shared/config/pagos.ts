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
 * Lo mismo, leído al cargar el módulo. En el servidor vale para páginas dinámicas; en el navegador siempre es false.
 * Para lo nuevo, usa pagoEnLineaActivo() en el servidor.
 */
export const PAGO_EN_LINEA_ACTIVO: boolean = pagoEnLineaActivo()
