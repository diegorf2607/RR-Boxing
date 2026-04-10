'use client'

import { useEffect, useState } from 'react'
import type { Order } from '@/shared/types/commerce'

export default function OrdersAdminClient() {
  const [orders, setOrders] = useState<Order[]>([])

  async function reload() {
    const res = await fetch('/api/orders')
    const data = await res.json()
    setOrders(data.orders ?? [])
  }

  useEffect(() => {
    reload()
  }, [])

  async function updateStatus(id: string, status: Order['status']) {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    reload()
  }

  return (
    <div className="space-y-3">
      {orders.length === 0 && <p className="text-neutral-light">Sin pedidos aun.</p>}
      {orders.map((order) => (
        <article key={order.id} className="card flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">#{order.id}</p>
            <p className="text-sm text-neutral-light">{order.customerEmail}</p>
          </div>
          <select
            value={order.status}
            onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
            className="rounded-lg border border-dark-300 bg-dark px-2 py-1"
          >
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="cancelled">cancelled</option>
          </select>
        </article>
      ))}
    </div>
  )
}
