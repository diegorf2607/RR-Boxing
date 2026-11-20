// Plazos en días hábiles del Perú, en la hora de Lima (UTC−5 todo el año: no hay horario de verano).
// Un reclamo o una queja se responde en 15 días hábiles como máximo, contados desde el día siguiente a la
// presentación (Ley 29571, art. 24.1; D.S. 011-2011-PCM y modificatorias). No cuentan los sábados, los domingos
// ni los feriados nacionales: los de FERIADOS_FIJOS, más el Jueves y el Viernes Santo, que salen de la Pascua.
// Copiado del Libro de Reclamaciones de Longev (lib/tienda/plazos.ts). Sirve en el servidor y en el navegador.

const HORA_MS = 60 * 60 * 1000
const DIA_MS = 24 * HORA_MS
/** Lima va 5 horas detrás de UTC todo el año */
const DESFASE_LIMA_MS = 5 * HORA_MS

export const PLAZO_RECLAMO_DIAS_HABILES = 15

/** Feriados nacionales de fecha fija, como [mes, día] */
export const FERIADOS_FIJOS: readonly (readonly [number, number])[] = [
  [1, 1], // Año Nuevo
  [5, 1], // Día del Trabajo
  [6, 7], // Batalla de Arica y Día de la Bandera
  [6, 29], // San Pedro y San Pablo
  [7, 23], // Día de la Fuerza Aérea del Perú
  [7, 28], // Fiestas Patrias
  [7, 29], // Fiestas Patrias
  [8, 6], // Batalla de Junín
  [8, 30], // Santa Rosa de Lima
  [10, 8], // Combate de Angamos
  [11, 1], // Todos los Santos
  [12, 8], // Inmaculada Concepción
  [12, 9], // Batalla de Ayacucho
  [12, 25], // Navidad
]

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

/**
 * El día de Lima en que cae un instante. Los días se cuentan como la medianoche UTC de esa fecha: así sumar
 * un día es sumar 24 horas y nada depende del huso del servidor.
 */
const diaDeLima = (fecha: Date) => Math.floor((fecha.getTime() - DESFASE_LIMA_MS) / DIA_MS) * DIA_MS

/** «AAAA-MM-DD» de un día */
const clave = (dia: number) => new Date(dia).toISOString().slice(0, 10)

/** El domingo de Pascua de un año (calendario gregoriano, algoritmo de Meeus, Jones y Butcher) */
export function pascua(anio: number): { mes: number; dia: number } {
  const a = anio % 19
  const b = Math.floor(anio / 100)
  const c = anio % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const n = h + l - 7 * m + 114
  return { mes: Math.floor(n / 31), dia: (n % 31) + 1 }
}

const feriadosPorAnio = new Map<number, ReadonlySet<string>>()

/** Los feriados nacionales de un año, como «AAAA-MM-DD» */
export function feriados(anio: number): ReadonlySet<string> {
  let lista = feriadosPorAnio.get(anio)
  if (!lista) {
    const p = pascua(anio)
    const domingo = Date.UTC(anio, p.mes - 1, p.dia)
    lista = new Set([
      ...FERIADOS_FIJOS.map(([mes, dia]) => clave(Date.UTC(anio, mes - 1, dia))),
      clave(domingo - 3 * DIA_MS), // Jueves Santo
      clave(domingo - 2 * DIA_MS), // Viernes Santo
    ])
    feriadosPorAnio.set(anio, lista)
  }
  return lista
}

function esHabil(dia: number): boolean {
  const d = new Date(dia)
  const semana = d.getUTCDay()
  return semana !== 0 && semana !== 6 && !feriados(d.getUTCFullYear()).has(clave(dia))
}

/** ¿Es día hábil en el Perú el día (en Lima) de este instante? */
export const esDiaHabil = (fecha: Date) => esHabil(diaDeLima(fecha))

/**
 * El día hábil número `n`, contado desde el día siguiente a `fecha` (los días son los de Lima).
 * Devuelve ese día a las 12:00 de Lima (17:00 UTC): así su fecha es la misma en Lima y en UTC.
 * Para saber si un plazo venció, compara días (diaIso), no horas.
 */
export function sumarDiasHabiles(fecha: Date, n: number): Date {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`n tiene que ser un entero desde 0 (llegó ${n})`)
  if (Number.isNaN(fecha.getTime())) throw new RangeError('La fecha no es válida')
  let dia = diaDeLima(fecha)
  for (let contados = 0; contados < n; ) {
    dia += DIA_MS
    if (esHabil(dia)) contados += 1
  }
  return new Date(dia + 12 * HORA_MS + DESFASE_LIMA_MS)
}

/** Hasta cuándo hay para responder una hoja presentada en `presentada`: 15 días hábiles */
export const venceReclamo = (presentada: Date) => sumarDiasHabiles(presentada, PLAZO_RECLAMO_DIAS_HABILES)

/** «2026-12-03»: el día en Lima */
export const diaIso = (fecha: Date) => clave(diaDeLima(fecha))

/** El año en Lima de un instante, «2026» */
export const anioDeLima = (fecha: Date) => diaIso(fecha).slice(0, 4)

/**
 * Cuántos días hábiles quedan, desde hoy (en Lima), hasta el día `venceDia` («AAAA-MM-DD»), o cuántos pasaron
 * desde que venció. { dias: 0, vencido: false }: vence hoy. null: el día no es válido.
 */
export function diasHabilesQueFaltan(
  venceDia: string,
  ahora: Date = new Date(),
): { dias: number; vencido: boolean } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(venceDia)) return null
  const vence = Date.parse(`${venceDia}T00:00:00Z`)
  if (Number.isNaN(vence)) return null
  const hoy = diaDeLima(ahora)
  const vencido = hoy > vence
  const [desde, hasta] = vencido ? [vence, hoy] : [hoy, vence]
  let dias = 0
  for (let dia = desde + DIA_MS; dia <= hasta; dia += DIA_MS) if (esHabil(dia)) dias += 1
  return { dias, vencido }
}

/** «jueves 3 de diciembre de 2026», en Lima */
export function fechaTexto(fecha: Date): string {
  const d = new Date(diaDeLima(fecha))
  return `${SEMANA[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
}

/** «12 de noviembre de 2026, 23:30 (hora de Lima)» */
export function fechaHoraTexto(fecha: Date): string {
  const t = new Date(fecha.getTime() - DESFASE_LIMA_MS)
  const hora = `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`
  return `${t.getUTCDate()} de ${MESES[t.getUTCMonth()]} de ${t.getUTCFullYear()}, ${hora} (hora de Lima)`
}
