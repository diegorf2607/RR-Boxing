'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { Order, OrderStatus, PaymentStatus } from '@/shared/types/commerce'

function orderStatusLabel(s: OrderStatus) {
  const m: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    cancelled: 'Cancelado',
    processing: 'En proceso',
    shipped: 'Enviado',
    delivered: 'Entregado',
  }
  return m[s] ?? s
}

function payLabel(p: PaymentStatus) {
  const m: Record<PaymentStatus, string> = {
    unpaid: 'Sin pagar',
    paid: 'Cobrado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  }
  return m[p] ?? p
}

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'No encontrado')
      setOrder(null)
      setLoading(false)
      return
    }
    const o = data.order as Order
    setOrder(o)
    setNotes(o.internalNotes ?? '')
    setLoading(false)
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  async function saveNotes() {
    if (!order) return
    setSaving(true)
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internalNotes: notes || null }),
    })
    setSaving(false)
    void load()
  }

  async function patchOrder(patch: Partial<Order>) {
    setSaving(true)
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setSaving(false)
    void load()
  }

  if (loading) return <p className="text-sm text-neutral">Cargando pedido…</p>
  if (error || !order) return <p className="text-red-400">{error || 'Pedido no encontrado'}</p>

  const subtotal = order.items.reduce((s, i) => s + i.unitAmount * i.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/admin/orders" className="text-accent hover:underline">
          ← Pedidos
        </Link>
        <span className="font-mono text-xs text-neutral-light">{order.id}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="card space-y-3">
          <h2 className="text-lg font-semibold text-white">Cliente</h2>
          <p className="text-sm text-neutral-light">
            <span className="text-white">{order.customerName || '—'}</span>
            <br />
            {order.customerEmail}
          </p>
          <p className="text-sm text-neutral-light">
            País: <span className="text-white">{order.country}</span>
          </p>
          <p className="text-xs text-neutral">
            Creado: {new Date(order.createdAt).toLocaleString('es-PE', { dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </article>

        <article className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">Estado</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-neutral">
              Estado del pedido
              <select
                value={order.status}
                disabled={saving}
                onChange={(e) => void patchOrder({ status: e.target.value as OrderStatus })}
                className="mt-1 w-full rounded-lg border border-dark-300 bg-dark px-2 py-2 text-sm text-white"
              >
                {(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
                  <option key={s} value={s}>
                    {orderStatusLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-neutral">
              Estado de pago
              <select
                value={order.paymentStatus}
                disabled={saving}
                onChange={(e) => void patchOrder({ paymentStatus: e.target.value as PaymentStatus })}
                className="mt-1 w-full rounded-lg border border-dark-300 bg-dark px-2 py-2 text-sm text-white"
              >
                {(['unpaid', 'paid', 'failed', 'refunded'] as const).map((s) => (
                  <option key={s} value={s}>
                    {payLabel(s)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs text-neutral">
            Método registrado: <span className="text-neutral-light">{order.paymentMethod || '—'}</span>
          </p>
        </article>
      </div>

      <article className="card space-y-3">
        <h2 className="text-lg font-semibold text-white">Productos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dark-300 text-xs text-neutral">
              <tr>
                <th className="py-2">Producto</th>
                <th className="py-2">Cant.</th>
                <th className="py-2">P. unit.</th>
                <th className="py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={`${it.productId}-${idx}`} className="border-b border-dark-300/40">
                  <td className="py-2 text-neutral-light">{it.productName}</td>
                  <td className="py-2">{it.quantity}</td>
                  <td className="py-2">
                    {it.unitAmount.toFixed(2)} {it.currency}
                  </td>
                  <td className="py-2 font-medium text-white">
                    {(it.unitAmount * it.quantity).toFixed(2)} {it.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end text-sm">
          <div className="text-right text-neutral-light">
            <p>
              Subtotal ítems: {subtotal.toFixed(2)} {order.currency}
            </p>
            <p className="text-lg font-bold text-accent">
              Total: {order.totalAmount.toFixed(2)} {order.currency}
            </p>
          </div>
        </div>
      </article>

      <article className="card space-y-3">
        <h2 className="text-lg font-semibold text-white">Notas internas</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
          placeholder="Uso interno: incidencias, courier, llamadas…"
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveNotes()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-dark disabled:opacity-50"
        >
          Guardar notas
        </button>
      </article>
    </div>
  )
}
