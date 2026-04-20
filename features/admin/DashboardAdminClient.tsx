'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { DashboardSnapshot } from '@/shared/lib/data-store'
import type { Order, Product } from '@/shared/types/commerce'
import type { AdminNotification } from '@/shared/types/admin'

function fmtMoney(n: number, cur?: string) {
  const c = cur ?? ''
  return `${c ? `${c} ` : ''}${n.toFixed(2)}`
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
  const m: Record<Order['paymentStatus'], string> = {
    unpaid: 'Sin pagar',
    paid: 'Cobrado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  }
  return m[p] ?? p
}

function notifSeverityClass(s: AdminNotification['severity']) {
  if (s === 'critical') return 'border-red-500/50 bg-red-500/10 text-red-100'
  if (s === 'warning') return 'border-amber-500/40 bg-amber-500/10 text-amber-50'
  return 'border-dark-300 bg-dark/50 text-neutral-light'
}

export default function DashboardAdminClient({ snapshot }: { snapshot: DashboardSnapshot }) {
  const [notifications, setNotifications] = useState(snapshot.notifications)
  const [unread, setUnread] = useState(snapshot.unreadNotifications)

  const refreshNotifs = useCallback(async () => {
    const res = await fetch('/api/admin/notifications', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    setNotifications(data.notifications ?? [])
    setUnread(data.unread ?? 0)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => void refreshNotifs(), 15000)
    return () => window.clearInterval(id)
  }, [refreshNotifs])

  async function markRead(id: string) {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    void refreshNotifs()
  }

  async function markAllRead() {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    void refreshNotifs()
  }

  const { kpis, ordersByStatus, lowStockCountByBand, recentOrders, recentProducts, settings } = snapshot

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-light">
            Resumen operativo · umbral stock bajo: <span className="text-accent">{settings.lowStockThreshold}</span>
            {!settings.storeEnabled && (
              <span className="ml-2 rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-200">Tienda deshabilitada</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products"
            className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20"
          >
            + Producto
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-xl border border-dark-300 px-4 py-2 text-sm font-semibold text-white hover:border-accent/50"
          >
            Ver pedidos
          </Link>
          <Link
            href="/admin/products"
            className="rounded-xl border border-dark-300 px-4 py-2 text-sm font-semibold text-white hover:border-accent/50"
          >
            Revisar stock
          </Link>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {(
          [
            ['Productos activos (tienda)', kpis.activeProducts],
            ['Pedidos totales', kpis.totalOrders],
            ['Pedidos pagados / cobrados', kpis.paidOrders],
            ['Pendientes de pago', kpis.pendingOrders],
            ['Pedidos hoy (UTC)', kpis.ordersToday],
            ['Ingresos totales (pagados)', fmtMoney(kpis.revenueTotal)],
            ['Ingresos mes (pagados)', fmtMoney(kpis.revenueMonth)],
            ['Ticket promedio', fmtMoney(kpis.averageTicket)],
            ['Stock bajo', kpis.lowStockProducts],
            ['Sin imágenes', kpis.productsWithoutImages],
          ] as const
        ).map(([label, val]) => (
          <article key={label} className="card border-dark-300/80">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{val}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold text-white">Pedidos por estado</h2>
          <ul className="space-y-2 text-sm">
            {(Object.entries(ordersByStatus) as [Order['status'], number][]).map(([st, n]) => (
              <li key={st} className="flex justify-between border-b border-dark-300/40 py-1 text-neutral-light">
                <span>{orderStatusLabel(st)}</span>
                <span className="font-mono text-white">{n}</span>
              </li>
            ))}
            {Object.keys(ordersByStatus).length === 0 && <p className="text-neutral">Sin pedidos aún.</p>}
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-semibold text-white">Stock</h2>
          <p className="text-sm text-neutral-light">
            Productos con stock bajo (menos de {settings.lowStockThreshold} unidades):{' '}
            <strong className="text-accent">{kpis.lowStockProducts}</strong>
          </p>
          <p className="text-xs text-neutral">
            Crítico (&lt; mitad del umbral):{' '}
            <span className="text-amber-200">{lowStockCountByBand.critical}</span> · En alerta:{' '}
            <span className="text-amber-200/80">{lowStockCountByBand.warning}</span>
          </p>
        </section>
      </div>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">
            Notificaciones internas
            {unread > 0 && (
              <span className="ml-2 inline-flex min-w-[1.5rem] justify-center rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-dark">
                {unread}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="text-xs font-semibold text-accent hover:underline"
          >
            Marcar todas leídas
          </button>
        </div>
        <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
          {notifications.length === 0 && <li className="text-sm text-neutral">Sin notificaciones.</li>}
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex flex-wrap items-start justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${notifSeverityClass(n.severity)}`}
            >
              <div>
                <p className="font-semibold text-white">{n.title}</p>
                {n.body && <p className="text-xs opacity-90">{n.body}</p>}
                <p className="mt-1 text-[10px] uppercase tracking-wide text-neutral">
                  {new Date(n.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                {n.link && (
                  <Link href={n.link} className="mt-1 inline-block text-xs text-accent hover:underline">
                    Abrir
                  </Link>
                )}
              </div>
              {!n.readAt && (
                <button type="button" onClick={() => void markRead(n.id)} className="shrink-0 text-xs text-accent">
                  Leída
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold text-white">Últimos pedidos</h2>
          <ul className="space-y-2 text-sm">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex flex-col gap-1 border-b border-dark-300/40 py-2 text-neutral-light">
                <div className="flex flex-wrap justify-between gap-2">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-accent hover:underline">
                    {o.id}
                  </Link>
                  <span className="text-xs text-white">
                    {fmtMoney(o.totalAmount, o.currency)} · {orderStatusLabel(o.status)}
                  </span>
                </div>
                <span className="text-xs">
                  {o.customerName ? `${o.customerName} · ` : ''}
                  {o.customerEmail} · {payLabel(o.paymentStatus)}
                </span>
                <span className="text-[10px] text-neutral">
                  {new Date(o.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </li>
            ))}
            {recentOrders.length === 0 && <li className="text-neutral">Sin pedidos.</li>}
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="text-lg font-semibold text-white">Productos recientes</h2>
          <ul className="space-y-2 text-sm">
            {recentProducts.map((p: Product) => (
              <li key={p.id} className="flex justify-between gap-2 border-b border-dark-300/40 py-2 text-neutral-light">
                <Link href={`/admin/products#edit-${p.id}`} className="text-accent hover:underline">
                  {p.name}
                </Link>
                <span className="text-[10px] text-neutral">
                  {p.updatedAt || p.createdAt
                    ? new Date(p.updatedAt ?? p.createdAt ?? '').toLocaleString('es-PE', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : '—'}
                </span>
              </li>
            ))}
            {recentProducts.length === 0 && <li className="text-neutral">Sin productos.</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}
