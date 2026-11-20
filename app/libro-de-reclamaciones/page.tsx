// /libro-de-reclamaciones: el Libro de Reclamaciones virtual de RR Boxing. La Hoja de Reclamación se ve apenas abre
// la página: sin cuenta, sin captcha y sin pasos previos. Quién vende sale de las variables EMPRESA_* y CONTACTO_*
// (shared/lib/empresa.ts) al publicar: lo que falta se ve «por confirmar». Las hojas van a POST /api/reclamo y se
// revisan en /admin/reclamos.
import type { Metadata } from 'next'
import { CabeceraSola } from '@/components/LegalPageShell'
import HojaReclamacion, { Contacto } from '@/features/legal/HojaReclamacion'
import { PLAZO_RECLAMO_DIAS_HABILES } from '@/shared/lib/plazos'
import { proveedorDelLibro, TEXTOS_HOJA } from '@/shared/lib/reclamo'

export const metadata: Metadata = {
  title: 'Libro de Reclamaciones',
  description: `Presenta un reclamo o una queja a RR Boxing. Te respondemos por escrito en un plazo máximo de ${PLAZO_RECLAMO_DIAS_HABILES} días hábiles.`,
  alternates: { canonical: '/libro-de-reclamaciones' },
}

/**
 * Al imprimir (o guardar en PDF) sale solo la hoja: en blanco y negro, sin la barra de la clase, el WhatsApp
 * flotante ni los botones. Las filas no se parten entre páginas y un título no queda solo al pie.
 */
const IMPRESION = `
@media print {
  @page { margin: 14mm; }
  body > :not(#libro) { display: none !important; }
  html, body, #libro { background: #fff !important; color: #000 !important; }
  #libro * { color: #000 !important; background: transparent !important; border-color: #999 !important; box-shadow: none !important; }
  #libro .lr-no-imprimir { display: none !important; }
  #libro .lr-fila { break-inside: avoid; padding-top: 4pt; padding-bottom: 4pt; }
  #libro h1, #libro h2 { break-after: avoid; }
  #libro a { text-decoration: none; }
}
`

/** Sin JavaScript el botón de presentar no haría nada: se esconde y se ofrece escribir */
const SIN_JS = '<style>#lr-enviar{display:none!important}</style>'

export default function LibroDeReclamacionesPage() {
  const proveedor = proveedorDelLibro()

  return (
    <>
      {/* La barra con el logo queda fuera de #libro: al imprimir no sale (ver IMPRESION) */}
      <CabeceraSola />
      <main id="libro" className="bg-dark pb-16 pt-8 text-white md:pb-20 md:pt-12 print:min-h-0 print:p-0">
        <style dangerouslySetInnerHTML={{ __html: IMPRESION }} />
        <div className="wrap print:max-w-none print:p-0">
          <div className="max-w-3xl">
            <h1 className="page-title print:text-4xl">
              Libro de <span className="text-accent">Reclamaciones</span>
            </h1>
            <p className="lead lr-no-imprimir mt-5">
              Hoja de reclamación de RR Boxing. Te respondemos por escrito en un plazo máximo de {PLAZO_RECLAMO_DIAS_HABILES}{' '}
              días hábiles.
            </p>

            <noscript dangerouslySetInnerHTML={{ __html: SIN_JS }} />
            <noscript>
              <p className="mt-6 rounded-2xl border border-line bg-dark-100 p-5 text-base leading-relaxed">
                Para presentar la hoja desde aquí, activa JavaScript en tu navegador.
              </p>
            </noscript>
            <p
              id="sin-enviar"
              className="lr-no-imprimir mt-6 hidden rounded-2xl border border-red-500 bg-red-500/10 p-5 text-base leading-relaxed target:block"
            >
              No pudimos presentar tu hoja. Vuelve a intentarlo cuando la página termine de cargar, con JavaScript activado, o{' '}
              <Contacto proveedor={proveedor} />.
            </p>

            <HojaReclamacion proveedor={proveedor} />

            <p className="mt-10 border-t border-line pt-5 text-xs leading-relaxed text-neutral">
              Base legal: {TEXTOS_HOJA.baseLegal}
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
