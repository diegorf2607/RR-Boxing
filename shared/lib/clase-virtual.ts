/** Datos de la clase virtual gratuita (página /clase). Desde el 20 nov ya no se cobra: Diego la dejó gratis. */
export const CLASE = {
  id: '2026-11-28',
  nombreCorto: 'Clase virtual 28 nov',
  whatsappNumero: '51986964194',
  whatsappLegible: '986 964 194',
  /** Inicio y fin de la clase, con la hora de Perú (UTC−5). */
  inicio: '2026-11-28T09:00:00-05:00',
  fin: '2026-11-28T10:00:00-05:00',
  dia: 'Sábado 28 de noviembre',
  hora: '9 a 10 a. m. (hora Perú)',
  donde: 'Virtual, desde tu casa',
  precio: 'Gratis',
  precioFuera: 'Solo tienes que inscribirte',
} as const

/** true mientras la clase no haya terminado (hasta las 10 a. m. de Perú del 28 de noviembre). */
export function claseVigente(ahora: Date = new Date()): boolean {
  return ahora.getTime() < Date.parse(CLASE.fin)
}

/**
 * Deja solo los dígitos de un celular y le agrega el 51 de Perú si escribieron los 9 dígitos
 * de un celular peruano. Devuelve null si no parece un número de WhatsApp.
 */
export function normalizarWhatsapp(entrada: string): string | null {
  let digitos = entrada.replace(/\D/g, '')
  if (digitos.startsWith('00')) digitos = digitos.slice(2)
  if (digitos.length === 9 && digitos.startsWith('9')) digitos = `51${digitos}`
  if (digitos.length < 8 || digitos.length > 15) return null
  return digitos
}

/** «51986964194» → «+51 986 964 194»; otros países quedan como «+<dígitos>». */
export function whatsappLegible(digitos: string): string {
  if (digitos.length === 11 && digitos.startsWith('519')) {
    return `+51 ${digitos.slice(2, 5)} ${digitos.slice(5, 8)} ${digitos.slice(8)}`
  }
  return `+${digitos}`
}

export const PREFIJO_TITULO = `${CLASE.nombreCorto}: `
