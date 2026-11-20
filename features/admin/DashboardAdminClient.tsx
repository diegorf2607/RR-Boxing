'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { DashboardSnapshot } from '@/shared/lib/data-store'
import type { Order, Product } from '@/shared/types/commerce'
import type { AdminNotification } from '@/shared/types/admin'
import {
  DIAS_HABILES_PRONTO,
  textoMontos,
  type ClavePeriodo,
  type FilaOrigen,
  type HojaAbierta,
  type Monto,
  type TableroMedicion,
} from '@/shared/lib/resumen-diario'
import { queFalta } from '@/features/admin/por-atender'

// El panel (/admin). En el celular va primero lo que hay que hacer hoy: los pedidos por atender y las hojas del Libro
// que vencen pronto. Después, las ventas, las cifras por origen y, al final, lo demás (avisos, stock, productos).

/** Las cifras de ventas que arma app/admin/page.tsx (con el mes de Lima) */
export type VentasPanel = {
  pagados: number
  cobradoMes: Monto[]
  cobradoTotal: Monto[]
  ticketPromedio: number
}

/** «S/ 39.98»; los pedidos viejos en otra moneda, con su código */
const dinero = (n: number, moneda = 'PEN') => (moneda === 'PEN' ? `S/ ${n.toFixed(2)}` : `${moneda} ${n.toFixed(2)}`)
/** «20/11/26, 4:54 p. m.», sin que «p. m.» se parta en dos líneas */
const fechaCorta = (iso: string) => new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }).replace(/\s([ap])\.\s?m\./g, '\u00a0$1.\u00a0m.')

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

/** El título del aviso: rojo si es crítico, amarillo si hay que revisarlo */
function notifTitleClass(s: AdminNotification['severity']) {
  if (s === 'critical') return 'text-red-400'
  if (s === 'warning') return 'text-accent'
  return 'text-white'
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

/** Cuántas hojas que vencen pronto se listan en el panel; las demás, en /admin/reclamos */
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
  if (enPlazo.length === 0 && vencidas === 0) return null
  // Arriba solo las que vencen en los próximos días hábiles (como el resumen de cada mañana); las demás, en el Libro
  const pronto = enPlazo.filter((h) => h.dias <= DIAS_HABILES_PRONTO).slice(0, MAX_HOJAS)
  const conMasPlazo = enPlazo.length - pronto.length
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
      {pronto.length === 0 && enPlazo.length > 0 && (
        <p className="border-t border-dark-300 px-5 py-3 text-sm text-neutral">
          Ninguna hoja vence en los próximos {DIAS_HABILES_PRONTO} días hábiles.
        </p>
      )}
      {pronto.map((h) => {
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
      {conMasPlazo > 0 && (
        <Link
          href="/admin/reclamos"
          className="block border-t border-dark-300 px-5 py-3 text-sm text-neutral-light hover:bg-dark-200/40 hover:text-white"
        >
          {conMasPlazo === 1 ? 'Otra hoja en plazo' : `Otras ${conMasPlazo} hojas en plazo`}
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

/** Los pedidos que falta cobrar o enviar, con lo que falta en cada uno */
function PorAtender({ atender }: { atender: { total: number; pedidos: Order[] } }) {
  const otros = atender.total - atender.pedidos.length
  return (
    <section className="rounded-2xl border border-dark-300 bg-dark-100" aria-labelledby="titulo-atender">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4">
        <h2 id="titulo-atender" className="text-lg font-semibold text-white">
          Por atender <span className="tabular-nums text-accent">{atender.total}</span>
        </h2>
        <Link href="/admin/orders" className="text-sm text-accent hover:underline">
          Ver los pedidos
        </Link>
      </div>
      {atender.pedidos.length === 0 && (
        <p className="border-t border-dark-300 px-5 py-3 text-sm text-neutral">No tienes pedidos por cobrar ni por enviar.</p>
      )}
      {atender.pedidos.map((o) => (
        <Link
          key={o.id}
          href={`/admin/orders/${o.id}`}
          className="flex items-baseline justify-between gap-4 border-t border-dark-300 px-5 py-3 hover:bg-dark-200/40"
        >
          <span className="min-w-0">
            <span className="block whitespace-nowrap font-mono text-sm text-accent">{o.id}</span>
            <span className="block truncate text-base text-white">{o.customerName || o.customerEmail}</span>
            <span className="block text-sm text-neutral">
              {queFalta(o)} · {fechaCorta(o.createdAt)}
            </span>
          </span>
          <span className="shrink-0 text-base font-semibold tabular-nums text-white">{dinero(o.totalAmount, o.currency)}</span>
        </Link>
      ))}
      {otros > 0 && (
        <Link
          href="/admin/orders"
          className="block border-t border-dark-300 px-5 py-3 text-sm text-neutral-light hover:bg-dark-200/40 hover:text-white"
        >
          {otros === 1 ? 'Otro pedido por atender' : `Otros ${otros} pedidos por atender`}
        </Link>
      )}
    </section>
  )
}

/** Cuatro cifras de ventas, de dos en dos en el celular */
function Ventas({ ventas }: { ventas: VentasPanel }) {
  const cifras: [string, string][] = [
    ['Pedidos pagados', String(ventas.pagados)],
    ['Cobrado este mes', textoMontos(ventas.cobradoMes)],
    ['Cobrado en total', textoMontos(ventas.cobradoTotal)],
    ['Ticket promedio', dinero(ventas.ticketPromedio)],
  ]
  return (
    <section aria-labelledby="titulo-ventas">
      <h2 id="titulo-ventas" className="mb-2 text-lg font-semibold text-white">
        Ventas
      </h2>
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cifras.map(([t, v]) => (
          <div key={t} className="min-w-0 rounded-2xl border border-dark-300 bg-dark-100 px-4 py-3">
            <dt className="text-sm text-neutral">{t}</dt>
            <dd className="mt-1 break-words text-xl font-semibold tabular-nums text-white">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-neutral">
        Pedidos pagados o en camino, de la web y los registrados a mano, sin reembolsos. El mes es el de Lima.
      </p>
    </section>
  )
}

export default function DashboardAdminClient({
  snapshot,
  medicion,
  atender,
  ventas,
}: {
  snapshot: DashboardSnapshot
  medicion: TableroMedicion | null
  atender: { total: number; pedidos: Order[] }
  ventas: VentasPanel
}) {
  const [notifications, setNotifications] = useState(() => sinDatosDePedido(snapshot.notifications))
  const [unread, setUnread] = useState(snapshot.unreadNotifications)

  const refreshNotifs = useCallback(async () => {
    const res = await fetch('/api/admin/notifications', { cache: 'no-store' }).catch(() => null)
    if (!res?.ok) return
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
    }).catch(() => null)
    void refreshNotifs()
  }

  async function markAllRead() {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    }).catch(() => null)
    void refreshNotifs()
  }

  const { kpis, ordersByStatus, lowStockCountByBand, recentOrders, recentProducts, settings } = snapshot

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="font-heading text-4xl leading-none text-white md:text-5xl">Panel</h1>
        {!settings.storeEnabled && (
          <p className="mt-2 text-sm text-red-400">
            La tienda está deshabilitada en{' '}
            <Link href="/admin/settings" className="underline underline-offset-2">
              Configuración
            </Link>
            .
          </p>
        )}
      </div>

      <PorAtender atender={atender} />
      <HojasAbiertas medicion={medicion} />
      <Ventas ventas={ventas} />
      <TableroOrigen medicion={medicion} />

      {/* Los avisos van cerrados: casi todo lo que dicen ya está arriba */}
      <details className="group rounded-2xl border border-dark-300 bg-dark-100">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-3">
          <span className="whitespace-nowrap text-lg font-semibold text-white">Avisos internos</span>
          <span className="whitespace-nowrap text-sm text-neutral">
            {unread > 0 ? <span className="tabular-nums text-accent">{unread} sin leer</span> : 'todos leídos'}
            <span aria-hidden className="ml-2 inline-block transition-transform group-open:rotate-180">
              ▾
            </span>
          </span>
        </summary>
        <div className="flex justify-end border-t border-dark-300 px-5 py-2">
          <button type="button" onClick={() => void markAllRead()} className="min-h-[44px] text-sm font-semibold text-accent hover:underline">
            Marcar todos como leídos
          </button>
        </div>
        <ul className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 && <li className="border-t border-dark-300 px-5 py-3 text-sm text-neutral">Sin avisos.</li>}
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-3 border-t border-dark-300 px-5 py-3 text-sm">
              <div className="min-w-0">
                <p className={`break-words font-semibold ${notifTitleClass(n.severity)}`}>{n.title}</p>
                {n.type === 'libro_reclamacion' ? (
                  <a href={n.link ?? '/admin/reclamos'} className="text-sm text-neutral-light underline underline-offset-2">
                    Ver la hoja en el Libro de reclamaciones
                  </a>
                ) : (
                  n.body && <p className="break-words text-neutral-light">{n.body}</p>
                )}
                <p className="mt-1 text-xs text-neutral">
                  {fechaCorta(n.createdAt)}
                  {n.link && n.type !== 'libro_reclamacion' && (
                    <>
                      {' · '}
                      <Link href={n.link} className="text-accent hover:underline">
                        Abrir
                      </Link>
                    </>
                  )}
                </p>
              </div>
              {!n.readAt && (
                <button type="button" onClick={() => void markRead(n.id)} className="min-h-[44px] shrink-0 text-sm text-accent">
                  Leído
                </button>
              )}
            </li>
          ))}
        </ul>
      </details>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-dark-300 bg-dark-100" aria-labelledby="titulo-ultimos">
          <h2 id="titulo-ultimos" className="px-5 py-4 text-lg font-semibold text-white">
            Últimos pedidos
          </h2>
          {recentOrders.length === 0 && <p className="border-t border-dark-300 px-5 py-3 text-sm text-neutral">Sin pedidos.</p>}
          {recentOrders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="flex items-baseline justify-between gap-4 border-t border-dark-300 px-5 py-3 text-sm hover:bg-dark-200/40"
            >
              <span className="min-w-0">
                <span className="block whitespace-nowrap font-mono text-accent">{o.id}</span>
                <span className="block truncate text-neutral-light">
                  {o.customerName || o.customerEmail} · {payLabel(o.paymentStatus)}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block tabular-nums text-white">{dinero(o.totalAmount, o.currency)}</span>
                <span className="block text-neutral">{orderStatusLabel(o.status)}</span>
              </span>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-dark-300 bg-dark-100" aria-labelledby="titulo-estados">
          <h2 id="titulo-estados" className="px-5 py-4 text-lg font-semibold text-white">
            Pedidos por estado
          </h2>
          <dl>
            {(Object.entries(ordersByStatus) as [Order['status'], number][]).map(([st, n]) => (
              <div key={st} className="flex justify-between border-t border-dark-300 px-5 py-2.5 text-sm">
                <dt className="text-neutral-light">{orderStatusLabel(st)}</dt>
                <dd className="tabular-nums text-white">{n}</dd>
              </div>
            ))}
          </dl>
          {Object.keys(ordersByStatus).length === 0 && (
            <p className="border-t border-dark-300 px-5 py-3 text-sm text-neutral">Sin pedidos aún.</p>
          )}
          <p className="border-t border-dark-300 px-5 py-3 text-sm text-neutral">{kpis.totalOrders} pedidos en total.</p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-dark-300 bg-dark-100" aria-labelledby="titulo-stock">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4">
            <h2 id="titulo-stock" className="text-lg font-semibold text-white">
              Productos y stock
            </h2>
            <Link href="/admin/products" className="text-sm text-accent hover:underline">
              Ver productos
            </Link>
          </div>
          <dl>
            {(
              [
                ['A la venta en la tienda', kpis.activeProducts],
                [`Con stock bajo (menos de ${settings.lowStockThreshold})`, kpis.lowStockProducts],
                ['Stock crítico (menos de la mitad)', lowStockCountByBand.critical],
                ['Sin imágenes', kpis.productsWithoutImages],
              ] as const
            ).map(([t, v]) => (
              <div key={t} className="flex justify-between gap-4 border-t border-dark-300 px-5 py-2.5 text-sm">
                <dt className="text-neutral-light">{t}</dt>
                <dd className="tabular-nums text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-dark-300 bg-dark-100" aria-labelledby="titulo-recientes">
          <h2 id="titulo-recientes" className="px-5 py-4 text-lg font-semibold text-white">
            Productos editados hace poco
          </h2>
          {recentProducts.length === 0 && <p className="border-t border-dark-300 px-5 py-3 text-sm text-neutral">Sin productos.</p>}
          {recentProducts.map((p: Product) => (
            <div key={p.id} className="flex items-baseline justify-between gap-3 border-t border-dark-300 px-5 py-2.5 text-sm">
              <Link href={`/admin/products#edit-${p.id}`} className="min-w-0 break-words text-accent hover:underline">
                {p.name}
              </Link>
              <span className="shrink-0 text-xs text-neutral">
                {p.updatedAt || p.createdAt ? fechaCorta(p.updatedAt ?? p.createdAt ?? '') : '—'}
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
