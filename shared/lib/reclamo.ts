// La Hoja de Reclamación del Libro de Reclamaciones virtual de RR Boxing: sus campos, los textos oficiales y la
// revisión que hacen la página y el servidor antes de guardarla. Tomado del Libro de Longev, sin adjuntos.
// - Solo impiden presentarla el nombre, el documento, el domicilio o el correo (basta uno de los dos) y el
//   detalle: sin ellos la hoja se considera no presentada. Lo demás es opcional y nunca bloquea: un monto que no
//   se entiende se guarda tal como lo escribió, y si eligió un canal de respuesta sin su dato (o con el correo mal
//   escrito), se responde por el otro. La página avisa una vez, sin bloquear.
// - No se pide domicilio y correo a la vez, ni dos apellidos, ni una cuenta, un captcha o una declaración jurada.
// También va al navegador: nada de aquí es secreto.
import { empresa, esCorreo } from '@/shared/lib/empresa'

export type TipoDocumento = 'DNI' | 'CE' | 'PASAPORTE' | 'OTRO'
export type Canal = 'correo' | 'domicilio'
export type TipoHoja = 'reclamo' | 'queja'
export type Bien = 'producto' | 'servicio'
/**
 * Por qué la respuesta va por un canal distinto del que eligió: sin_domicilio (eligió carta y no dejó domicilio:
 * va por correo), sin_correo (eligió correo y no lo dejó: va por carta), correo_mal (el correo parece mal
 * escrito: va por carta y la copia no le llega por correo).
 */
export type CambioCanal = 'sin_domicilio' | 'sin_correo' | 'correo_mal'

export const TIPOS_DOCUMENTO: readonly { valor: TipoDocumento; texto: string }[] = [
  { valor: 'DNI', texto: 'DNI' },
  { valor: 'CE', texto: 'Carné de extranjería' },
  { valor: 'PASAPORTE', texto: 'Pasaporte' },
  { valor: 'OTRO', texto: 'Otro' },
]
export const textoDocumento = (t: TipoDocumento) => TIPOS_DOCUMENTO.find((x) => x.valor === t)?.texto ?? t

/** Quién responde la hoja (su encabezado). Lo que falta llega como null y se muestra «por confirmar». */
export interface Proveedor {
  razonSocial: string | null
  ruc: string | null
  /** Domicilio fiscal */
  domicilio: string | null
  nombreComercial: string
  /** «https://www.rrboxing.com» */
  sitio: string
  /** El correo de atención: el respaldo si el formulario falla */
  correo: string | null
  /** 9 dígitos, sin el 51 */
  whatsapp: string | null
}

/** El sitio donde vive el Libro (el mismo de app/sitemap.ts) */
export const SITIO = 'https://www.rrboxing.com'

/**
 * El encabezado de la hoja: quién vende, de las variables EMPRESA_* y CONTACTO_* (shared/lib/empresa.ts).
 * Solo en el servidor: en el navegador esas variables no existen.
 */
export function proveedorDelLibro(): Proveedor {
  const e = empresa()
  return {
    razonSocial: e.razonSocial,
    ruc: e.ruc,
    domicilio: e.domicilio,
    nombreComercial: 'RR Boxing',
    sitio: SITIO,
    correo: e.correo,
    whatsapp: e.whatsapp,
  }
}

/** Hasta dónde se guarda cada campo. Con todo lleno, la hoja queda muy por debajo de los 20 KB que acepta el servidor. */
export const LIMITES = {
  nombre: 150,
  documento: 20,
  domicilio: 300,
  correo: 254,
  telefono: 30,
  descripcion: 300,
  /** Se escribe como texto: si no es un número limpio («59 soles»), se guarda tal cual */
  monto: 40,
  detalle: 4000,
  pedido: 2000,
} as const

/** El tope del cuerpo que recibe POST /api/reclamo */
export const MAX_BYTES_HOJA = 20 * 1024

/**
 * Textos oficiales (Anexo I del Reglamento del Libro de Reclamaciones, con sus modificatorias). Van en el
 * formulario, la constancia y el correo.
 */
export const TEXTOS_HOJA = {
  reclamo: 'Disconformidad relacionada a los productos o servicios.',
  queja: 'Disconformidad no relacionada a los productos o servicios; o, malestar o descontento respecto a la atención al público.',
  leyendas: [
    'La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.',
    'El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles, el cual es improrrogable.',
  ],
  /** Reemplaza a la firma, que solo existe en el libro físico. No es una declaración jurada. */
  confirmacion: 'Al presentar, confirmas que deseas presentar este reclamo o queja.',
  baseLegal:
    'Código de Protección y Defensa del Consumidor (Ley N.º 29571) y Reglamento del Libro de Reclamaciones (D.S. N.º 011-2011-PCM) y sus modificatorias.',
} as const

/** Cómo va la respuesta, en la constancia: «Correo (no dejaste domicilio)» */
export function respuestaPorTexto(r: { respuestaPor: Canal; cambioCanal: CambioCanal | null }): string {
  const canal = r.respuestaPor === 'correo' ? 'Correo' : 'Carta al domicilio'
  if (r.cambioCanal === 'sin_domicilio') return `${canal} (no dejaste domicilio)`
  if (r.cambioCanal === 'sin_correo') return `${canal} (no dejaste correo)`
  if (r.cambioCanal === 'correo_mal') return `${canal} (el correo parece mal escrito)`
  return canal
}

/** La hoja revisada, en el orden del Anexo I */
export interface ReclamoValido {
  // 1. Identificación del consumidor reclamante
  nombre: string
  documentoTipo: TipoDocumento
  documentoNumero: string
  domicilio: string | null
  /** Tal como lo escribió (aunque parezca mal escrito: entonces la respuesta va por carta) */
  correo: string | null
  telefono: string | null
  menor: boolean
  /** Padre, madre o apoderado: solo si es menor de edad y lo escribió */
  apoderado: string | null
  /** Cómo va la respuesta: la que eligió, si dejó ese dato; si no eligió, la del dato que dejó (el correo, si dejó los dos) */
  respuestaPor: Canal
  /** Si va por otro canal que el elegido, por qué */
  cambioCanal: CambioCanal | null
  // 2. Identificación del bien contratado
  bien: Bien | null
  /** Monto reclamado en soles */
  monto: number | null
  /** El monto tal como lo escribió, si no es un número limpio («59 soles + envío») */
  montoTexto: string | null
  descripcion: string | null
  // 3. Detalle de la reclamación y pedido del consumidor
  /** Si no marcó nada, se tramita como reclamo */
  tipo: TipoHoja
  detalle: string
  pedido: string | null
}

/** La hoja como queda guardada (el body de admin_notifications, en JSON) */
export interface HojaRegistrada extends ReclamoValido {
  version: 1
  /** «2026-000001» */
  numero: string
  /** true si el conteo del año falló y el número lleva un sufijo al azar */
  numeroProvisional: boolean
  /** El instante, en ISO */
  fecha: string
  /** «20 de noviembre de 2026, 10:30 (hora de Lima)» */
  fechaTexto: string
  /** «martes 15 de diciembre de 2026» */
  vence: string
  /** «2026-12-15» */
  venceDia: string
  plazoDiasHabiles: number
  /** Quién vendía al presentarse la hoja */
  proveedor: Proveedor
  /** Si salió la copia por correo: al consumidor y a la tienda. null: no se intentó (sin correo o sin Resend). */
  copia?: { consumidor: boolean | null; tienda: boolean | null }
}

/** El campo que falta o está mal. «contacto»: no dejó ni domicilio ni correo. «trampa»: lo llenó un programa. */
export type CampoReclamo = 'hoja' | 'trampa' | 'nombre' | 'documentoTipo' | 'documentoNumero' | 'contacto' | 'correo' | 'detalle'

/** Un aviso que no bloquea: la página lo muestra una vez y, si se presenta igual, la hoja va así */
export type AvisoReclamo = 'monto' | CambioCanal

export type ResultadoReclamo = { ok: true; reclamo: ReclamoValido } | { ok: false; campo: CampoReclamo }

const objeto = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}

// Caracteres de control (NUL, retroceso, escape…), por ejemplo de un texto pegado de un PDF. Postgres no acepta el
// NUL en una columna de texto: la hoja no se podría guardar. Se quitan al entrar, en la página y en el servidor.
const CONTROL = /[\u0000-\u001F\u007F]/g
/** Los mismos, salvo el salto de línea, el retorno y el tabulador (los párrafos los ordenan después) */
const CONTROL_SIN_SALTOS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

/** Una línea: sin saltos, caracteres de control ni espacios de más, hasta `max` caracteres */
export const linea = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim().slice(0, max).trim() : ''

/**
 * Un texto largo: conserva los saltos de línea (como mucho una línea en blanco seguida) y quita los caracteres de
 * control y los espacios de más
 */
export const parrafos = (v: unknown, max: number) =>
  typeof v === 'string'
    ? v
        .replace(CONTROL_SIN_SALTOS, '')
        .replace(/\r\n?/g, '\n')
        .replace(/[^\S\n]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, max)
        .trim()
    : ''

/** Basta una letra: se acepta un solo apellido */
// Con new RegExp: el proyecto no fija un target de TypeScript y la marca «u» en un literal no compila
const LETRA = new RegExp('\\p{L}', 'u')
const DOCUMENTO_OTRO = new RegExp('^[\\p{L}\\p{N}]{4,20}$', 'u')
const nombreValido = (nombre: string) => LETRA.test(nombre)

const tipoDocumento = (v: unknown): TipoDocumento | null =>
  TIPOS_DOCUMENTO.some((t) => t.valor === v) ? (v as TipoDocumento) : null

/** El número sin espacios, puntos ni guiones, en mayúsculas */
export const limpiarDocumento = (v: unknown) =>
  typeof v === 'string' ? v.replace(/[\s.\-]/g, '').toUpperCase().slice(0, 40) : ''

/** DNI: 8 dígitos. Carné de extranjería, pasaporte u otro: de 4 a 20 letras o números. */
export const documentoValido = (tipo: TipoDocumento, numero: string) =>
  tipo === 'DNI' ? /^\d{8}$/.test(numero) : DOCUMENTO_OTRO.test(numero)

/** «59», «59.90», «59,90», «S/ 1,234.50» → número; vacío → null; otra cosa → undefined */
export function leerMonto(v: unknown): number | null | undefined {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 && v < 1e8 ? Math.round(v * 100) / 100 : undefined
  if (typeof v !== 'string') return undefined
  let t = v.replace(/^\s*s\/\.?/i, '').replace(/\s/g, '')
  if (!t) return null
  if (t.includes(',') && t.includes('.')) t = t.replace(/,/g, '')
  else if (/,\d{1,2}$/.test(t)) t = t.replace(',', '.')
  else t = t.replace(/,(?=\d{3}(?!\d))/g, '')
  return /^\d{1,7}(\.\d{1,2})?$/.test(t) ? Number(t) : undefined
}

/** «S/ 1,234.50» */
export const soles = (n: number) =>
  `S/ ${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`

/**
 * Los datos sin los que la hoja no vale, en el orden de la hoja: nombre, documento, domicilio o correo (el correo
 * mal escrito solo cuenta como falta si no dejó domicilio) y el detalle. La página y el servidor revisan lo mismo.
 */
export function revisarObligatorios(datos: unknown): CampoReclamo[] {
  const d = objeto(datos)
  const errores: CampoReclamo[] = []
  if (!nombreValido(linea(d.nombre, LIMITES.nombre))) errores.push('nombre')
  const tipo = tipoDocumento(d.documentoTipo)
  if (!tipo) errores.push('documentoTipo')
  else if (!documentoValido(tipo, limpiarDocumento(d.documentoNumero))) errores.push('documentoNumero')
  const domicilio = linea(d.domicilio, LIMITES.domicilio)
  const correo = linea(d.correo, LIMITES.correo)
  if (!domicilio && !correo) errores.push('contacto')
  else if (!domicilio && !esCorreo(correo)) errores.push('correo')
  if (!parrafos(d.detalle, LIMITES.detalle)) errores.push('detalle')
  return errores
}

/** El canal de respuesta: el elegido si dejó ese dato; si no, el otro (y por qué) */
function canalDe(
  elegido: Canal | null,
  domicilio: string | null,
  correo: string | null,
): { respuestaPor: Canal; cambioCanal: CambioCanal | null } {
  const correoBien = !!correo && esCorreo(correo)
  if (elegido === 'domicilio' && !domicilio && correoBien) return { respuestaPor: 'correo', cambioCanal: 'sin_domicilio' }
  if (elegido === 'domicilio') return { respuestaPor: 'domicilio', cambioCanal: null }
  if (correoBien) return { respuestaPor: 'correo', cambioCanal: null }
  if (domicilio) {
    // Eligió correo y no lo dejó, o el correo parece mal escrito: va por carta
    if (correo) return { respuestaPor: 'domicilio', cambioCanal: 'correo_mal' }
    return { respuestaPor: 'domicilio', cambioCanal: elegido === 'correo' ? 'sin_correo' : null }
  }
  // Sin domicilio ni un correo bien escrito la hoja no se presenta (revisarObligatorios)
  return { respuestaPor: correo ? 'correo' : 'domicilio', cambioCanal: null }
}

/**
 * La hoja limpia y con sus valores por defecto, sin revisar nada (para eso, validarReclamo). La página la usa
 * para armar la constancia con lo mismo que quedó registrado en el servidor.
 */
export function normalizarReclamo(datos: unknown): ReclamoValido {
  const d = objeto(datos)
  const domicilio = linea(d.domicilio, LIMITES.domicilio) || null
  const correo = linea(d.correo, LIMITES.correo) || null
  const menor = d.menor === true
  const elegido = d.respuestaPor === 'correo' || d.respuestaPor === 'domicilio' ? d.respuestaPor : null
  const monto = leerMonto(d.monto)
  return {
    nombre: linea(d.nombre, LIMITES.nombre),
    documentoTipo: tipoDocumento(d.documentoTipo) ?? 'OTRO',
    documentoNumero: limpiarDocumento(d.documentoNumero),
    domicilio,
    correo,
    telefono: linea(d.telefono, LIMITES.telefono) || null,
    menor,
    apoderado: menor ? linea(d.apoderado, LIMITES.nombre) || null : null,
    ...canalDe(elegido, domicilio, correo),
    bien: d.bien === 'producto' || d.bien === 'servicio' ? d.bien : null,
    monto: monto ?? null,
    montoTexto: monto === undefined ? linea(d.monto, LIMITES.monto) || null : null,
    descripcion: linea(d.descripcion, LIMITES.descripcion) || null,
    tipo: d.tipo === 'queja' ? 'queja' : 'reclamo',
    detalle: parrafos(d.detalle, LIMITES.detalle),
    pedido: parrafos(d.pedido, LIMITES.pedido) || null,
  }
}

/** Lo que conviene avisar antes de presentar, sin bloquear: un canal que cambia y un monto que no se entiende */
export function revisarAvisos(datos: unknown): AvisoReclamo[] {
  const h = normalizarReclamo(datos)
  const avisos: AvisoReclamo[] = []
  if (h.cambioCanal) avisos.push(h.cambioCanal)
  if (h.montoTexto) avisos.push('monto')
  return avisos
}

export function validarReclamo(datos: unknown): ResultadoReclamo {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return { ok: false, campo: 'hoja' }
  const d = datos as Record<string, unknown>
  // Campo trampa: invisible para las personas. Si llega lleno, lo llenó un programa.
  if (typeof d.trampa === 'string' && d.trampa.trim()) return { ok: false, campo: 'trampa' }
  const [error] = revisarObligatorios(d)
  if (error) return { ok: false, campo: error }
  return { ok: true, reclamo: normalizarReclamo(d) }
}

/** «2026-000001» (o, si el conteo falló, «2026-K7Q2XM») */
export const NUMERO_HOJA = /^\d{4}-[0-9A-Z]{6}$/

/** La hoja guardada, desde el body de admin_notifications. null si no se entiende. */
export function leerHojaRegistrada(body: string | null): HojaRegistrada | null {
  if (!body) return null
  try {
    const h = JSON.parse(body) as Partial<HojaRegistrada>
    if (!h || typeof h !== 'object' || typeof h.numero !== 'string' || typeof h.nombre !== 'string') return null
    return h as HojaRegistrada
  } catch {
    return null
  }
}

const porConfirmar = (v: string | null) => v ?? 'por confirmar'

/**
 * La hoja en texto plano, para el correo: la copia del consumidor (y el aviso a la tienda). Una fila por dato,
 * en el orden de la hoja, con las leyendas al final.
 */
export function textoConstancia(h: HojaRegistrada): string {
  const p = h.proveedor
  const monto = h.monto !== null ? soles(h.monto) : h.montoTexto
  const filas = (lista: [string, string | null | undefined][]) =>
    lista.map(([t, v]) => `${t}: ${v && v.trim() ? v : '—'}`).join('\n')
  const bloques = [
    `Hoja de Reclamación N.º ${h.numero}`,
    filas([
      ['Fecha', h.fechaTexto],
      ['Plazo de respuesta', `${h.plazoDiasHabiles} días hábiles, hasta el ${h.vence}`],
    ]),
    `Proveedor\n${filas([
      ['Nombre o razón social', porConfirmar(p.razonSocial)],
      ['RUC', porConfirmar(p.ruc)],
      ['Domicilio fiscal', porConfirmar(p.domicilio)],
      ['Nombre comercial', p.nombreComercial],
      ['Sitio web', p.sitio],
    ])}`,
    `1. Identificación del consumidor reclamante\n${filas([
      ['Nombre', h.nombre],
      ['Documento', `${textoDocumento(h.documentoTipo)} ${h.documentoNumero}`],
      ['Domicilio', h.domicilio],
      ['Correo', h.correo],
      ['Teléfono', h.telefono],
      ['Menor de edad', h.menor ? 'Sí' : 'No'],
      ...(h.menor ? ([['Padre, madre o apoderado', h.apoderado]] as [string, string | null][]) : []),
      ['Respuesta por', respuestaPorTexto(h)],
    ])}`,
    `2. Identificación del bien contratado\n${filas([
      ['Producto o servicio', h.bien === 'producto' ? 'Producto' : h.bien === 'servicio' ? 'Servicio' : null],
      ['Monto reclamado', monto],
      ['Descripción', h.descripcion],
    ])}`,
    `3. Detalle de la reclamación y pedido del consumidor\n${filas([
      ['Tipo', h.tipo === 'queja' ? 'Queja' : 'Reclamo'],
      ['Detalle', h.detalle],
      ['Pedido del consumidor', h.pedido],
    ])}`,
    `Reclamo: ${TEXTOS_HOJA.reclamo}\nQueja: ${TEXTOS_HOJA.queja}`,
    TEXTOS_HOJA.leyendas.map((t) => `* ${t}`).join('\n'),
    `Base legal: ${TEXTOS_HOJA.baseLegal}`,
  ]
  return bloques.join('\n\n')
}
