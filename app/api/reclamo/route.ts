// POST /api/reclamo: la Hoja de Reclamación del Libro de Reclamaciones virtual.
// Revisa la hoja (shared/lib/reclamo.ts), le da su número correlativo del año («2026-000001»), su fecha y su plazo
// de 15 días hábiles (shared/lib/plazos.ts), la guarda en admin_notifications (type libro_reclamacion, body = la hoja
// en JSON) y, si Resend está configurado, manda la constancia al consumidor (si dejó correo) y a CONTACTO_CORREO.
// Responde { numero, fecha, fechaTexto, vence, venceDia, copia, copiaMotivo }.
// - copia: true si la copia le salió al consumidor. copiaMotivo, si no: sin_correo, correo_mal, sin_config o error.
// - El número: se guarda la hoja y después se revisa si otra hoja presentada al mismo tiempo sacó el mismo número.
//   Si pasó, esta toma otro. Toda escritura posterior va por el id de su fila: nunca pisa otra hoja.
// - Sin cuenta, sin captcha y sin pasos previos: un campo trampa invisible, un tope de 20 KB para el cuerpo y un
//   límite guardado en la misma tabla: 5 hojas por hora desde una misma conexión (se guarda una huella de la IP, no
//   la IP, en entity_type; se cuenta antes de guardar y, por si llegan varias a la vez, se revisa el puesto después)
//   y, si llegan más de 30 hojas en una hora entre todas, no salen más copias por correo (la hoja igual se guarda).
//   Si el conteo falla, no se bloquea a nadie.
// - Errores: invalido (400, con el campo), muy_largo (413), muchas (429), error (500).
// En los registros van solo el número, el tipo y si salió la copia: nada de datos personales.
import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { correoListo, enviarCorreo, type ResultadoCorreo } from '@/shared/lib/correo'
import { esCorreo } from '@/shared/lib/empresa'
import { anioDeLima, diaIso, fechaHoraTexto, fechaTexto, PLAZO_RECLAMO_DIAS_HABILES, venceReclamo } from '@/shared/lib/plazos'
import {
  MAX_BYTES_HOJA,
  proveedorDelLibro,
  respuestaPorTexto,
  SITIO,
  textoConstancia,
  validarReclamo,
  type HojaRegistrada,
} from '@/shared/lib/reclamo'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'

const TIPO = 'libro_reclamacion'
const TABLA = 'admin_notifications'

const HORA_MS = 3_600_000
/** Hojas por hora desde una misma conexión */
const MAX_POR_IP = 5
/** Si entre todas llegan más hojas que esto en una hora, no salen más copias por correo */
const MAX_COPIAS_HORA = 30
/** Veces que una hoja busca otro número si choca con otra; después, un número provisional al azar */
const MAX_INTENTOS = 5

type MotivoSinCopia = 'sin_correo' | 'correo_mal' | 'sin_config' | 'error'

// Sin los tipos de la base (como insertAdminNotification en data-store.ts)
const db = () => getSupabaseAdmin() as any

/** Lee el cuerpo sin pasar de MAX_BYTES_HOJA: si se pasa, corta ahí */
async function leerCuerpo(req: Request): Promise<{ ok: true; texto: string } | { ok: false; estado: 400 | 413 }> {
  const declarado = Number(req.headers.get('content-length'))
  if (Number.isFinite(declarado) && declarado > MAX_BYTES_HOJA) return { ok: false, estado: 413 }
  if (!req.body) return { ok: false, estado: 400 }
  const lector = req.body.getReader()
  const trozos: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await lector.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_BYTES_HOJA) {
      await lector.cancel().catch(() => {})
      return { ok: false, estado: 413 }
    }
    trozos.push(value)
  }
  const junto = new Uint8Array(total)
  let i = 0
  for (const t of trozos) {
    junto.set(t, i)
    i += t.byteLength
  }
  return { ok: true, texto: new TextDecoder().decode(junto) }
}

/**
 * De dónde viene la hoja: «libro:» y una huella de la IP (no la IP), que se guarda en entity_type. En Vercel,
 * x-real-ip y x-forwarded-for las pone Vercel y no se pueden falsear.
 */
function origen(req: Request): string {
  const ip =
    req.headers.get('x-real-ip')?.trim() || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'sin-ip'
  const sal = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return `libro:${createHash('sha256').update(`${sal}|${ip}`).digest('hex').slice(0, 16)}`
}

/** Las hojas de la última hora: todas o las de una conexión. Si el conteo falla, 0: no se bloquea a nadie. */
async function hojasUltimaHora(deDonde?: string): Promise<number> {
  try {
    let q = db()
      .from(TABLA)
      .select('id', { count: 'exact', head: true })
      .eq('type', TIPO)
      .gte('created_at', new Date(Date.now() - HORA_MS).toISOString())
    if (deDonde) q = q.eq('entity_type', deDonde)
    const { count, error } = await q
    return error ? 0 : count ?? 0
  } catch {
    return 0
  }
}

/**
 * Las filas de una conexión en la última hora, de la más antigua a la más nueva (para el puesto de una hoja ya
 * guardada). null si no se pudo consultar.
 */
async function filasDeLaHora(deDonde: string): Promise<{ id: string }[] | null> {
  try {
    const { data, error } = await db()
      .from(TABLA)
      .select('id')
      .eq('type', TIPO)
      .eq('entity_type', deDonde)
      .gte('created_at', new Date(Date.now() - HORA_MS).toISOString())
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
    return error || !Array.isArray(data) ? null : (data as { id: string }[])
  } catch {
    return null
  }
}

/** Seis letras o números al azar, sin los que se confunden (0/O, 1/I): «X7K2QM» */
function sufijoAlAzar(): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(5))
  return `X${Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('')}`
}

type Numero = { numero: string; provisional: boolean }

const numeroDe = (anio: string, n: number) => `${anio}-${String(n).padStart(6, '0')}`
const numeroAlAzar = (anio: string): Numero => ({ numero: `${anio}-${sufijoAlAzar()}`, provisional: true })
/** «2026-000045» → 45; un número provisional («2026-X7K2QM») → null */
const correlativo = (numero: string) => {
  const m = /^\d{4}-(\d{6})$/.exec(numero)
  return m ? Number(m[1]) : null
}

/** El número correlativo más alto ya dado en el año (0 si no hay ninguno). Si la consulta falla, lanza. */
async function ultimoNumero(anio: string): Promise<number> {
  const { data, error } = await db()
    .from(TABLA)
    .select('entity_id')
    .eq('type', TIPO)
    .like('entity_id', `${anio}-0%`)
    .order('entity_id', { ascending: false })
    .limit(50)
  if (error || !Array.isArray(data)) throw new Error(error?.message ?? 'sin datos')
  for (const fila of data as { entity_id: string | null }[]) {
    const n = fila.entity_id?.startsWith(`${anio}-`) ? correlativo(fila.entity_id) : null
    if (n !== null) return n
  }
  return 0
}

/**
 * El número que sigue: el más alto del año, más 1, en seis cifras («2026-000001»). `salto` deja libres los
 * anteriores, para que las hojas que chocaron juntas no vuelvan a pedir el mismo. Si la consulta falla, un sufijo
 * al azar («2026-X7K2QM»), y la hoja queda marcada como numeroProvisional.
 */
async function siguienteNumero(anio: string, salto = 0): Promise<Numero> {
  try {
    return { numero: numeroDe(anio, (await ultimoNumero(anio)) + 1 + salto), provisional: false }
  } catch (e) {
    console.warn('reclamo: el conteo del año falló, va un número al azar:', e instanceof Error ? e.message : 'error')
    return numeroAlAzar(anio)
  }
}

/** Las filas que tienen este número, de la más antigua a la más nueva. null si no se pudo consultar. */
async function filasConNumero(numero: string): Promise<{ id: string }[] | null> {
  try {
    const { data, error } = await db()
      .from(TABLA)
      .select('id')
      .eq('type', TIPO)
      .eq('entity_id', numero)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
    return error || !Array.isArray(data) ? null : (data as { id: string }[])
  } catch {
    return null
  }
}

const tituloDe = (h: HojaRegistrada) => `${h.tipo === 'queja' ? 'Queja' : 'Reclamo'} ${h.numero} · ${h.nombre}`
const enlaceDe = (numero: string) => `/admin/reclamos#hoja-${numero}`

/** Cambia los datos de la fila con este id (y de ninguna otra). true si se pudo. */
async function actualizarFila(id: string, cambios: Record<string, unknown>): Promise<boolean> {
  try {
    const { error } = await db().from(TABLA).update(cambios).eq('id', id)
    return !error
  } catch {
    return false
  }
}

/**
 * Si otra hoja presentada al mismo tiempo sacó el mismo número, esta toma otro. La primera vez se queda con el
 * número la hoja más antigua que lo tiene; la que cambia de número solo se lo queda si ya nadie más lo tiene (así
 * no le gana a una hoja que ya respondió con ese número). Devuelve la hoja con el número que quedó guardado.
 */
async function resolverChoque(id: string, hoja: HojaRegistrada, anio: string): Promise<HojaRegistrada> {
  let actual = hoja
  for (let intento = 1; !actual.numeroProvisional; intento++) {
    const iguales = await filasConNumero(actual.numero)
    if (!iguales) {
      console.warn('reclamo: no se pudo revisar si el número se repite', actual.numero)
      return actual
    }
    const puesto = iguales.findIndex((f) => f.id === id)
    if (puesto === -1 || (intento === 1 ? puesto === 0 : iguales.length === 1)) return actual

    // Las que chocaron juntas toman los números siguientes, cada una el suyo según su puesto
    const n = correlativo(actual.numero)
    const nuevo: Numero =
      intento > MAX_INTENTOS
        ? numeroAlAzar(anio)
        : intento === 1 && n !== null
          ? { numero: numeroDe(anio, n + puesto), provisional: false }
          : await siguienteNumero(anio, puesto)
    const otra: HojaRegistrada = { ...actual, numero: nuevo.numero, numeroProvisional: nuevo.provisional }
    const ok = await actualizarFila(id, {
      entity_id: otra.numero,
      title: tituloDe(otra),
      link: enlaceDe(otra.numero),
      body: JSON.stringify(otra),
    })
    if (!ok) {
      console.warn('reclamo: no se pudo cambiar el número repetido', actual.numero)
      return actual
    }
    actual = otra
  }
  return actual
}

function correoConsumidor(h: HojaRegistrada) {
  const tipo = h.tipo === 'queja' ? 'queja' : 'reclamo'
  return {
    para: h.correo as string,
    asunto: `Tu ${tipo} N.º ${h.numero} · RR Boxing`,
    texto: [
      `Hola, ${h.nombre}:`,
      `Recibimos tu ${tipo}. Esta es la copia de tu Hoja de Reclamación del Libro de Reclamaciones de RR Boxing. ` +
        `Te respondemos por escrito a más tardar el ${h.vence}.`,
      textoConstancia(h),
      'Copia para el consumidor.',
    ].join('\n\n'),
    responderA: h.proveedor.correo,
  }
}

function correoTienda(h: HojaRegistrada, para: string) {
  const tipo = h.tipo === 'queja' ? 'Queja' : 'Reclamo'
  const destino = h.respuestaPor === 'correo' ? h.correo : h.domicilio
  return {
    para,
    asunto: `${tipo} N.º ${h.numero} en el Libro de Reclamaciones`,
    texto: [
      `Llegó una hoja al Libro de Reclamaciones de rrboxing.com. Hay que responderla por escrito a más tardar el ${h.vence} ` +
        `(${h.plazoDiasHabiles} días hábiles; el plazo no se puede extender).`,
      `Responder por: ${respuestaPorTexto(h)}${destino ? `, ${destino}` : ''}.`,
      `En el panel: ${SITIO}/admin/reclamos`,
      textoConstancia(h),
    ].join('\n\n'),
    responderA: h.correo && esCorreo(h.correo) ? h.correo : null,
  }
}

/** Para el panel: si se intentó mandar la copia y si salió. Sin Resend configurado no se intentó (null). */
const intentoDe = (r: ResultadoCorreo | null): boolean | null =>
  !r || (!r.ok && r.motivo === 'sin_config') ? null : r.ok

export async function POST(req: Request) {
  // Enviada como formulario normal (sin JavaScript): no se guarda nada y vuelve a la página con un aviso
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) {
    return NextResponse.redirect(new URL('/libro-de-reclamaciones#sin-enviar', req.url), 303)
  }

  const cuerpo = await leerCuerpo(req)
  if (!cuerpo.ok) {
    return NextResponse.json(
      { codigo: cuerpo.estado === 413 ? 'muy_largo' : 'invalido', campo: 'hoja' },
      { status: cuerpo.estado },
    )
  }
  let datos: unknown
  try {
    datos = JSON.parse(cuerpo.texto)
  } catch {
    return NextResponse.json({ codigo: 'invalido', campo: 'hoja' }, { status: 400 })
  }

  const v = validarReclamo(datos)
  if (!v.ok) return NextResponse.json({ codigo: 'invalido', campo: v.campo }, { status: 400 })

  const deDonde = origen(req)
  if ((await hojasUltimaHora(deDonde)) >= MAX_POR_IP) {
    console.warn('reclamo: tope de hojas por hora desde una misma conexión')
    return NextResponse.json({ codigo: 'muchas' }, { status: 429, headers: { 'Retry-After': '3600' } })
  }

  const ahora = new Date()
  const anio = anioDeLima(ahora)
  const vence = venceReclamo(ahora)
  const proveedor = proveedorDelLibro()
  const primero = await siguienteNumero(anio)
  let hoja: HojaRegistrada = {
    version: 1,
    numero: primero.numero,
    numeroProvisional: primero.provisional,
    fecha: ahora.toISOString(),
    fechaTexto: fechaHoraTexto(ahora),
    vence: fechaTexto(vence),
    venceDia: diaIso(vence),
    plazoDiasHabiles: PLAZO_RECLAMO_DIAS_HABILES,
    proveedor,
    ...v.reclamo,
  }

  // Se guarda y nos quedamos con el id de su fila: lo que se escriba después va solo a esa fila
  let id: string
  try {
    const { data: fila, error } = await db()
      .from(TABLA)
      .insert({
        type: TIPO,
        severity: 'warning',
        title: tituloDe(hoja),
        body: JSON.stringify(hoja),
        link: enlaceDe(hoja.numero),
        entity_type: deDonde,
        entity_id: hoja.numero,
      })
      .select('id')
      .single()
    if (error || typeof fila?.id !== 'string') throw new Error(error?.message ?? 'sin id')
    id = fila.id
  } catch (e) {
    console.error('reclamo: no se pudo guardar', e instanceof Error ? e.message : 'error')
    return NextResponse.json({ codigo: 'error' }, { status: 500 })
  }

  // Si llegaron varias a la vez desde la misma conexión, todas pasaron el conteo de arriba. Ya guardadas, quedan
  // solo las 5 primeras de la hora: esta fila, si va después, se quita (todavía no se le confirmó a nadie ni salió
  // ningún correo) y la respuesta es la misma que arriba. Si la consulta o el borrado fallan, la hoja sigue.
  const deLaHora = await filasDeLaHora(deDonde)
  if (deLaHora && deLaHora.findIndex((f) => f.id === id) >= MAX_POR_IP) {
    try {
      const { error } = await db().from(TABLA).delete().eq('id', id)
      if (!error) {
        console.warn('reclamo: tope de hojas por hora desde una misma conexión (llegaron a la vez)')
        return NextResponse.json({ codigo: 'muchas' }, { status: 429, headers: { 'Retry-After': '3600' } })
      }
    } catch {
      /* la hoja sigue guardada */
    }
  }

  hoja = await resolverChoque(id, hoja, anio)
  const numero = hoja.numero

  // La copia: al consumidor, si dejó un correo bien escrito, y a la tienda. Si falla, la hoja ya quedó guardada.
  // Si en la última hora llegaron demasiadas hojas, no sale ninguna copia (para que no se use la web para mandar
  // correos a terceros).
  const correoBien = !!hoja.correo && esCorreo(hoja.correo)
  const conCorreos = (correoBien || !!proveedor.correo) && correoListo()
  const copiasLibres = !conCorreos || (await hojasUltimaHora()) <= MAX_COPIAS_HORA
  if (!copiasLibres) console.warn('reclamo: tope de copias por hora, no sale la copia', numero)
  const alConsumidor = correoBien && copiasLibres ? enviarCorreo(correoConsumidor(hoja)) : null
  const aLaTienda = proveedor.correo && copiasLibres ? enviarCorreo(correoTienda(hoja, proveedor.correo)) : null
  const [consumidor, tienda] = await Promise.all([alConsumidor, aLaTienda])

  const copia = consumidor?.ok === true
  const copiaMotivo: MotivoSinCopia | null = copia
    ? null
    : !hoja.correo
      ? 'sin_correo'
      : !correoBien
        ? 'correo_mal'
        : !consumidor
          ? 'error'
          : consumidor.ok
            ? null
            : consumidor.motivo

  // Anota en la hoja si salieron las copias (para el panel), solo si se intentó mandar alguna. Si no se puede, no
  // pasa nada.
  const anotacion = { consumidor: intentoDe(consumidor), tienda: intentoDe(tienda) }
  if (anotacion.consumidor !== null || anotacion.tienda !== null) {
    const conCopia: HojaRegistrada = { ...hoja, copia: anotacion }
    if (!(await actualizarFila(id, { body: JSON.stringify(conCopia) }))) console.warn('reclamo: no se anotó la copia', numero)
  }

  console.info(
    'reclamo',
    JSON.stringify({ numero, tipo: hoja.tipo, copia, tienda: tienda?.ok ?? null, provisional: hoja.numeroProvisional }),
  )
  return NextResponse.json({
    numero,
    fecha: hoja.fecha,
    fechaTexto: hoja.fechaTexto,
    vence: hoja.vence,
    venceDia: hoja.venceDia,
    copia,
    copiaMotivo,
  })
}
