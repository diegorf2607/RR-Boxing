// Un ayudante pequeño para mandar correos de texto con Resend (como app/api/admin/orders/[id]/digital-gifts/send).
// Se configura en Vercel: RESEND_API_KEY y RESEND_FROM_EMAIL (por ejemplo «RR Boxing <hola@rrboxing.com>»).
// Si falta alguna, no se manda nada y no se rompe nada: enviarCorreo responde { ok: false, motivo: 'sin_config' }.
// Solo para el servidor (lee la clave de Resend). En los registros nunca van el destinatario ni el contenido.

export type ResultadoCorreo = { ok: true; id: string } | { ok: false; motivo: 'sin_config' | 'error' }

/** ¿Están RESEND_API_KEY y RESEND_FROM_EMAIL? */
export const correoListo = () => !!(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim())

export async function enviarCorreo(mensaje: {
  para: string
  asunto: string
  texto: string
  /** A dónde va la respuesta si contestan el correo */
  responderA?: string | null
}): Promise<ResultadoCorreo> {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim()
  if (!key || !from) return { ok: false, motivo: 'sin_config' }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [mensaje.para],
        subject: mensaje.asunto,
        text: mensaje.texto,
        ...(mensaje.responderA ? { reply_to: mensaje.responderA } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    })
    const datos = (await res.json().catch(() => ({}))) as { id?: unknown; name?: unknown }
    if (!res.ok) {
      // Solo el estado y el nombre del error de Resend: nada del mensaje
      console.error('correo: Resend no lo aceptó', res.status, typeof datos.name === 'string' ? datos.name : '')
      return { ok: false, motivo: 'error' }
    }
    return { ok: true, id: typeof datos.id === 'string' ? datos.id : '' }
  } catch (e) {
    console.error('correo: no se pudo mandar', e instanceof Error ? e.name : 'error')
    return { ok: false, motivo: 'error' }
  }
}
