// Lo que deciden y comparten los textos legales de RR Boxing: versiones, fecha, plazos y rutas.
// Un solo lugar: los términos, los cambios, la garantía y la privacidad leen de aquí.
// Si cambias algo que la persona acepta (un plazo, quién paga un envío, un proveedor), sube la versión de ese
// documento y su fecha.

export const VIGENTE_DESDE = '21 de noviembre de 2026'

export const VERSION = {
  terminos: '1.0',
  privacidad: '1.0',
  /** Cambios y devoluciones (/reembolso) y Garantía de compra (/garantia): son la misma fuente */
  cambios: '1.0',
} as const

/**
 * Garantía de compra: días calendario desde la entrega para avisar de un producto fallado, dañado o equivocado.
 * Ya estaba publicada en la web antes de la ola 1. No limita la garantía legal (eso lo dicen los textos).
 */
export const GARANTIA_DIAS = 30

/**
 * Cambio por otro motivo (sin uso y en su empaque): días calendario desde la entrega para pedirlo. Lo decide Diego.
 * Mientras sea null, los textos no prometen ningún plazo: dicen que se ve con la persona por WhatsApp y el plazo
 * sale «por confirmar» en /reembolso. Para ponerlo, cambia null por el número (por ejemplo, 7): los textos de
 * cambios.ts, los términos y las preguntas frecuentes lo toman solos. Si la web ya está publicada, sube también
 * VERSION.cambios y VERSION.terminos, y VIGENTE_DESDE.
 */
export const CAMBIO_DIAS: number | null = null

/** Plazo máximo para responder un reclamo o una queja (Ley N.º 29571, art. 24, con la Ley N.º 31435) */
export const RECLAMO_DIAS_HABILES = 15

export const RUTAS = {
  terminos: '/terminos',
  privacidad: '/privacidad',
  /** «Cambios y devoluciones»: se mantiene la URL de la antigua política de reembolso */
  cambios: '/reembolso',
  garantia: '/garantia',
  libro: '/libro-de-reclamaciones',
  clase: '/clase',
  clases1a1: '/consulta',
} as const
