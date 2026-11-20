// De dónde llegó cada persona (primer contacto), para saber qué red trae ventas e inscripciones.
// Se guarda solo en el navegador (localStorage, sin cookies) la primera vez que alguien entra, y viaja
// con el pedido y con la inscripción a la clase. Los atajos rrboxing.com/ig, /tt, /fb y /wa llegan con utm.

export interface Origen {
  /** utm_source o el dominio que lo trajo: «instagram», «tiktok», «google», «directo»… */
  fuente: string
  /** utm_medium: «bio», «historia», «anuncio», «organico»… */
  medio?: string
  /** utm_campaign */
  campana?: string
  /** La primera página que vio, sin parámetros */
  entrada?: string
  /** Fecha y hora ISO de la primera visita */
  fecha: string
}

const CLAVE = 'rrboxing_origen'
const MAX = 60

const corto = (v: string | null | undefined) => (v ? v.trim().toLowerCase().slice(0, MAX) : undefined)

/** «l.instagram.com» → «instagram»; el propio sitio o sin referente → null */
function fuenteDelReferente(referente: string): string | null {
  try {
    const host = new URL(referente).hostname.replace(/^www\./, '')
    if (!host || host.endsWith('rrboxing.com') || host === 'localhost') return null
    for (const red of ['instagram', 'tiktok', 'facebook', 'google', 'youtube', 'whatsapp', 'bing']) {
      if (host.includes(red)) return red
    }
    if (host === 't.co' || host.includes('twitter') || host === 'x.com') return 'x'
    if (host === 'fb.me' || host === 'm.me') return 'facebook'
    if (host === 'wa.me') return 'whatsapp'
    return host.slice(0, MAX)
  } catch {
    return null
  }
}

/** Arma el origen con la URL y el referente actuales (no lo guarda). */
export function origenDeLaVisita(url: string, referente: string, ahora = new Date()): Origen {
  const u = new URL(url)
  const fuente = corto(u.searchParams.get('utm_source')) ?? fuenteDelReferente(referente) ?? 'directo'
  return {
    fuente,
    medio: corto(u.searchParams.get('utm_medium')),
    campana: corto(u.searchParams.get('utm_campaign')),
    entrada: u.pathname.slice(0, MAX),
    fecha: ahora.toISOString(),
  }
}

/** Guarda el primer origen si todavía no hay uno. Llamar una vez al cargar cualquier página (cliente). */
export function registrarOrigen(): void {
  try {
    if (localStorage.getItem(CLAVE)) return
    localStorage.setItem(CLAVE, JSON.stringify(origenDeLaVisita(location.href, document.referrer)))
  } catch {
    /* navegador sin localStorage: no pasa nada */
  }
}

/** El origen guardado, o null. Para mandarlo con un pedido o una inscripción (cliente). */
export function leerOrigen(): Origen | null {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? limpiarOrigen(JSON.parse(crudo)) : null
  } catch {
    return null
  }
}

/** Valida lo que llega del navegador antes de guardarlo (servidor). */
export function limpiarOrigen(v: unknown): Origen | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const texto = (x: unknown) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, MAX) : undefined)
  const fuente = texto(o.fuente)
  if (!fuente) return null
  const fecha = texto(o.fecha)
  return {
    fuente,
    medio: texto(o.medio),
    campana: texto(o.campana),
    entrada: texto(o.entrada),
    fecha: fecha && !Number.isNaN(Date.parse(fecha)) ? fecha : new Date().toISOString(),
  }
}

/** «instagram · bio» para mostrar en el panel */
export const origenTexto = (o: Origen | null | undefined) =>
  o ? [o.fuente, o.medio, o.campana].filter(Boolean).join(' · ') : 'sin dato'
