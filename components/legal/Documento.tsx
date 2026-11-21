// Un texto legal (términos, privacidad, cambios o garantía) armado como datos en shared/legal: título, versión,
// un índice con anclas y las secciones separadas por líneas finas, con unos 70 caracteres de ancho.
// Componente del servidor y sin JavaScript. En la línea de la tienda: página blanca, texto gris oscuro, líneas finas y
// enlaces subrayados en negro.
import Link from 'next/link'
import { lineaDe, type Bloque, type DocumentoLegal, type Pieza, type Texto } from '@/shared/legal/tipos'

const claseEnlace = 'enlace text-tinta [overflow-wrap:anywhere]'
/** Un dato que falta: se ve, pero sin gritar */
const claseFalta = 'border-b border-dashed border-suave text-suave'

function PiezaDeTexto({ pieza }: { pieza: Pieza }) {
  if (typeof pieza === 'string') return <>{pieza}</>
  if ('falta' in pieza) return <span className={claseFalta}>{pieza.falta}</span>
  const { texto, href } = pieza
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={claseEnlace}>
        {texto}
      </Link>
    )
  }
  if (href.startsWith('http')) {
    return (
      <a href={href} rel="noopener noreferrer" target="_blank" className={claseEnlace}>
        {texto}
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
    )
  }
  // Anclas de la misma página (#clases) y correo (mailto:)
  return (
    <a href={href} className={claseEnlace}>
      {texto}
    </a>
  )
}

function Linea({ texto }: { texto: Texto }) {
  if (typeof texto === 'string') return <>{texto}</>
  return (
    <>
      {texto.map((pieza, i) => (
        <PiezaDeTexto key={i} pieza={pieza} />
      ))}
    </>
  )
}

function BloqueDeTexto({ bloque }: { bloque: Bloque }) {
  switch (bloque.tipo) {
    case 'parrafo':
      return (
        <p>
          <Linea texto={bloque.texto} />
        </p>
      )
    case 'nota':
      return (
        <p className="text-sm text-suave">
          <Linea texto={bloque.texto} />
        </p>
      )
    case 'lista':
      return (
        <ul className="lista-amarilla">
          {bloque.items.map((item, i) => (
            <li key={i}>
              <Linea texto={item} />
            </li>
          ))}
        </ul>
      )
    case 'filas':
      return (
        <dl className="border-t border-linea">
          {bloque.filas.map((fila, i) => (
            <div
              key={i}
              className="grid gap-1 border-b border-linea py-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-x-6"
            >
              <dt className="text-sm text-suave">
                <Linea texto={fila.nombre} />
              </dt>
              <dd className="text-tinta sm:col-start-2">
                <Linea texto={fila.valor} />
              </dd>
              {fila.nota && (
                <dd className="text-sm text-suave sm:col-start-2">
                  {bloque.etiquetaNota && <span>{bloque.etiquetaNota}: </span>}
                  <Linea texto={fila.nota} />
                </dd>
              )}
            </div>
          ))}
        </dl>
      )
    case 'grupo':
      return (
        <div className="space-y-3">
          <h3 className="pt-2 text-base font-bold text-tinta">{bloque.titulo}</h3>
          {bloque.bloques.map((b, i) => (
            <BloqueDeTexto key={i} bloque={b} />
          ))}
        </div>
      )
  }
}

export default function Documento({ doc }: { doc: DocumentoLegal }) {
  return (
    <article aria-labelledby="doc-titulo" className="text-tinta-2">
      <header className="max-w-3xl pb-8">
        <h1 id="doc-titulo" className="page-title text-tinta">
          {doc.titulo}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-tinta-2">{doc.bajada}</p>
        {doc.accion ? (
          <a
            href={doc.accion.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-6 inline-flex w-auto"
          >
            {doc.accion.texto}
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        ) : null}
        <p className="mt-4 text-sm text-suave">{lineaDe(doc)}</p>
      </header>

      <div className="grid gap-10 border-t border-linea pt-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,70ch)] lg:gap-16">
        <nav aria-labelledby="doc-indice" className="lg:sticky lg:top-[92px] lg:self-start">
          <h2 id="doc-indice" className="mb-2 text-sm font-bold text-tinta">
            En esta página
          </h2>
          <ol className="border-t border-linea sm:columns-2 sm:gap-x-6 lg:columns-1">
            {doc.secciones.map((seccion) => (
              <li key={seccion.id} className="break-inside-avoid border-b border-linea">
                <a
                  href={`#${seccion.id}`}
                  className="flex min-h-[44px] items-center py-2 text-sm leading-snug text-tinta-2 underline-offset-[3px] hover:text-tinta hover:underline"
                >
                  {seccion.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0">
          {doc.secciones.map((seccion, i) => (
            <section
              key={seccion.id}
              id={seccion.id}
              aria-labelledby={`${seccion.id}-titulo`}
              className={`scroll-mt-24 ${i > 0 ? 'border-t border-linea pt-8' : ''} pb-8`}
            >
              <h2 id={`${seccion.id}-titulo`} className="mb-4 text-xl font-bold leading-snug text-tinta">
                {seccion.titulo}
              </h2>
              <div className="space-y-4 text-base leading-relaxed">
                {seccion.bloques.map((bloque, i) => (
                  <BloqueDeTexto key={i} bloque={bloque} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
