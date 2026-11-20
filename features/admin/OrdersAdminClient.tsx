'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Order, OrderStatus } from '@/shared/types/commerce'
import { porAtender, queFalta } from '@/features/admin/por-atender'

// El listado de pedidos del panel. En el celular va como lista (número, fecha, cliente, total, pago, forma de pago y
// origen, y se toca para abrir el detalle); desde 768 px, la tabla. Arranca en «Por atender».

const POLL_MS = 4000

/** Lo que trae GET /api/pedido/datos por cada pedido hecho desde /checkout */
type DatosListado = { formaPago: string; origen: string }

/** «whatsapp» → «Por WhatsApp»; lo que se escribió en el panel («Yape») queda tal cual. */
function metodoLabel(m: string | null | undefined) {
  if (m === 'whatsapp') return 'Por WhatsApp'
  if (m === 'mercadopago') return 'Mercado Pago'
  return m ?? ''
}

function orderStatusLabel(s: Order['status']) {
  const m: Record<Order['status'], string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    cancelled: 'Cancelado',
    processing: 'En proceso',
    shipped: 'Enviado',
    delivered: 'Entregado',
  }
  return m[s] ?? s
}

function payLabel(p: Order['paymentStatus']) {
  if (p === 'paid') return 'Cobrado'
  if (p === 'failed') return 'Pago fallido'
  if (p === 'refunded') return 'Reembolso'
  return 'Sin pagar'
}

/** Un solo acento: lo que falta cobrar va en amarillo; lo que salió mal, en rojo */
function payClass(p: Order['paymentStatus']) {
  if (p === 'paid') return 'text-white'
  if (p === 'failed' || p === 'refunded') return 'text-red-400'
  return 'text-accent'
}

const dinero = (n: number, moneda: string) => (moneda === 'PEN' ? `S/ ${n.toFixed(2)}` : `${moneda} ${n.toFixed(2)}`)
/** «20/11/26, 4:54 p. m.», sin que «p. m.» se parta en dos líneas */
const fechaCorta = (iso: string) => new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }).replace(/\s([ap])\.\s?m\./g, '\u00a0$1.\u00a0m.')

type Filtro = 'atender' | 'all' | Order['status']

const campo =
  'mt-1 block min-h-[44px] w-full rounded-lg border border-dark-300 bg-dark px-3 text-base text-white placeholder:text-neutral-dark focus:border-accent focus:outline-none'

export default function OrdersAdminClient() {
  const [orders, setOrders] = useState<Order[]>([])
  const [datos, setDatos] = useState<Record<string, DatosListado>>({})
  const [loading, setLoading] = useState(true)
  const [fallo, setFallo] = useState(false)
  const knownIdsRef = useRef<Set<string>>(new Set())
  const [banner, setBanner] = useState<{ id: string; message: string } | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<Filtro>('atender')

  const reload = useCallback(async () => {
    try {
      const [res, resDatos] = await Promise.all([
        fetch('/api/orders', { cache: 'no-store' }),
        fetch('/api/pedido/datos', { cache: 'no-store' }).catch(() => null),
      ])
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      const next: Order[] = data.orders ?? []
      // Si los datos no llegan, el listado se ve igual, sin forma de pago ni origen
      const extra = resDatos?.ok ? ((await resDatos.json().catch(() => ({}))) as { datos?: Record<string, DatosListado> }) : {}
      if (extra.datos) setDatos(extra.datos)

      if (knownIdsRef.current.size > 0) {
        const newcomers = next.filter((o) => !knownIdsRef.current.has(o.id))
        if (newcomers.length > 0) {
          const o = newcomers[0]
          setBanner({
            id: o.id,
            message: `Pedido nuevo ${o.id}: ${o.customerName || o.customerEmail} · ${dinero(o.totalAmount, o.currency)}`,
          })
        }
      }

      knownIdsRef.current = new Set(next.map((o) => o.id))
      setOrders(next)
      setFallo(false)
    } catch {
      setFallo(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
    const id = window.setInterval(() => void reload(), POLL_MS)
    return () => window.clearInterval(id)
  }, [reload])

  async function updateStatus(id: string, status: Order['status']) {
    await fetch(`/api/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => null)
    void reload()
  }

  const filtered = orders.filter((o) => {
    if (filterStatus === 'atender' && !porAtender(o)) return false
    if (filterStatus !== 'all' && filterStatus !== 'atender' && o.status !== filterStatus) return false
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q))
    )
  })

  // La forma de pago vive en el pedido (la cambia «Marcar como pagado»); la de los datos es de cuando se hizo
  const formaDe = (o: Order) => metodoLabel(o.paymentMethod || datos[o.id]?.formaPago)
  const atender = orders.filter(porAtender)
  const sinCobrar = atender.filter((o) => o.paymentStatus !== 'paid').length

  return (
    <div className="space-y-5">
      {atender.length > 0 && (
        <p className="text-base text-neutral-light">
          <span className="font-semibold text-accent">
            {atender.length === 1 ? '1 pedido por atender' : `${atender.length} pedidos por atender`}
          </span>
          {sinCobrar > 0 ? ` (${sinCobrar === 1 ? '1 sin cobrar' : `${sinCobrar} sin cobrar`})` : ''}: escríbeles por WhatsApp para
          confirmar el envío y el pago.
        </p>
      )}

      {banner && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-dark-100 px-4 py-3 text-sm text-white">
          <p className="min-w-0 break-words font-medium">{banner.message}</p>
          <span className="flex shrink-0 items-center gap-4">
            <Link href={`/admin/orders/${banner.id}`} className="font-semibold text-accent underline underline-offset-2">
              Verlo
            </Link>
            <button type="button" onClick={() => setBanner(null)} className="min-h-[44px] text-neutral-light hover:text-white">
              Cerrar
            </button>
          </span>
        </div>
      )}

      <div className="grid gap-3 rounded-2xl border border-dark-300 bg-dark-100 p-4 sm:grid-cols-2">
        <label className="block text-sm text-neutral-light">
          Buscar
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Código RR-…, nombre o correo"
            className={campo}
          />
        </label>
        <label className="block text-sm text-neutral-light">
          Mostrar
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Filtro)} className={campo}>
            <option value="atender">Por atender (sin pagar o por enviar)</option>
            <option value="all">Todos</option>
            {(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
              <option key={s} value={s}>
                {orderStatusLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-xs text-neutral">La lista se actualiza sola cada pocos segundos y avisa arriba cuando entra un pedido nuevo.</p>

      {loading && <p className="text-sm text-neutral">Cargando…</p>}
      {fallo && (
        <p role="alert" className="text-sm text-red-400">
          No se pudieron cargar los pedidos. Lo seguimos intentando; si no se arregla, recarga la página.
        </p>
      )}

      {!loading && filtered.length === 0 ? (
        <p className="rounded-2xl border border-dark-300 bg-dark-100 px-5 py-4 text-sm text-neutral-light">
          {filterStatus === 'atender' && !search.trim() ? 'No tienes pedidos por atender.' : 'No hay pedidos que coincidan.'}{' '}
          {filterStatus !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all')
                setSearch('')
              }}
              className="text-accent underline underline-offset-2"
            >
              Ver todos
            </button>
          )}
        </p>
      ) : (
        <>
          {/* En el celular: una fila por pedido, que se toca para abrirlo */}
          <ul className="divide-y divide-dark-300 rounded-2xl border border-dark-300 bg-dark-100 md:hidden">
            {filtered.map((o) => {
              const falta = queFalta(o)
              const forma = formaDe(o)
              const origen = datos[o.id]?.origen
              return (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="block px-4 py-3 hover:bg-dark-200/40">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="whitespace-nowrap font-mono text-sm text-accent">{o.id}</span>
                      <span className="shrink-0 text-base font-semibold tabular-nums text-white">{dinero(o.totalAmount, o.currency)}</span>
                    </span>
                    <span className="mt-1 block truncate text-base text-white">{o.customerName || o.customerEmail}</span>
                    <span className="mt-0.5 block text-sm text-neutral">
                      {fechaCorta(o.createdAt)} · <span className={payClass(o.paymentStatus)}>{payLabel(o.paymentStatus)}</span>
                      {forma ? ` · ${forma}` : ''}
                    </span>
                    <span className="block text-sm text-neutral">
                      {falta ?? orderStatusLabel(o.status)}
                      {origen ? ` · ${origen}` : ''}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="hidden overflow-x-auto rounded-2xl border border-dark-300 bg-dark-100 md:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-dark-300 text-xs text-neutral">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pedido</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Unidades</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Pago</th>
                  <th className="px-4 py-3 font-semibold">Origen</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-dark-300 last:border-0 hover:bg-dark/40">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-neutral-light">{order.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-light">{fechaCorta(order.createdAt)}</td>
                    <td className="max-w-[200px] px-4 py-3">
                      <p className="truncate text-white">{order.customerName || order.customerEmail}</p>
                      <p className="truncate text-xs text-neutral">{order.customerEmail}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-light">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} u.
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-white">
                      {dinero(order.totalAmount, order.currency)}
                    </td>
                    <td className={`px-4 py-3 text-xs font-semibold ${payClass(order.paymentStatus)}`}>
                      {payLabel(order.paymentStatus)}
                      {formaDe(order) && <span className="mt-0.5 block font-normal text-neutral">{formaDe(order)}</span>}
                    </td>
                    <td className="max-w-[130px] px-4 py-3 text-xs text-neutral-light">
                      <span className="block truncate" title={datos[order.id]?.origen}>
                        {datos[order.id]?.origen ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                        aria-label={`Estado del pedido ${order.id}`}
                        className="w-36 rounded-lg border border-dark-300 bg-dark px-2 py-1.5 text-xs text-white"
                      >
                        {(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
                          <option key={s} value={s}>
                            {orderStatusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-xs font-semibold text-accent hover:underline">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
