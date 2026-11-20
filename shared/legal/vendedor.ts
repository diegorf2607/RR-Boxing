// Quién vende y cómo escribirle, tal como salen en los términos, los cambios y la privacidad.
// Los datos llegan de empresa() (variables EMPRESA_* y CONTACTO_*): lo que falte sale «por confirmar».
import { whatsappVisible, type Empresa } from '@/shared/lib/empresa'
import { enlace, falta, porConfirmar, type Fila, type Pieza } from './tipos'

/** El enlace de WhatsApp del número de atención (9 dígitos, sin el 51) */
export const enlaceWhatsappAtencion = (n: string) => `https://wa.me/51${n}`

const correoDe = (e: Empresa): Pieza =>
  e.correo ? enlace(e.correo, `mailto:${e.correo}`) : falta('Correo de atención')
const whatsappDe = (n: string): Pieza => enlace(whatsappVisible(n), enlaceWhatsappAtencion(n))

/** Razón social, RUC, domicilio fiscal, correo y WhatsApp de atención, una fila por dato */
export function filasVendedor(e: Empresa): Fila[] {
  return [
    { nombre: 'Razón social', valor: e.razonSocial ?? porConfirmar },
    { nombre: 'RUC', valor: e.ruc ?? porConfirmar },
    { nombre: 'Domicilio fiscal', valor: e.domicilio ?? porConfirmar },
    { nombre: 'Correo de atención', valor: e.correo ? [correoDe(e)] : porConfirmar },
    { nombre: 'WhatsApp de atención', valor: e.whatsapp ? [whatsappDe(e.whatsapp)] : porConfirmar },
  ]
}

/**
 * Cómo escribirnos, para seguir a «escríbenos»: «por WhatsApp al 986 964 194 o al correo hola@…», con sus
 * enlaces. Si falta el correo, lo dice entre paréntesis.
 */
export function canales(e: Empresa): Pieza[] {
  if (e.whatsapp && e.correo) return ['por WhatsApp al ', whatsappDe(e.whatsapp), ' o al correo ', correoDe(e)]
  if (e.whatsapp) return ['por WhatsApp al ', whatsappDe(e.whatsapp), ' (correo de atención: ', { falta: 'por confirmar' }, ')']
  return ['al correo ', correoDe(e)]
}
