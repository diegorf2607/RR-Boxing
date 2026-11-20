// Clave con la que se firma la cookie de sesión (rrboxing_session).
//
// El repo es público: nunca debe haber un texto fijo de respaldo, porque cualquiera
// podría firmar una sesión de admin con él. Orden de preferencia:
//   1. AUTH_SECRET, si existe y tiene al menos 32 caracteres.
//   2. Una clave derivada de SUPABASE_SERVICE_ROLE_KEY, que solo vive en el servidor.
// Si no hay ninguna de las dos, no se firma ni se acepta ninguna sesión.
//
// Este archivo no importa nada de Node: lo usa también el middleware (runtime edge).

const TEXTO_PUBLICO_ANTIGUO = 'rrboxing-dev-secret-change-me'
const encoder = new TextEncoder()

export function getSessionSecret(): Uint8Array {
  const propia = process.env.AUTH_SECRET?.trim()
  if (propia && propia !== TEXTO_PUBLICO_ANTIGUO && propia.length >= 32) {
    return encoder.encode(propia)
  }

  const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (servicio && servicio.length >= 32) {
    return encoder.encode(`rrboxing-sesion-admin:v1:${servicio}`)
  }

  throw new Error('Falta AUTH_SECRET (o SUPABASE_SERVICE_ROLE_KEY) para firmar la sesión')
}
