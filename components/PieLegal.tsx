// El legal del pie, igual en todas las páginas y debajo de todo: el Libro de Reclamaciones (siempre a la vista),
// quién vende, cómo escribirnos y los textos legales. Componente del servidor: lee empresa() al armarse.
// Mientras falte un dato de quién vende, se ve «por confirmar» en un recuadro punteado (nunca se inventa).
// Es la franja legal de la maqueta de la línea A: letra chica gris, separada del pie por una línea fina.
import Link from 'next/link'
import { empresa, identidad, whatsappVisible } from '@/shared/lib/empresa'
import { RUTAS } from '@/shared/legal/politicas'
import { enlaceWhatsappAtencion } from '@/shared/legal/vendedor'

const ENLACES = [
  { href: RUTAS.terminos, texto: 'Términos y condiciones' },
  { href: RUTAS.cambios, texto: 'Cambios y devoluciones' },
  { href: RUTAS.privacidad, texto: 'Política de privacidad' },
  { href: RUTAS.garantia, texto: 'Garantía' },
] as const

const claseEnlace = 'inline-flex min-h-[32px] items-center transition-colors hover:text-white'

function IconoLibro() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 6.5C10.3 5.2 8 4.5 4 4.5v13c4 0 6.3.7 8 2 1.7-1.3 4-2 8-2v-13c-4 0-6.3.7-8 2Z" />
      <path d="M12 6.5v13" />
    </svg>
  )
}

export default function PieLegal() {
  const e = empresa()
  const quien = identidad(e)

  return (
    <div className="border-t border-dark-300 bg-dark pb-24 pt-4 text-[13px] leading-relaxed text-neutral md:pb-8">
      <div className="wrap space-y-1">
        <div className="flex flex-wrap items-center gap-x-6">
          <Link
            href={RUTAS.libro}
            className="inline-flex min-h-[32px] items-center gap-2 font-medium text-neutral-light transition-colors hover:text-white"
          >
            <IconoLibro />
            Libro de Reclamaciones
          </Link>
          <nav aria-label="Textos legales">
            <ul className="flex flex-wrap gap-x-6">
              {ENLACES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={claseEnlace}>
                    {l.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="inline-flex min-h-[32px] items-center">© 2026 RR Boxing</span>
          {quien ? (
            <span>{quien}</span>
          ) : (
            <span>
              Razón social, RUC y domicilio: <span className="por-confirmar">por confirmar</span>
            </span>
          )}
          <span className="flex flex-wrap items-center gap-x-1">
            <span>Atención:</span>
            {e.correo ? (
              <a href={`mailto:${e.correo}`} className={`${claseEnlace} [overflow-wrap:anywhere]`}>
                {e.correo}
              </a>
            ) : (
              <span className="por-confirmar">correo por confirmar</span>
            )}
            {e.whatsapp && (
              <>
                <span aria-hidden="true">·</span>
                <a href={enlaceWhatsappAtencion(e.whatsapp)} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
                  WhatsApp {whatsappVisible(e.whatsapp)}
                </a>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
