'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { DashboardSnapshot } from '@/shared/lib/data-store'
import type { Order, Product } from '@/shared/types/commerce'
import type { AdminNotification } from '@/shared/types/admin'
import {
  textoMontos,
  type ClavePeriodo,
  type FilaOrigen,
  type HojaAbierta,
  type TableroMedicion,
} from '@/shared/lib/resumen-diario'

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

/** Los datos de cada pedido (type pedido_datos) viven en la misma tabla, pero no son avisos */
const sinDatosDePedido = (lista: AdminNotification[]) => lista.filter((n) => (n.type as string) !== 'pedido_datos')

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

/** «Faltan 12 días hábiles», «Vence hoy» (como en /admin/reclamos) */
function plazoHoja(h: HojaAbierta): { texto: string; tono: string } {
  if (h.dias === 0) return { texto: 'Vence hoy', tono: 'text-red-400' }
  return {
    texto: `Faltan ${plural(h.dias, 'día hábil', 'días hábiles')}`,
    tono: h.dias <= 3 ? 'text-accent' : 'text-neutral-light',
  }
}

/** Cuántas hojas en plazo se listan en el panel; las demás, en /admin/reclamos */
const MAX_HOJAS = 8

/** «2 pedidos · 1 pagado · S/ 124.99 · 3 en la clase», sin lo que está en cero */
function resumenFila(f: FilaOrigen): string {
  const partes: string[] = []
  if (f.pedidos) partes.push(plural(f.pedidos, 'pedido', 'pedidos'))
  if (f.pagados) partes.push(plural(f.pagados, 'pagado', 'pagados'), textoMontos(f.cobrado))
  if (f.inscripciones) partes.push(`${f.inscripciones} en la clase`)
  return partes.join(' · ')
}

const COLUMNAS_ORIGEN = 'sm:grid sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_7.5rem_4.5rem] sm:items-baseline sm:gap-x-3'

function TableroOrigen({ medicion }: { medicion: TableroMedicion | null }) {
  const [clave, setClave] = useState<ClavePeriodo>('ayer')
  if (!medicion) {
    return (
      <section className="rounded-2xl border border-dark-300 bg-dark-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">Ventas e inscripciones por origen</h2>
        <p className="mt-1 text-sm text-red-400">No se pudieron calcular las cifras. Recarga la página.</p>
      </section>
    )
  }
  const periodo = medicion.periodos.find((p) => p.clave === clave) ?? medicion.periodos[0]
  const c = periodo.cifras
  const totales: [string, string, string?][] = [
    ['Pedidos', String(c.pedidos), c.pedidos ? plural(c.pagados, 'pagado', 'pagados') : undefined],
    ['Cobrado', textoMontos(c.cobrado)],
    ['Inscripciones a la clase', String(c.inscripciones)],
  ]

  return (
    <section className="rounded-2xl border border-dark-300 bg-dark-100" aria-labelledby="titulo-origen">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-5 pt-4">
        <h2 id="titulo-origen" className="text-lg font-semibold text-white">
          Ventas e inscripciones por origen
        </h2>
        <div role="tablist" aria-label="Periodo" className="flex gap-4 text-sm">
          {medicion.periodos.map((p) => (
            <button
              key={p.clave}
              type="button"
              role="tab"
              aria-selected={p.clave === periodo.clave}
              onClick={() => setClave(p.clave)}
              className={`border-b-2 pb-1 ${
                p.clave === periodo.clave
                  ? 'border-accent font-semibold text-white'
                  : 'border-transparent text-neutral-light hover:text-white'
              }`}
            >
              {p.nombre}
            </button>
          ))}
        </div>
      </div>
      <p className="px-5 pb-3 pt-1 text-sm text-neutral">{periodo.detalle}</p>

      {medicion.errores.length > 0 && (
        <p className="border-t border-dark-300 px-5 py-3 text-sm text-red-400">
          No se pudo leer {medicion.errores.join(', ')}: estas cifras pueden estar incompletas.
        </p>
      )}

      <dl className="border-t border-dark-300 sm:grid sm:grid-cols-3">
        {totales.map(([t, v, nota], i) => (
          <div
            key={t}
            className={`flex items-baseline justify-between gap-4 px-5 py-3 sm:block ${
              i > 0 ? 'border-t border-dark-300 sm:border-l sm:border-t-0' : ''
            }`}
          >
            <dt className="text-sm text-neutral">{t}</dt>
            <dd className="text-right sm:mt-1 sm:text-left">
              <span className="text-xl font-semibold tabular-nums text-white">{v}</span>
              {nota && <span className="block text-xs text-neutral">{nota}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <div role="table" aria-label={`Por origen, ${periodo.nombre.toLowerCase()}`} className="border-t border-dark-300">
        <div role="row" className={`px-5 py-2 text-xs text-neutral ${COLUMNAS_ORIGEN}`}>
          <span role="columnheader">
            <span className="sm:hidden">Por origen</span>
            <span className="hidden sm:inline">Origen</span>
          </span>
          {['Pedidos', 'Pagados', 'Cobrado', 'Clase'].map((t) => (
            <span key={t} role="columnheader" className="hidden text-right sm:block">
              {t}
            </span>
          ))}
        </div>
        {c.porOrigen.length === 0 && (
          <p className="border-t border-dark-300 px-5 py-3 text-sm text-neutral">Sin pedidos ni inscripciones en este periodo.</p>
        )}
        {c.porOrigen.map((f) => (
          <div key={f.origen} role="row" className={`border-t border-dark-300 px-5 py-2.5 text-sm ${COLUMNAS_ORIGEN}`}>
            <span role="cell" className={`block break-words ${f.origen === 'sin dato' ? 'text-neutral' : 'text-white'}`}>
              {f.origen}
            </span>
            {/* En el celular, una línea con lo que hubo; desde 640 px, una columna por cifra */}
            <span role="cell" className="block text-neutral-light sm:hidden">
              {resumenFila(f)}
            </span>
            {[String(f.pedidos), String(f.pagados), f.pagados ? textoMontos(f.cobrado) : '—', String(f.inscripciones)].map(
              (v, i) => (
                <span key={i} role="cell" className="hidden text-right tabular-nums text-white sm:block">
                  {v}
                </span>
              ),
            )}
          </div>
        ))}
      </div>

      <p className="border-t border-dark-300 px-5 py-3 text-xs leading-relaxed text-neutral">
        Pedidos: los registrados ese día, en la web y{' '}
        <Link href="/admin/ventas" className="text-neutral-light underline underline-offset-2 hover:text-accent">
          a mano
        </Link>
        , sin los cancelados. Cobrado: los pagados. Clase: quienes dejaron sus datos en /clase antes de pagar. El origen es
        de dónde llegó la persona la primera vez (los atajos rrboxing.com/ig, /tt, /fb, /yt y /wa o el sitio que la trajo);
        «sin dato», si no se guardó.
      </p>
    </section>
  )
}

function HojasAbiertas({ medicion }: { medicion: TableroMedicion | null }) {
  if (!medicion) return null
  const { enPlazo, vencidas } = medicion.hojas
  return (
    <section className="rounded-2xl border border-dark-300 bg-dark-100" aria-labelledby="titulo-libro">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4">
        <h2 id="titulo-libro" className="text-lg font-semibold text-white">
          Libro de reclamaciones
        </h2>
        <Link href="/admin/reclamos" className="text-sm text-accent hover:underline">
          Ver todas las hojas
        </Link>
      </div>
      {enPlazo.length === 0 && (
        <p className="border-t border-dark-300 px-5 py-3 text-sm text-neutral">Ninguna hoja tiene el plazo corriendo.</p>
      )}
      {enPlazo.slice(0, MAX_HOJAS).map((h) => {
        const p = plazoHoja(h)
        return (
          <Link
            key={h.numero}
            href={`/admin/reclamos#hoja-${h.numero}`}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-dark-300 px-5 py-3 hover:bg-dark-200/40"
          >
            <span className="min-w-0">
              <span className="block font-medium text-white">
                <span className="tabular-nums">{h.numero}</span> · {h.tipo === 'queja' ? 'Queja' : 'Reclamo'}
              </span>
              <span className="block break-words text-sm text-neutral-light">{h.nombre}</span>
              <span className="block text-sm text-neutral">Vence el {h.vence}</span>
            </span>
            <span className={`text-sm font-semibold ${p.tono}`}>{p.texto}</span>
          </Link>
        )
      })}
      {enPlazo.length > MAX_HOJAS && (
        <Link
          href="/admin/reclamos"
          className="block border-t border-dark-300 px-5 py-3 text-sm text-neutral-light hover:bg-dark-200/40 hover:text-white"
        >
          {enPlazo.length - MAX_HOJAS === 1 ? 'Otra hoja' : `Otras ${enPlazo.length - MAX_HOJAS} hojas`} con más plazo
        </Link>
      )}
      {vencidas > 0 && (
        <p className="border-t border-dark-300 px-5 py-3 text-sm text-red-400">
          {vencidas === 1 ? '1 hoja de los últimos 60 días ya venció' : `${vencidas} hojas de los últimos 60 días ya vencieron`}.
          El panel no registra si se respondieron: revisa que sí.
        </p>
      )}
    </section>
  )
}

export default function DashboardAdminClient({
  snapshot,
  medicion,
}: {
  snapshot: DashboardSnapshot
  medicion: TableroMedicion | null
}) {
  const [notifications, setNotifications] = useState(() => sinDatosDePedido(snapshot.notifications))
  const [unread, setUnread] = useState(snapshot.unreadNotifications)

  const refreshNotifs = useCallback(async () => {
    const res = await fetch('/api/admin/notifications', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    setNotifications(sinDatosDePedido(data.notifications ?? []))
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
          <h1 className="text-4xl font-bold text-white">Panel</h1>
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

      <TableroOrigen medicion={medicion} />
      <HojasAbiertas medicion={medicion} />

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
                {n.type === 'libro_reclamacion' ? (
                  <a href={n.link ?? '/admin/reclamos'} className="text-xs underline opacity-90">
                    Ver la hoja en el Libro de reclamaciones
                  </a>
                ) : (
                  n.body && <p className="text-xs opacity-90">{n.body}</p>
                )}
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
