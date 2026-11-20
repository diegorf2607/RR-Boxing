// Los textos legales (términos, privacidad, cambios y garantía) son datos: secciones con id, título y bloques de
// texto. Se arman desde una sola fuente (quién vende, el combo, la clase y las políticas de shared/legal), se
// pueden leer como texto plano y un solo componente los muestra (components/legal/Documento.tsx).
// Modelo: Longev (lib/legal/tipos.ts), adaptado a RR Boxing.

/** Un pedazo de una línea: texto, un enlace o un dato que falta (se ve como «… por confirmar»). */
export type Pieza = string | { texto: string; href: string } | { falta: string }

/** Una línea: un texto simple o varios pedazos seguidos. */
export type Texto = string | readonly Pieza[]

export interface Fila {
  nombre: Texto
  valor: Texto
  /** Una línea corta debajo del valor: el país de un proveedor, el plazo de un derecho */
  nota?: Texto
}

export type Bloque =
  | { tipo: 'parrafo'; texto: Texto }
  /** Letra chica, por ejemplo la base legal */
  | { tipo: 'nota'; texto: Texto }
  | { tipo: 'lista'; items: readonly Texto[] }
  /** Filas con nombre y valor, separadas por líneas finas. `etiquetaNota` se lee antes de cada nota. */
  | { tipo: 'filas'; filas: readonly Fila[]; etiquetaNota?: string }
  /** Un apartado con su subtítulo */
  | { tipo: 'grupo'; titulo: string; bloques: readonly Bloque[] }

export interface Seccion {
  /** El ancla: /reembolso#otro-motivo */
  id: string
  titulo: string
  bloques: readonly Bloque[]
}

export interface DocumentoLegal {
  titulo: string
  bajada: string
  version: string
  vigenteDesde: string
  secciones: readonly Seccion[]
}

/** La línea bajo la bajada: «Versión 1.0 · Vigente desde el 21 de noviembre de 2026» */
export const lineaDe = (d: DocumentoLegal) => `Versión ${d.version} · Vigente desde el ${d.vigenteDesde}`

/** Un dato que todavía no está: «Plazo por confirmar» */
export const falta = (que: string): Pieza => ({ falta: `${que} por confirmar` })
/** El valor de una fila cuyo nombre ya dice qué falta: «Por confirmar» */
export const porConfirmar: readonly Pieza[] = [{ falta: 'Por confirmar' }]
export const enlace = (texto: string, href: string): Pieza => ({ texto, href })

export const parrafo = (...texto: Pieza[]): Bloque => ({ tipo: 'parrafo', texto })
export const nota = (...texto: Pieza[]): Bloque => ({ tipo: 'nota', texto })
export const lista = (...items: Texto[]): Bloque => ({ tipo: 'lista', items })
export const filas = (f: readonly Fila[], etiquetaNota?: string): Bloque => ({ tipo: 'filas', filas: f, etiquetaNota })
export const grupo = (titulo: string, ...bloques: Bloque[]): Bloque => ({ tipo: 'grupo', titulo, bloques })

/** «Supabase y Vercel», «Supabase, Vercel y Resend» */
export const unir = (xs: readonly (string | number)[]) =>
  xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`

const textoPieza = (p: Pieza) => (typeof p === 'string' ? p : 'falta' in p ? p.falta : p.texto)

/** Una línea sin formato */
export const textoDe = (t: Texto): string => (typeof t === 'string' ? t : t.map(textoPieza).join(''))

function lineasDe(b: Bloque): string[] {
  switch (b.tipo) {
    case 'parrafo':
    case 'nota':
      return [textoDe(b.texto)]
    case 'lista':
      return b.items.map(textoDe)
    case 'filas':
      return b.filas.map((f) => {
        const partes = [textoDe(f.nombre), textoDe(f.valor)]
        if (f.nota) partes.push(`${b.etiquetaNota ? `${b.etiquetaNota}: ` : ''}${textoDe(f.nota)}`)
        return partes.join(' · ')
      })
    case 'grupo':
      return [b.titulo, ...b.bloques.flatMap(lineasDe)]
  }
}

/** Todos los enlaces de un documento (para revisar que apunten a donde deben) */
export function enlacesDe(d: DocumentoLegal): { texto: string; href: string }[] {
  const deTexto = (t: Texto) =>
    typeof t === 'string'
      ? []
      : t.filter((p): p is { texto: string; href: string } => typeof p !== 'string' && 'href' in p)
  const deBloque = (b: Bloque): { texto: string; href: string }[] => {
    switch (b.tipo) {
      case 'parrafo':
      case 'nota':
        return deTexto(b.texto)
      case 'lista':
        return b.items.flatMap(deTexto)
      case 'filas':
        return b.filas.flatMap((f) => [...deTexto(f.nombre), ...deTexto(f.valor), ...(f.nota ? deTexto(f.nota) : [])])
      case 'grupo':
        return b.bloques.flatMap(deBloque)
    }
  }
  return d.secciones.flatMap((s) => s.bloques.flatMap(deBloque))
}

/** El documento entero como texto plano, una línea por párrafo, fila o punto */
export function textoPlano(d: DocumentoLegal): string {
  return [
    d.titulo,
    d.bajada,
    lineaDe(d),
    ...d.secciones.flatMap((s) => [s.titulo, ...s.bloques.flatMap(lineasDe)]),
  ].join('\n')
}
