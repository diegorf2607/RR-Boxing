// Las cifras de la tienda por día y por origen: el tablero del panel (/admin) y el correo de las 8 a. m.
// (/api/cron/resumen). Lee lo que ya existe, sin tablas nuevas:
// - orders: cada pedido (el web y los que se registran a mano en /admin/ventas).
// - admin_notifications type pedido_datos: los datos del pedido sin columna, en JSON; aquí solo se lee el origen.
// - admin_notifications type clase_inscripcion: quienes dejaron sus datos en /clase antes de ir a pagar.
// - admin_notifications type libro_reclamacion: las hojas del Libro de Reclamaciones y su plazo.
// Los días son los de Lima (UTC−5 todo el año). Solo para el servidor: usa la clave de servicio de Supabase.
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'
import { limpiarOrigen, origenTexto, type Origen } from '@/shared/lib/origen'
import { diaIso, diasHabilesQueFaltan, fechaTexto } from '@/shared/lib/plazos'
import { leerHojaRegistrada } from '@/shared/lib/reclamo'
import { PREFIJO_TITULO } from '@/shared/lib/clase-virtual'

const HORA_MS = 60 * 60 * 1000
const DIA_MS = 24 * HORA_MS
const DESFASE_LIMA_MS = 5 * HORA_MS
/** Hasta cuántos días atrás se buscan hojas del Libro: el plazo de 15 días hábiles entra con holgura */
const DIAS_HOJAS = 60
/** «Vence pronto»: le quedan estos días hábiles o menos */
export const DIAS_HABILES_PRONTO = 5
const SIN_DATO = 'sin dato'

/** El instante en que empieza en Lima el día de `fecha` */
export const inicioDelDiaLima = (fecha: Date) => new Date(Date.parse(`${diaIso(fecha)}T00:00:00Z`) + DESFASE_LIMA_MS)

/** «15:32», en Lima */
export function horaLima(iso: string): string {
  const t = new Date(Date.parse(iso) - DESFASE_LIMA_MS)
  if (Number.isNaN(t.getTime())) return ''
  return `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`
}

/* ---------- Lo que se lee de la base ---------- */

export interface PedidoLeido {
  id: string
  cliente: string
  total: number
  moneda: string
  estado: string
  pagado: boolean
  formaPago: string | null
  /** «instagram · bio», o «sin dato» si el pedido no trae origen */
  origen: string
  fecha: string
  /** «1 × Guantes de boxeo, 2 × Vendas» */
  productos: string
}

export interface InscripcionLeida {
  nombre: string
  origen: string
  fecha: string
}

export interface HojaAbierta {
  numero: string
  tipo: 'reclamo' | 'queja'
  nombre: string
  /** «martes 15 de diciembre de 2026» */
  vence: string
  venceDia: string
  /** Días hábiles que le quedan (0: vence hoy) */
  dias: number
}

export interface EstadoHojas {
  /** Las hojas con el plazo corriendo, la que vence primero arriba */
  enPlazo: HojaAbierta[]
  /** Las hojas de los últimos 60 días cuyo plazo ya pasó. El panel no sabe si se respondieron. */
  vencidas: number
}

type Fila = Record<string, unknown>

const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

/** Pagado o en camino: lo mismo que cuenta el panel como cobrado */
const estaPagado = (estado: string, pago: string) =>
  pago === 'paid' || (pago !== 'refunded' && ['paid', 'processing', 'shipped', 'delivered'].includes(estado))

/**
 * El origen que guarda un registro en su body JSON (campo `origen`), como lo deja shared/lib/origen.ts.
 * Acepta también un texto suelto («instagram»). Un body que no es JSON no trae origen.
 */
export function origenDelBody(body: unknown): Origen | null {
  if (typeof body !== 'string' || !body.trim().startsWith('{')) return null
  try {
    const o = (JSON.parse(body) as Fila).origen
    if (typeof o === 'string' && o.trim()) return limpiarOrigen({ fuente: o })
    return limpiarOrigen(o)
  } catch {
    return null
  }
}

/**
 * El origen de una inscripción a la clase. Si el body es JSON, su campo `origen`; si es el texto de siempre
 * («WhatsApp … · correo · fue a pagar S/ 30»), lo que vaya después de «origen:», si lo trae.
 */
export function origenDeInscripcion(body: unknown): string {
  const delJson = origenDelBody(body)
  if (delJson) return origenTexto(delJson)
  if (typeof body !== 'string') return SIN_DATO
  const m = body.match(/origen:\s*([^\n]+)/i)
  return m ? m[1].trim().toLowerCase().slice(0, 120) : SIN_DATO
}

export interface Movimientos {
  pedidos: PedidoLeido[]
  inscripciones: InscripcionLeida[]
  /** Lo que no se pudo leer (el panel lo muestra; el correo lo dice) */
  errores: string[]
}

/** Pedidos (sin los cancelados) e inscripciones a la clase entre `desde` (incluido) y `hasta` (excluido) */
export async function leerMovimientos(desde: Date, hasta: Date): Promise<Movimientos> {
  const db = getSupabaseAdmin()
  const errores: string[] = []
  const rango = { desde: desde.toISOString(), hasta: hasta.toISOString() }

  const [pedidosRes, inscripcionesRes] = await Promise.all([
    db
      .from('orders')
      .select('id,customer_email,customer_name,total_amount,currency,status,payment_status,payment_method,created_at')
      .gte('created_at', rango.desde)
      .lt('created_at', rango.hasta)
      .order('created_at', { ascending: false })
      .limit(2000),
    db
      .from('admin_notifications')
      .select('title,body,created_at')
      .eq('type', 'clase_inscripcion')
      .gte('created_at', rango.desde)
      .lt('created_at', rango.hasta)
      .order('created_at', { ascending: false })
      .limit(2000),
  ])

  if (pedidosRes.error) errores.push('los pedidos')
  if (inscripcionesRes.error) errores.push('las inscripciones a la clase')

  const filas = ((pedidosRes.data ?? []) as Fila[]).filter((f) => texto(f.status) !== 'cancelled')
  const ids = filas.map((f) => texto(f.id)).filter(Boolean)

  const origenes = new Map<string, string>()
  const productos = new Map<string, string[]>()
  if (ids.length > 0) {
    const [datosRes, itemsRes] = await Promise.all([
      db.from('admin_notifications').select('entity_id,body').eq('type', 'pedido_datos').in('entity_id', ids),
      db.from('order_items').select('order_id,product_name,quantity').in('order_id', ids),
    ])
    if (datosRes.error) errores.push('el origen de los pedidos')
    for (const f of (datosRes.data ?? []) as Fila[]) {
      const o = origenDelBody(f.body)
      if (o) origenes.set(texto(f.entity_id), origenTexto(o))
    }
    // Sin las líneas el pedido igual se cuenta: solo falta el detalle de productos
    for (const f of (itemsRes.data ?? []) as Fila[]) {
      const id = texto(f.order_id)
      const lista = productos.get(id) ?? []
      lista.push(`${Number(f.quantity) || 1} × ${texto(f.product_name) || 'producto'}`)
      productos.set(id, lista)
    }
  }

  const pedidos: PedidoLeido[] = filas.map((f) => {
    const id = texto(f.id)
    const estado = texto(f.status)
    return {
      id,
      cliente: texto(f.customer_name) || texto(f.customer_email) || 'sin nombre',
      total: Number(f.total_amount) || 0,
      moneda: texto(f.currency) || 'PEN',
      estado,
      pagado: estaPagado(estado, texto(f.payment_status)),
      formaPago: texto(f.payment_method) || null,
      origen: origenes.get(id) ?? SIN_DATO,
      fecha: texto(f.created_at),
      productos: (productos.get(id) ?? []).join(', '),
    }
  })

  const inscripciones: InscripcionLeida[] = ((inscripcionesRes.data ?? []) as Fila[]).map((f) => ({
    nombre: texto(f.title).startsWith(PREFIJO_TITULO) ? texto(f.title).slice(PREFIJO_TITULO.length) : texto(f.title),
    origen: origenDeInscripcion(f.body),
    fecha: texto(f.created_at),
  }))

  return { pedidos, inscripciones, errores }
}

/** Las hojas del Libro con el plazo corriendo y cuántas vencieron (de los últimos 60 días) */
export async function leerHojasAbiertas(ahora: Date = new Date()): Promise<EstadoHojas & { error: boolean }> {
  const { data, error } = await getSupabaseAdmin()
    .from('admin_notifications')
    .select('body,created_at')
    .eq('type', 'libro_reclamacion')
    .gte('created_at', new Date(ahora.getTime() - DIAS_HOJAS * DIA_MS).toISOString())
    .order('created_at', { ascending: false })
    .limit(500)
  const enPlazo: HojaAbierta[] = []
  let vencidas = 0
  for (const f of (data ?? []) as Fila[]) {
    const h = leerHojaRegistrada(typeof f.body === 'string' ? f.body : null)
    if (!h || typeof h.venceDia !== 'string') continue
    const p = diasHabilesQueFaltan(h.venceDia, ahora)
    if (!p) continue
    if (p.vencido) {
      vencidas += 1
      continue
    }
    enPlazo.push({
      numero: h.numero,
      tipo: h.tipo === 'queja' ? 'queja' : 'reclamo',
      nombre: h.nombre,
      vence: h.vence,
      venceDia: h.venceDia,
      dias: p.dias,
    })
  }
  enPlazo.sort((a, b) => a.venceDia.localeCompare(b.venceDia) || a.numero.localeCompare(b.numero))
  return { enPlazo, vencidas, error: !!error }
}

/* ---------- Las cuentas ---------- */

export interface Monto {
  moneda: string
  total: number
}

export interface FilaOrigen {
  origen: string
  pedidos: number
  pagados: number
  cobrado: Monto[]
  inscripciones: number
}

export interface Cifras {
  pedidos: number
  pagados: number
  /** Lo cobrado (pedidos pagados), por moneda: soles primero */
  cobrado: Monto[]
  inscripciones: number
  /** De dónde llegaron, el que más trajo arriba; «sin dato» al final */
  porOrigen: FilaOrigen[]
}

const redondear = (n: number) => Math.round(n * 100) / 100

function sumar(montos: Monto[], moneda: string, total: number) {
  const m = montos.find((x) => x.moneda === moneda)
  if (m) m.total = redondear(m.total + total)
  else montos.push({ moneda, total: redondear(total) })
}

const ordenarMontos = (montos: Monto[]) =>
  montos.sort((a, b) => (a.moneda === 'PEN' ? -1 : b.moneda === 'PEN' ? 1 : a.moneda.localeCompare(b.moneda)))

const enRango = (iso: string, desde: Date, hasta: Date) => {
  const t = Date.parse(iso)
  return t >= desde.getTime() && t < hasta.getTime()
}

/** Las cifras de un tramo, tomadas de movimientos ya leídos (que lo cubren) */
export function cifrasDe(m: Movimientos, desde: Date, hasta: Date): Cifras {
  const pedidos = m.pedidos.filter((p) => enRango(p.fecha, desde, hasta))
  const inscripciones = m.inscripciones.filter((i) => enRango(i.fecha, desde, hasta))
  const filas = new Map<string, FilaOrigen>()
  const fila = (origen: string) => {
    let f = filas.get(origen)
    if (!f) {
      f = { origen, pedidos: 0, pagados: 0, cobrado: [], inscripciones: 0 }
      filas.set(origen, f)
    }
    return f
  }
  const cobrado: Monto[] = []
  for (const p of pedidos) {
    const f = fila(p.origen)
    f.pedidos += 1
    if (p.pagado) {
      f.pagados += 1
      sumar(f.cobrado, p.moneda, p.total)
      sumar(cobrado, p.moneda, p.total)
    }
  }
  for (const i of inscripciones) fila(i.origen).inscripciones += 1
  const peso = (f: FilaOrigen) => f.pedidos * 2 + f.inscripciones
  const porOrigen = Array.from(filas.values())
    .map((f) => ({ ...f, cobrado: ordenarMontos(f.cobrado) }))
    .sort((a, b) =>
      a.origen === SIN_DATO ? 1 : b.origen === SIN_DATO ? -1 : peso(b) - peso(a) || a.origen.localeCompare(b.origen),
    )
  return {
    pedidos: pedidos.length,
    pagados: pedidos.filter((p) => p.pagado).length,
    cobrado: ordenarMontos(cobrado),
    inscripciones: inscripciones.length,
    porOrigen,
  }
}

const SIMBOLO: Record<string, string> = { PEN: 'S/', USD: 'US$' }

/** «S/ 1,249.90» (y «S/ 120.00 · US$ 10.00» si hay otra moneda); «S/ 0.00» si no hay nada */
export function textoMontos(montos: Monto[]): string {
  if (montos.length === 0) return 'S/ 0.00'
  return montos
    .map(
      (m) =>
        `${SIMBOLO[m.moneda] ?? m.moneda} ${m.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    )
    .join(' · ')
}

/* ---------- El tablero del panel ---------- */

export type ClavePeriodo = 'hoy' | 'ayer' | 'semana'

export interface PeriodoTablero {
  clave: ClavePeriodo
  nombre: string
  /** «jueves 19 de noviembre de 2026», o «del viernes 14 al jueves 20 de noviembre» */
  detalle: string
  cifras: Cifras
}

export interface TableroMedicion {
  periodos: PeriodoTablero[]
  hojas: EstadoHojas
  /** Lo que no se pudo leer */
  errores: string[]
}

/** Hoy (hasta ahora), ayer y los últimos 7 días (hoy y los 6 anteriores), por origen, y las hojas del Libro */
export async function tableroMedicion(ahora: Date = new Date()): Promise<TableroMedicion> {
  const hoy = inicioDelDiaLima(ahora)
  const ayer = new Date(hoy.getTime() - DIA_MS)
  const semana = new Date(hoy.getTime() - 6 * DIA_MS)
  const fin = new Date(ahora.getTime() + 1000)
  const [movs, hojas] = await Promise.all([leerMovimientos(semana, fin), leerHojasAbiertas(ahora)])
  const sinAnio = (d: Date) => fechaTexto(d).replace(/ de \d{4}$/, '')
  return {
    periodos: [
      { clave: 'hoy', nombre: 'Hoy', detalle: `${sinAnio(hoy)}, hasta ahora`, cifras: cifrasDe(movs, hoy, fin) },
      { clave: 'ayer', nombre: 'Ayer', detalle: sinAnio(ayer), cifras: cifrasDe(movs, ayer, hoy) },
      {
        clave: 'semana',
        nombre: '7 días',
        detalle: `Del ${sinAnio(semana)} a hoy`,
        cifras: cifrasDe(movs, semana, fin),
      },
    ],
    hojas: { enPlazo: hojas.enPlazo, vencidas: hojas.vencidas },
    errores: [...movs.errores, ...(hojas.error ? ['el Libro de Reclamaciones'] : [])],
  }
}

/* ---------- El correo de las 8 a. m. ---------- */

export interface ResumenDelDia {
  /** «jueves 19 de noviembre de 2026» */
  dia: string
  cifras: Cifras
  /** Los últimos 7 días, hasta ese día */
  semana: Cifras
  pedidos: PedidoLeido[]
  /** Hojas con el plazo corriendo a las que les quedan 5 días hábiles o menos */
  hojasPronto: HojaAbierta[]
  hojasEnPlazo: number
  hojasVencidas: number
  errores: string[]
}

/** El resumen del día anterior a `ahora` (en Lima) */
export async function resumenDelDiaAnterior(ahora: Date = new Date()): Promise<ResumenDelDia> {
  const hoy = inicioDelDiaLima(ahora)
  const ayer = new Date(hoy.getTime() - DIA_MS)
  const semana = new Date(hoy.getTime() - 7 * DIA_MS)
  const [movs, hojas] = await Promise.all([leerMovimientos(semana, hoy), leerHojasAbiertas(ahora)])
  return {
    dia: fechaTexto(ayer),
    cifras: cifrasDe(movs, ayer, hoy),
    semana: cifrasDe(movs, semana, hoy),
    pedidos: movs.pedidos.filter((p) => enRango(p.fecha, ayer, hoy)).reverse(),
    hojasPronto: hojas.enPlazo.filter((h) => h.dias <= DIAS_HABILES_PRONTO),
    hojasEnPlazo: hojas.enPlazo.length,
    hojasVencidas: hojas.vencidas,
    errores: [...movs.errores, ...(hojas.error ? ['el Libro de Reclamaciones'] : [])],
  }
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

const ESTADOS: Record<string, string> = {
  pending: 'por pagar',
  paid: 'pagado',
  processing: 'en preparación',
  shipped: 'enviado',
  delivered: 'entregado',
}

function lineaCifras(c: Cifras): string {
  return [
    plural(c.pedidos, 'pedido', 'pedidos') + (c.pedidos ? ` (${plural(c.pagados, 'pagado', 'pagados')})` : ''),
    `${textoMontos(c.cobrado)} cobrados`,
    plural(c.inscripciones, 'inscripción a la clase', 'inscripciones a la clase'),
  ].join(' · ')
}

export function plazoTexto(dias: number): string {
  return dias === 0 ? 'vence hoy' : `quedan ${plural(dias, 'día hábil', 'días hábiles')}`
}

/** El asunto y el texto del correo */
export function textoResumen(r: ResumenDelDia, panel = 'https://www.rrboxing.com/admin'): { asunto: string; texto: string } {
  const c = r.cifras
  const diaCorto = r.dia.replace(/ de \d{4}$/, '')
  const asunto = `RR Boxing · ${diaCorto}: ${plural(c.pedidos, 'pedido', 'pedidos')}, ${textoMontos(c.cobrado)} cobrados`

  const bloques: string[] = [`Resumen de RR Boxing del ${r.dia}`, lineaCifras(c)]

  if (c.porOrigen.length > 0) {
    bloques.push(
      [
        'Por origen',
        ...c.porOrigen.map((f) => {
          const partes = []
          if (f.pedidos) {
            partes.push(plural(f.pedidos, 'pedido', 'pedidos'))
            if (f.pagados) partes.push(`${textoMontos(f.cobrado)} cobrados`)
          }
          if (f.inscripciones) partes.push(plural(f.inscripciones, 'inscripción', 'inscripciones'))
          return `- ${f.origen}: ${partes.join(', ')}`
        }),
      ].join('\n'),
    )
  }

  if (r.pedidos.length > 0) {
    bloques.push(
      [
        'Pedidos del día',
        ...r.pedidos.map((p) => {
          const estado = ESTADOS[p.estado] ?? p.estado
          const pago = p.pagado && p.formaPago ? ` (${p.formaPago})` : ''
          const total = textoMontos([{ moneda: p.moneda, total: p.total }])
          return `- ${horaLima(p.fecha)} · ${p.cliente} · ${p.productos || 'sin detalle'} · ${total} · ${estado}${pago} · ${p.origen}`
        }),
      ].join('\n'),
    )
  }

  const libro = ['Libro de Reclamaciones']
  if (r.hojasPronto.length > 0) {
    libro.push(
      ...r.hojasPronto.map(
        (h) => `- ${h.numero} · ${h.tipo === 'queja' ? 'Queja' : 'Reclamo'} de ${h.nombre} · vence el ${h.vence} (${plazoTexto(h.dias)})`,
      ),
    )
  } else {
    libro.push(`Ninguna hoja vence en los próximos ${DIAS_HABILES_PRONTO} días hábiles.`)
  }
  if (r.hojasEnPlazo > r.hojasPronto.length) {
    libro.push(`Con más plazo: ${plural(r.hojasEnPlazo - r.hojasPronto.length, 'hoja', 'hojas')}.`)
  }
  if (r.hojasVencidas > 0) {
    libro.push(
      `${plural(r.hojasVencidas, 'hoja venció', 'hojas vencieron')} en los últimos ${DIAS_HOJAS} días: revisa que se hayan respondido.`,
    )
  }
  bloques.push(libro.join('\n'))

  bloques.push(`Últimos 7 días\n${lineaCifras(r.semana)}`)

  if (r.errores.length > 0) {
    bloques.push(`Ojo: no se pudo leer ${r.errores.join(', ')}. Revisa el panel.`)
  }

  bloques.push(
    [
      `Panel: ${panel}`,
      'Las ventas se cuentan por la fecha del pedido. Las inscripciones a la clase son de quienes dejaron sus datos antes de ir a pagar.',
    ].join('\n'),
  )

  return { asunto, texto: bloques.join('\n\n') }
}
