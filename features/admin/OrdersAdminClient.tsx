'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Order, OrderStatus } from '@/shared/types/commerce'

const POLL_MS = 4000

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

function statusBadgeClass(s: Order['status']) {
  if (s === 'delivered') return 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
  if (s === 'shipped' || s === 'processing') return 'bg-sky-500/15 text-sky-200 ring-sky-500/30'
  if (s === 'paid') return 'bg-emerald-600/15 text-emerald-200 ring-emerald-500/25'
  if (s === 'cancelled') return 'bg-neutral-500/15 text-neutral-300 ring-neutral-500/30'
  return 'bg-amber-500/15 text-amber-200 ring-amber-500/35'
}

function payLabel(p: Order['paymentStatus']) {
  if (p === 'paid') return 'Cobrado'
  if (p === 'failed') return 'Fallido'
  if (p === 'refunded') return 'Reembolso'
  return 'Sin pagar'
}

function payBadgeClass(p: Order['paymentStatus']) {
  if (p === 'paid') return 'text-emerald-300'
  if (p === 'failed' || p === 'refunded') return 'text-red-300'
  return 'text-amber-200'
}

export default function OrdersAdminClient() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const knownIdsRef = useRef<Set<string>>(new Set())
  const [banner, setBanner] = useState<{ message: string; at: number } | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all')

  const reload = useCallback(async () => {
    const res = await fetch('/api/orders', { cache: 'no-store' })
    const data = await res.json()
    const next: Order[] = data.orders ?? []

    if (knownIdsRef.current.size > 0) {
      const newcomers = next.filter((o) => !knownIdsRef.current.has(o.id))
      if (newcomers.length > 0) {
        const o = newcomers[0]
        setBanner({
          message: `Nuevo pedido: ${o.customerEmail} · ${o.currency} ${o.totalAmount.toFixed(2)} · #${o.id}`,
          at: Date.now(),
        })
      }
    }

    knownIdsRef.current = new Set(next.map((o) => o.id))
    setOrders(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
    const id = window.setInterval(() => void reload(), POLL_MS)
    return () => window.clearInterval(id)
  }, [reload])

  async function updateStatus(id: string, status: Order['status']) {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    void reload()
  }

  const filtered = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q))
    )
  })

  const newPendingCount = orders.filter((o) => o.status === 'pending' && o.paymentStatus === 'unpaid').length

  return (
    <div className="space-y-6">
      {newPendingCount > 0 && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          Hay <strong>{newPendingCount}</strong> pedido(s) pendiente(s) de pago. Revisa la cola abajo o el dashboard.
        </p>
      )}

      {banner && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-white shadow-lg ring-1 ring-accent/25"
        >
          <p className="font-medium">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
            {banner.message}
          </p>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="shrink-0 rounded-lg bg-dark px-3 py-1.5 text-xs font-semibold text-accent hover:bg-dark-300"
          >
            Cerrar
          </button>
        </div>
      )}

      <p className="text-xs text-neutral">
        La lista se actualiza cada pocos segundos. Verás un aviso arriba cuando entre un pedido nuevo.
      </p>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dark-300 bg-dark-100/40 p-4">
        <div>
          <label className="mb-1 block text-xs text-neutral">Buscar</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Email, nombre, ID…"
            className="rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral">Estado</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
          >
            <option value="all">Todos</option>
            {(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
              <option key={s} value={s}>
                {orderStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-sm text-neutral">Cargando…</p>}

      {!loading && filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-dark-300 bg-dark-100/50 px-6 py-12 text-center text-neutral-light">
          No hay pedidos que coincidan.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-dark-300 bg-dark-100/40">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-dark-300 bg-dark/80 text-xs uppercase tracking-wide text-neutral">
              <tr>
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Ítems</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Pago</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-dark-300/60 last:border-0 hover:bg-dark/40">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-light">{order.id}</td>
                  <td className="px-4 py-3 text-xs text-neutral-light">
                    {new Date(order.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="max-w-[200px] px-4 py-3">
                    <p className="truncate text-white">{order.customerName || order.customerEmail}</p>
                    <p className="truncate text-xs text-neutral">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-light">
                    {order.items.length} · {order.items.reduce((s, i) => s + i.quantity, 0)} u.
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {order.totalAmount.toFixed(2)} {order.currency}
                  </td>
                  <td className={`px-4 py-3 text-xs font-semibold ${payBadgeClass(order.paymentStatus)}`}>
                    {payLabel(order.paymentStatus)}
                    {order.paymentMethod && (
                      <span className="mt-0.5 block font-normal text-neutral"> {order.paymentMethod}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      className={`w-full max-w-[180px] rounded-lg border border-dark-300 bg-dark px-2 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusBadgeClass(order.status)}`}
                    >
                      {(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
                        <option key={s} value={s}>
                          {orderStatusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs font-semibold text-accent hover:underline">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
