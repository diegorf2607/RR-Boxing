import { redirect } from 'next/navigation'
import MainNav from '@/components/MainNav'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'
import { CLASE, PREFIJO_TITULO, whatsappLegible } from '@/shared/lib/clase-virtual'

export const dynamic = 'force-dynamic'

type Fila = { id: string; title: string; body: string | null; link: string | null; created_at: string }

async function getInscripciones(): Promise<{ filas: Fila[]; error: string | null }> {
  const { data, error } = await getSupabaseAdmin()
    .from('admin_notifications')
    .select('id,title,body,link,created_at')
    .eq('type', 'clase_inscripcion')
    .eq('entity_id', CLASE.id)
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return { filas: [], error: error.message }
  return { filas: (data ?? []) as Fila[], error: null }
}

export default async function AdminClasePage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const { filas, error } = await getInscripciones()

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-[240px_1fr]">
        <AdminNav />
        <div>
          <h1 className="mb-2 text-4xl font-bold">Clase virtual · sábado 28 de noviembre</h1>
          <p className="mb-6 max-w-2xl text-sm text-neutral-light">
            Quienes dejaron su nombre, su correo y su WhatsApp en rrboxing.com/clase antes de ir a pagar. Cruza los nombres con los
            pagos de Mercado Pago (referencia RRBOXING-CLASE-2811) y escríbele a quien no mandó su comprobante.
          </p>

          {error && <p className="mb-4 text-sm text-red-400">No se pudo leer la lista: {error}</p>}

          <div className="rounded-2xl border border-dark-300 bg-dark-100">
            <div className="flex justify-between px-5 py-3 text-sm text-neutral">
              <span>{filas.length === 1 ? '1 persona' : `${filas.length} personas`}</span>
            </div>
            {filas.length === 0 && (
              <p className="border-t border-dark-300 px-5 py-4 text-sm text-neutral">Todavía nadie se ha inscrito.</p>
            )}
            {filas.map((fila) => {
              const nombre = fila.title.startsWith(PREFIJO_TITULO) ? fila.title.slice(PREFIJO_TITULO.length) : fila.title
              const digitos = fila.link?.replace(/\D/g, '') ?? ''
              const correo = fila.body?.match(/[^\s·]+@[^\s·]+/)?.[0] ?? null
              return (
                <div
                  key={fila.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-dark-300 px-5 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{nombre}</p>
                    {correo && (
                      <a href={`mailto:${correo}`} className="block text-sm text-neutral-light hover:text-accent">
                        {correo}
                      </a>
                    )}
                    <p className="text-sm text-neutral">
                      {digitos ? whatsappLegible(digitos) : 'sin número'} ·{' '}
                      {new Date(fila.created_at).toLocaleString('es-PE', {
                        timeZone: 'America/Lima',
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  {fila.link && (
                    <a
                      href={fila.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-accent px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent hover:text-dark"
                    >
                      Escribirle
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
