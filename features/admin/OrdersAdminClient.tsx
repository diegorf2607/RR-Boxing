'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Order } from '@/shared/types/commerce'

const POLL_MS = 4000

function statusLabel(s: Order['status']) {
  if (s === 'paid') return 'Pagado'
  if (s === 'cancelled') return 'Cancelado'
  return 'Pendiente'
}

function statusBadgeClass(s: Order['status']) {
  if (s === 'paid') return 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
  if (s === 'cancelled') return 'bg-neutral-500/15 text-neutral-300 ring-neutral-500/30'
  return 'bg-amber-500/15 text-amber-200 ring-amber-500/35'
}

export default function OrdersAdminClient() {
  const [orders, setOrders] = useState<Order[]>([])
  const knownIdsRef = useRef<Set<string>>(new Set())
  const [banner, setBanner] = useState<{ message: string; at: number } | null>(null)

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

  return (
    <div className="space-y-6">
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

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-dark-300 bg-dark-100/50 px-6 py-12 text-center text-neutral-light">
          Aún no hay pedidos registrados.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-dark-300 bg-dark-100/40">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-dark-300 bg-dark/80 text-xs uppercase tracking-wide text-neutral">
              <tr>
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">País</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-dark-300/60 last:border-0 hover:bg-dark/40">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-light">{order.id}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-white">{order.customerEmail}</td>
                  <td className="px-4 py-3 text-neutral-light">{order.country}</td>
                  <td className="px-4 py-3 font-medium text-white">
                    {order.totalAmount.toFixed(2)} {order.currency}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                      className={`w-full max-w-[160px] rounded-lg border border-dark-300 bg-dark px-2 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusBadgeClass(order.status)}`}
                    >
                      <option value="pending">{statusLabel('pending')}</option>
                      <option value="paid">{statusLabel('paid')}</option>
                      <option value="cancelled">{statusLabel('cancelled')}</option>
                    </select>
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
