// Quién vende. Lo piden el Libro de Reclamaciones, los términos, la privacidad y el pie de cada página.
// Se configura en Vercel (Settings → Environment Variables) y después se vuelve a publicar:
//   EMPRESA_RAZON_SOCIAL  el nombre que figura en SUNAT, por ejemplo «RR Boxing S.A.C.»
//   EMPRESA_RUC           los 11 dígitos (se revisa el dígito verificador)
//   EMPRESA_DOMICILIO     el domicilio fiscal
//   CONTACTO_CORREO       el correo de atención: reclamos, cambios y derechos sobre datos personales
//   CONTACTO_WHATSAPP     opcional; si falta, se usa el WhatsApp de la tienda (shared/lib/whatsapp.ts)
// Mientras falte alguno, la web lo muestra «por confirmar». Nunca se inventa.
// Solo para el servidor: las páginas lo leen al armarse.
import { WHATSAPP_NUMERO } from '@/shared/lib/whatsapp'

export interface Empresa {
  razonSocial: string | null
  ruc: string | null
  domicilio: string | null
  correo: string | null
  /** 9 dígitos de un celular peruano, sin el 51 */
  whatsapp: string | null
}

const limpio = (v: string | undefined) => v?.replace(/\s+/g, ' ').trim() || null

export const esCorreo = (v: string) => v.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

/** El dígito verificador del RUC (módulo 11 de SUNAT): atrapa un número mal tipeado. */
export function rucValido(ruc: string): boolean {
  if (!/^(10|15|16|17|20)\d{9}$/.test(ruc)) return false
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const suma = pesos.reduce((s, p, i) => s + p * Number(ruc[i]), 0)
  const digito = (11 - (suma % 11)) % 10
  return digito === Number(ruc[10])
}

export function empresa(): Empresa {
  const ruc = limpio(process.env.EMPRESA_RUC)?.replace(/\D/g, '') ?? null
  const correo = limpio(process.env.CONTACTO_CORREO)
  const whatsappCrudo = limpio(process.env.CONTACTO_WHATSAPP) ?? WHATSAPP_NUMERO
  const whatsapp = whatsappCrudo.replace(/\D/g, '').replace(/^51(?=9\d{8}$)/, '')
  return {
    razonSocial: limpio(process.env.EMPRESA_RAZON_SOCIAL),
    ruc: ruc && rucValido(ruc) ? ruc : null,
    domicilio: limpio(process.env.EMPRESA_DOMICILIO),
    correo: correo && esCorreo(correo) ? correo : null,
    whatsapp: /^9\d{8}$/.test(whatsapp) ? whatsapp : null,
  }
}

/** Están los datos que exige vender: razón social, RUC, domicilio y un correo de atención. */
export const empresaLista = (e: Empresa = empresa()) => !!(e.razonSocial && e.ruc && e.domicilio && e.correo)

/** «RR Boxing S.A.C. · RUC 20123456789 · Av. …», o null si falta algo */
export const identidad = (e: Empresa = empresa()) =>
  e.razonSocial && e.ruc && e.domicilio ? `${e.razonSocial} · RUC ${e.ruc} · ${e.domicilio}` : null

/** «986 964 194» */
export const whatsappVisible = (n: string) => n.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
