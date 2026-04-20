'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { Order, OrderStatus, PaymentStatus } from '@/shared/types/commerce'
import type { DigitalGift, OrderGiftSendEvent } from '@/shared/types/digital-gifts'

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

function giftTypeLabel(t: DigitalGift['giftType']) {
  if (t === 'pdf') return 'PDF'
  if (t === 'video') return 'Video'
  return 'Enlace'
}

function channelLabel(ch: OrderGiftSendEvent['channel']) {
  return ch === 'resend' ? 'Correo (Resend)' : 'Manual'
}

type EmailDraft = { subject: string; text: string; to: string }

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [digitalGifts, setDigitalGifts] = useState<DigitalGift[]>([])
  const [giftSendEvents, setGiftSendEvents] = useState<OrderGiftSendEvent[]>([])
  const [catalogGifts, setCatalogGifts] = useState<DigitalGift[]>([])
  const [giftIdsSelection, setGiftIdsSelection] = useState<string[]>([])
  const [assocSaving, setAssocSaving] = useState(false)
  const [sendBusy, setSendBusy] = useState(false)
  const [manualBusy, setManualBusy] = useState(false)
  const [manualNote, setManualNote] = useState('')
  const [sendHint, setSendHint] = useState('')
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null)
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
    const dg = Array.isArray(data.digitalGifts) ? (data.digitalGifts as DigitalGift[]) : []
    const ev = Array.isArray(data.giftSendEvents) ? (data.giftSendEvents as OrderGiftSendEvent[]) : []
    setDigitalGifts(dg)
    setGiftSendEvents(ev)
    setGiftIdsSelection(dg.map((g) => g.id))
    setLoading(false)
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!order) return
    void fetch('/api/admin/digital-gifts?all=1', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.gifts)) setCatalogGifts(d.gifts as DigitalGift[])
      })
      .catch(() => {})
  }, [order])

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

  function toggleGiftInOrder(giftId: string) {
    setGiftIdsSelection((sel) => (sel.includes(giftId) ? sel.filter((x) => x !== giftId) : [...sel, giftId]))
  }

  async function saveGiftAssociation() {
    setAssocSaving(true)
    setSendHint('')
    const res = await fetch(`/api/admin/orders/${orderId}/digital-gifts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ giftIds: giftIdsSelection }),
    })
    const data = await res.json().catch(() => ({}))
    setAssocSaving(false)
    if (!res.ok) {
      setSendHint(data.error || 'No se pudo guardar la asociación')
      return
    }
    void load()
  }

  async function sendGiftsEmail() {
    setSendBusy(true)
    setSendHint('')
    setEmailDraft(null)
    const res = await fetch(`/api/admin/orders/${orderId}/digital-gifts/send`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    setSendBusy(false)
    if (Array.isArray(data.events)) setGiftSendEvents(data.events as OrderGiftSendEvent[])
    if (data.emailDraft && typeof data.emailDraft === 'object') {
      setEmailDraft(data.emailDraft as EmailDraft)
    }
    if (data.sent === true) {
      setSendHint('Correo enviado correctamente (Resend).')
      void load()
      return
    }
    if (data.mode === 'manual') {
      setSendHint(
        typeof data.hint === 'string'
          ? data.hint
          : 'Envío automático no configurado: copia el borrador y envía desde tu correo, o marca envío manual cuando lo hayas hecho.'
      )
      return
    }
    if (data.mode === 'resend_failed') {
      setSendHint(typeof data.error === 'string' ? data.error : 'Falló el envío con Resend.')
      return
    }
    setSendHint(data.error || 'No se pudo completar la acción')
  }

  async function markManualSent() {
    setManualBusy(true)
    setSendHint('')
    const res = await fetch(`/api/admin/orders/${orderId}/digital-gifts/mark-manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNote: manualNote.trim() || undefined }),
    })
    const data = await res.json().catch(() => ({}))
    setManualBusy(false)
    if (!res.ok) {
      setSendHint(data.error || 'Error al registrar')
      return
    }
    setManualNote('')
    setSendHint('Registrado envío manual.')
    if (Array.isArray(data.events)) setGiftSendEvents(data.events as OrderGiftSendEvent[])
    void load()
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setSendHint('Copiado al portapapeles.')
    } catch {
      setSendHint('No se pudo copiar; selecciona el texto manualmente.')
    }
  }

  if (loading) return <p className="text-sm text-neutral">Cargando pedido…</p>
  if (error || !order) return <p className="text-red-400">{error || 'Pedido no encontrado'}</p>

  const subtotal = order.items.reduce((s, i) => s + i.unitAmount * i.quantity, 0)
  const hasSuccessfulGiftSend = giftSendEvents.some((e) => e.success)
  const lastSuccessEvent = giftSendEvents.find((e) => e.success)

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

      <article className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">Regalos digitales</h2>
        <p className="text-xs text-neutral">
          Asocia regalos del catálogo a este pedido. El correo al cliente solo incluirá regalos activos.
        </p>
        {hasSuccessfulGiftSend ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            Enviado al menos una vez
            {lastSuccessEvent
              ? ` · Último: ${new Date(lastSuccessEvent.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })} (${channelLabel(lastSuccessEvent.channel)})`
              : ''}
          </p>
        ) : (
          <p className="text-sm text-amber-200/90">Aún no consta un envío exitoso (automático o manual).</p>
        )}

        <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-dark-300/60 p-3">
          {catalogGifts.length === 0 ? (
            <p className="text-sm text-neutral">Cargando catálogo… Si sigue vacío, crea regalos en Regalos digitales.</p>
          ) : (
            catalogGifts.map((g) => (
              <label
                key={g.id}
                className={`flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-dark-300/40 ${!g.active ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={giftIdsSelection.includes(g.id)}
                  onChange={() => toggleGiftInOrder(g.id)}
                  className="mt-1"
                />
                <span>
                  <span className="text-white">{g.name}</span>
                  <span className="ml-2 text-xs text-neutral">({giftTypeLabel(g.giftType)})</span>
                  {!g.active ? <span className="ml-2 text-xs text-amber-200">inactivo</span> : null}
                </span>
              </label>
            ))
          )}
        </div>
        <button
          type="button"
          disabled={assocSaving}
          onClick={() => void saveGiftAssociation()}
          className="rounded-lg border border-dark-300 bg-dark px-4 py-2 text-sm font-medium text-white hover:bg-dark-300/50 disabled:opacity-50"
        >
          Guardar regalos en el pedido
        </button>

        {digitalGifts.length > 0 ? (
          <ul className="space-y-2 border-t border-dark-300/60 pt-4 text-sm">
            {digitalGifts.map((g) => (
              <li key={g.id} className="text-neutral-light">
                <span className="font-medium text-white">{g.name}</span> — {giftTypeLabel(g.giftType)}
                {!g.active ? <span className="text-amber-200"> (inactivo, no se envía)</span> : null}
                <br />
                <a href={g.contentUrl} target="_blank" rel="noreferrer" className="break-all text-xs text-accent hover:underline">
                  {g.contentUrl}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral">Ningún regalo vinculado aún.</p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-dark-300/60 pt-4">
          <button
            type="button"
            disabled={sendBusy || digitalGifts.length === 0}
            onClick={() => void sendGiftsEmail()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-dark disabled:opacity-50"
          >
            Enviar regalos por correo
          </button>
        </div>

        {sendHint ? <p className="text-sm text-neutral-light">{sendHint}</p> : null}

        {emailDraft ? (
          <div className="space-y-2 rounded-lg border border-accent/30 bg-dark p-3 text-sm">
            <p className="font-medium text-accent">Borrador de correo (para envío manual)</p>
            <p className="text-xs text-neutral">Para: {emailDraft.to}</p>
            <p className="text-xs text-neutral">Asunto: {emailDraft.subject}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copyText(`Para: ${emailDraft.to}\nAsunto: ${emailDraft.subject}\n\n${emailDraft.text}`)}
                className="rounded bg-dark-300 px-3 py-1 text-xs text-white"
              >
                Copiar todo
              </button>
              <button type="button" onClick={() => void copyText(emailDraft.text)} className="rounded bg-dark-300 px-3 py-1 text-xs text-white">
                Copiar cuerpo
              </button>
            </div>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded border border-dark-300/80 bg-dark-100 p-2 text-xs text-neutral-light">
              {emailDraft.text}
            </pre>
          </div>
        ) : null}

        <div className="space-y-2 border-t border-dark-300/60 pt-4">
          <p className="text-xs text-neutral">
            Si ya enviaste el correo tú mismo (Gmail, Outlook…), regístralo aquí para dejar constancia y permitir reenvíos marcados como
            reenvío.
          </p>
          <textarea
            value={manualNote}
            onChange={(e) => setManualNote(e.target.value)}
            rows={2}
            placeholder="Nota opcional (p. ej. enviado desde Gmail a las 10:30)"
            className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={manualBusy}
            onClick={() => void markManualSent()}
            className="rounded-lg border border-amber-500/50 px-4 py-2 text-sm text-amber-100 hover:bg-amber-500/10 disabled:opacity-50"
          >
            Registrar envío manual
          </button>
        </div>

        {giftSendEvents.length > 0 ? (
          <div className="border-t border-dark-300/60 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-white">Historial de envíos</h3>
            <ul className="space-y-2 text-xs text-neutral-light">
              {giftSendEvents.map((ev) => (
                <li key={ev.id} className="rounded border border-dark-300/50 bg-dark-100/50 px-2 py-2">
                  <span className={ev.success ? 'text-emerald-300' : 'text-red-300'}>{ev.success ? 'OK' : 'Error'}</span>
                  {' · '}
                  {new Date(ev.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                  {' · '}
                  {channelLabel(ev.channel)}
                  {ev.isResend ? ' · reenvío' : ''}
                  {ev.errorText ? <span className="block text-red-300/90">{ev.errorText}</span> : null}
                  {ev.adminNote ? <span className="block text-neutral">Nota: {ev.adminNote}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
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
