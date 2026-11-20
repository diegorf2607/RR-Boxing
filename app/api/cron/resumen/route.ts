import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { enviarCorreo } from '@/shared/lib/correo'
import { empresa } from '@/shared/lib/empresa'
import { resumenDelDiaAnterior, textoResumen } from '@/shared/lib/resumen-diario'

// El resumen del día anterior, por correo a CONTACTO_CORREO. Lo llama el cron de Vercel (vercel.json) todos los
// días a las 13:00 UTC, que son las 8 a. m. en Lima. Vercel manda «Authorization: Bearer <CRON_SECRET>» solo si
// CRON_SECRET está en las variables del proyecto: sin ella esta ruta no hace nada (503).
// Con ?ver=1 (y la misma clave) devuelve el texto sin mandarlo, para revisarlo:
//   curl -H "Authorization: Bearer $CRON_SECRET" "https://www.rrboxing.com/api/cron/resumen?ver=1"

export const dynamic = 'force-dynamic'
// Las lecturas de Supabase van por fetch: sin esto Next.js las guarda en su caché y el resumen sale con datos viejos
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const maxDuration = 30

function autorizado(req: Request, secreto: string): boolean {
  const recibido = Buffer.from(req.headers.get('authorization') ?? '')
  const esperado = Buffer.from(`Bearer ${secreto}`)
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado)
}

export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET?.trim()
  if (!secreto) {
    return NextResponse.json({ ok: false, motivo: 'falta CRON_SECRET' }, { status: 503 })
  }
  if (!autorizado(req, secreto)) {
    return NextResponse.json({ ok: false, motivo: 'no autorizado' }, { status: 401 })
  }

  let correo: { asunto: string; texto: string }
  try {
    correo = textoResumen(await resumenDelDiaAnterior())
  } catch (e) {
    console.error('cron/resumen: no se pudo armar', e instanceof Error ? e.message : 'error')
    return NextResponse.json({ ok: false, motivo: 'no se pudo leer la base' }, { status: 500 })
  }

  if (new URL(req.url).searchParams.get('ver') === '1') {
    return new NextResponse(`${correo.asunto}\n\n${correo.texto}\n`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  const para = empresa().correo
  if (!para) {
    return NextResponse.json({ ok: false, motivo: 'falta CONTACTO_CORREO' }, { status: 503 })
  }
  const envio = await enviarCorreo({ para, asunto: correo.asunto, texto: correo.texto })
  if (!envio.ok) {
    const sinConfig = envio.motivo === 'sin_config'
    return NextResponse.json(
      { ok: false, motivo: sinConfig ? 'faltan RESEND_API_KEY o RESEND_FROM_EMAIL' : 'Resend no lo aceptó' },
      { status: sinConfig ? 503 : 502 },
    )
  }
  return NextResponse.json({ ok: true })
}
