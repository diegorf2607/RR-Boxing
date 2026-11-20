// Un texto legal (términos, privacidad, cambios o garantía) armado como datos en shared/legal: título, versión,
// un índice con anclas y las secciones separadas por líneas finas, con unos 70 caracteres de ancho.
// Componente del servidor y sin JavaScript. Línea A: titulares angostos, filas con líneas finas, enlaces blancos
// subrayados (el amarillo queda para los botones).
import Link from 'next/link'
import { lineaDe, type Bloque, type DocumentoLegal, type Pieza, type Texto } from '@/shared/legal/tipos'

const claseEnlace =
  'font-medium text-white underline decoration-neutral decoration-1 underline-offset-4 [overflow-wrap:anywhere] hover:decoration-white'
/** Un dato que falta: se ve, pero sin gritar (el recuadro punteado de la maqueta, .por-confirmar) */
const claseFalta = 'por-confirmar text-neutral-light'

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
        <p className="text-sm text-neutral">
          <Linea texto={bloque.texto} />
        </p>
      )
    case 'lista':
      return (
        <ul className="space-y-2">
          {bloque.items.map((item, i) => (
            <li key={i} className="relative pl-5">
              <span aria-hidden="true" className="absolute left-0 text-neutral">
                –
              </span>
              <Linea texto={item} />
            </li>
          ))}
        </ul>
      )
    case 'filas':
      return (
        <dl className="filas">
          {bloque.filas.map((fila, i) => (
            <div key={i} className="grid gap-1 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-x-6">
              <dt>
                <Linea texto={fila.nombre} />
              </dt>
              <dd className="text-left text-[15.5px] font-normal text-white sm:col-start-2">
                <Linea texto={fila.valor} />
              </dd>
              {fila.nota && (
                <dd className="text-left text-sm font-normal text-neutral sm:col-start-2">
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
          <h3 className="pt-2 text-[17px] font-semibold text-white">{bloque.titulo}</h3>
          {bloque.bloques.map((b, i) => (
            <BloqueDeTexto key={i} bloque={b} />
          ))}
        </div>
      )
  }
}

export default function Documento({ doc }: { doc: DocumentoLegal }) {
  return (
    <article aria-labelledby="doc-titulo" className="text-neutral-light">
      <header className="max-w-3xl pb-10">
        <h1 id="doc-titulo" className="page-title">
          {doc.titulo}
        </h1>
        <p className="lead mt-5">{doc.bajada}</p>
        {doc.accion ? (
          <a
            href={doc.accion.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-7 sm:inline-flex sm:w-auto"
          >
            {doc.accion.texto}
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        ) : null}
        <p className="mt-5 text-sm text-neutral">{lineaDe(doc)}</p>
      </header>

      <div className="grid gap-10 border-t border-line pt-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,70ch)] lg:gap-16 lg:pt-10">
        <nav aria-labelledby="doc-indice" className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="doc-indice" className="mb-3 text-[14.5px] font-semibold text-white">
            En esta página
          </h2>
          <ol className="border-t border-line sm:columns-2 sm:gap-x-6 lg:columns-1">
            {doc.secciones.map((seccion) => (
              <li key={seccion.id} className="break-inside-avoid border-b border-line">
                <a
                  href={`#${seccion.id}`}
                  className="flex min-h-[44px] items-center py-2 text-[14.5px] leading-snug text-neutral-light transition-colors hover:text-white motion-reduce:transition-none"
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
              className={`scroll-mt-24 ${i > 0 ? 'border-t border-line pt-8 md:pt-10' : ''} pb-8 md:pb-10`}
            >
              <h2 id={`${seccion.id}-titulo`} className="mb-5 font-heading text-[26px] leading-[0.95] text-white md:text-[30px]">
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
