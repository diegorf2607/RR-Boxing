import { NextResponse } from 'next/server'
import { z } from 'zod'
import { insertAdminNotification } from '@/shared/lib/data-store'
import { CLASE, PREFIJO_TITULO, claseVigente, normalizarWhatsapp, whatsappLegible } from '@/shared/lib/clase-virtual'

const schema = z.object({
  nombre: z.string().trim().min(2).max(80),
  correo: z.string().trim().toLowerCase().email().max(120),
  whatsapp: z.string().trim().min(6).max(30),
  // Campo trampa: las personas no lo ven; si viene lleno, es un bot.
  sitio: z.string().max(200).optional(),
})

export async function POST(request: Request) {
  if (!claseVigente()) {
    return NextResponse.json({ error: 'Las inscripciones de esta clase ya cerraron.' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Revisa tu nombre, tu correo y tu WhatsApp' }, { status: 400 })
  }

  const { nombre, correo, whatsapp, sitio } = parsed.data
  if (sitio) return NextResponse.json({ ok: true })

  const digitos = normalizarWhatsapp(whatsapp)
  if (!digitos) {
    return NextResponse.json({ error: 'Ese número de WhatsApp no parece válido' }, { status: 400 })
  }

  try {
    await insertAdminNotification({
      type: 'clase_inscripcion',
      severity: 'info',
      title: `${PREFIJO_TITULO}${nombre}`,
      body: `WhatsApp ${whatsappLegible(digitos)} · ${correo} · fue a pagar S/ 30`,
      link: `https://wa.me/${digitos}`,
      entityType: 'clase',
      entityId: CLASE.id,
    })
  } catch (error) {
    console.error('clase/inscripcion', error)
    return NextResponse.json({ error: 'No pudimos guardar tus datos' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
