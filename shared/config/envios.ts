import type { OpcionEnvio } from '@/shared/lib/cart-checkout'
import { formatCurrency } from '@/shared/lib/country'

/**
 * Las tarifas de envío en una frase, desde la misma lista que usa /checkout (LISTA_ENVIOS en
 * shared/lib/cart-checkout.ts): «estándar gratis (2 a 3 días hábiles), express S/ 9.90 (24 a 48 horas) y urgente
 * S/ 14.90 (solo Lima Metropolitana)». La arma una página del servidor y la pasa como prop: cart-checkout.ts lee la
 * base y no puede ir al navegador (aquí solo se importa su tipo).
 */
export function textoTarifas(envios: readonly OpcionEnvio[]): string {
  const partes = envios.map((e) => {
    const precio = e.monto > 0 ? formatCurrency(e.monto, 'PEN', 'es-PE') : 'gratis'
    const plazo = e.plazo.charAt(0).toLocaleLowerCase('es-PE') + e.plazo.slice(1)
    return `${e.nombre.toLocaleLowerCase('es-PE')} ${precio} (${plazo})`
  })
  const lista = partes.length < 2 ? partes.join('') : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`
  return lista.charAt(0).toLocaleUpperCase('es-PE') + lista.slice(1)
}
