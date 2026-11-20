import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'
import { diasHabilesQueFaltan, fechaHoraTexto } from '@/shared/lib/plazos'
import {
  leerHojaRegistrada,
  respuestaPorTexto,
  soles,
  textoDocumento,
  type HojaRegistrada,
} from '@/shared/lib/reclamo'

// Las hojas del Libro de Reclamaciones (/libro-de-reclamaciones), guardadas en admin_notifications con
// type libro_reclamacion (body = la hoja en JSON). Las más nuevas primero, con el plazo de 15 días hábiles.

export const dynamic = 'force-dynamic'

type Fila = { id: string; title: string; body: string | null; entity_id: string | null; created_at: string }

async function getHojas(): Promise<{ filas: Fila[]; error: string | null }> {
  const { data, error } = await getSupabaseAdmin()
    .from('admin_notifications')
    .select('id,title,body,entity_id,created_at')
    .eq('type', 'libro_reclamacion')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return { filas: [], error: error.message }
  return { filas: (data ?? []) as Fila[], error: null }
}

/** «Faltan 12 días hábiles», «Vence hoy», «Venció hace 2 días hábiles» */
function plazo(h: HojaRegistrada): { texto: string; tono: string } {
  const p = diasHabilesQueFaltan(h.venceDia)
  if (!p) return { texto: 'Plazo sin fecha', tono: 'text-neutral' }
  const dias = (n: number) => (n === 1 ? '1 día hábil' : `${n} días hábiles`)
  if (p.vencido) return { texto: p.dias ? `Venció hace ${dias(p.dias)}` : 'Venció', tono: 'text-red-400' }
  if (p.dias === 0) return { texto: 'Vence hoy', tono: 'text-red-400' }
  return { texto: `Faltan ${dias(p.dias)}`, tono: p.dias <= 3 ? 'text-accent' : 'text-neutral-light' }
}

function Dato({ t, v, largo }: { t: string; v: React.ReactNode; largo?: boolean }) {
  const vacio = v === null || v === undefined || v === ''
  return (
    <div className="grid gap-1 border-t border-dark-300 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm text-neutral">{t}</dt>
      <dd className={`break-words text-sm ${largo ? 'whitespace-pre-line' : ''} ${vacio ? 'text-neutral' : 'text-white'}`}>
        {vacio ? '—' : v}
      </dd>
    </div>
  )
}

const copiaTexto = (v: boolean | null | undefined) => (v === true ? 'salió' : v === false ? 'no salió' : 'no se intentó')

function Detalle({ h }: { h: HojaRegistrada }) {
  const monto = h.monto !== null && h.monto !== undefined ? soles(h.monto) : h.montoTexto
  const asunto = encodeURIComponent(`Respuesta a tu ${h.tipo === 'queja' ? 'queja' : 'reclamo'} N.º ${h.numero} · RR Boxing`)
  return (
    <div className="px-5 pb-5">
      <dl>
        <Dato t="Presentada" v={h.fechaTexto} />
        <Dato t="Vence" v={`${h.vence} (${h.plazoDiasHabiles} días hábiles)`} />
        <Dato t="Nombre" v={h.nombre} />
        <Dato t="Documento" v={`${textoDocumento(h.documentoTipo)} ${h.documentoNumero}`} />
        <Dato t="Domicilio" v={h.domicilio} />
        <Dato
          t="Correo"
          v={
            h.correo && (
              <a href={`mailto:${h.correo}?subject=${asunto}`} className="break-all text-accent hover:underline">
                {h.correo}
              </a>
            )
          }
        />
        <Dato t="Teléfono" v={h.telefono} />
        <Dato t="Menor de edad" v={h.menor ? `Sí · padre, madre o apoderado: ${h.apoderado ?? '—'}` : 'No'} />
        <Dato t="Responder por" v={respuestaPorTexto(h).replace('no dejaste', 'no dejó')} />
        <Dato t="Producto o servicio" v={h.bien === 'producto' ? 'Producto' : h.bien === 'servicio' ? 'Servicio' : null} />
        <Dato t="Monto reclamado" v={monto} />
        <Dato t="Descripción" v={h.descripcion} />
        <Dato t="Detalle" v={h.detalle} largo />
        <Dato t="Pedido del consumidor" v={h.pedido} largo />
        <Dato
          t="Copia por correo"
          v={`Al consumidor: ${copiaTexto(h.copia?.consumidor)} · a la tienda: ${copiaTexto(h.copia?.tienda)}`}
        />
        {h.numeroProvisional && (
          <Dato t="Número" v="Provisional: el conteo del año falló al presentarla, por eso lleva letras." />
        )}
      </dl>
    </div>
  )
}

export default async function AdminReclamosPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const { filas, error } = await getHojas()
  const hojas = filas.map((f) => ({ fila: f, hoja: leerHojaRegistrada(f.body) }))

  return (
    <main className="min-h-screen bg-dark">
      <section className="container mx-auto grid grid-cols-1 gap-4 px-4 pb-10 pt-1 md:grid-cols-[240px_1fr] md:gap-6 md:py-10">
        <AdminNav />
        <div className="min-w-0">
          <h1 className="mb-2 font-heading text-4xl leading-none text-white md:text-5xl">Libro de reclamaciones</h1>
          <p className="mb-6 max-w-2xl text-sm text-neutral-light">
            Las hojas que llegan por rrboxing.com/libro-de-reclamaciones. Cada una se responde por escrito, por el medio que
            eligió la persona, dentro de los 15 días hábiles (el plazo no se puede extender). Guárdalas al menos 2 años.
          </p>

          {error && <p className="mb-4 text-sm text-red-400">No se pudo leer el libro: {error}</p>}

          <div className="rounded-2xl border border-dark-300 bg-dark-100">
            <div className="px-5 py-3 text-sm text-neutral">
              {hojas.length === 1 ? '1 hoja' : `${hojas.length} hojas`}
            </div>
            {hojas.length === 0 && (
              <p className="border-t border-dark-300 px-5 py-4 text-sm text-neutral">Todavía no llega ninguna hoja.</p>
            )}
            {hojas.map(({ fila, hoja }) => {
              if (!hoja) {
                return (
                  <div key={fila.id} className="border-t border-dark-300 px-5 py-3">
                    <p className="font-medium text-white">{fila.title}</p>
                    <p className="text-sm text-neutral">
                      {fechaHoraTexto(new Date(fila.created_at))} · no se pudo leer el detalle de esta hoja
                    </p>
                  </div>
                )
              }
              const p = plazo(hoja)
              return (
                <details key={fila.id} id={`hoja-${hoja.numero}`} className="group border-t border-dark-300">
                  <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3 hover:bg-dark-200/40 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">
                      <span className="block font-medium text-white">
                        <span className="tabular-nums">{hoja.numero}</span> · {hoja.tipo === 'queja' ? 'Queja' : 'Reclamo'}
                      </span>
                      <span className="block break-words text-sm text-neutral-light">{hoja.nombre}</span>
                      <span className="block text-sm text-neutral">
                        {fechaHoraTexto(new Date(hoja.fecha))} · vence el {hoja.vence}
                      </span>
                    </span>
                    <span className={`text-sm font-semibold ${p.tono}`}>
                      {p.texto}
                      <span className="ml-2 font-normal text-neutral group-open:hidden">Ver</span>
                      <span className="ml-2 hidden font-normal text-neutral group-open:inline">Cerrar</span>
                    </span>
                  </summary>
                  <Detalle h={hoja} />
                </details>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
