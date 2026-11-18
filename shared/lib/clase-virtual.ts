/** Datos de la clase virtual que se cobra con el link de Mercado Pago (página /clase). */
export const CLASE = {
  id: '2026-11-28',
  nombreCorto: 'Clase virtual 28 nov',
  pagoUrl: 'https://mpago.la/2cHSMib',
  whatsappNumero: '51986964194',
  whatsappLegible: '986 964 194',
} as const

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
