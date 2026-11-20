'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Order, OrderStatus, PaymentStatus } from '@/shared/types/commerce'
import type { DigitalGift, OrderGiftSendEvent } from '@/shared/types/digital-gifts'
import type { FormaPago, PedidoDatos } from '@/shared/lib/pedido-datos'
import { origenTexto } from '@/shared/lib/origen'
import { whatsappLegible } from '@/shared/lib/clase-virtual'
import { FORMAS_DE_PAGO } from '@/app/admin/ventas/opciones'

// El detalle de un pedido en el panel. Arriba va lo que Richard viene a hacer desde el celular: ver el estado y el
// total, escribirle al cliente por WhatsApp, marcar el pago y ver a dónde se envía. Lo demás va debajo.

const FORMA_PAGO: Record<FormaPago, string> = {
  whatsapp: 'Coordinar por WhatsApp',
  mercadopago: 'Mercado Pago',
}

/** «whatsapp» → «Coordinar por WhatsApp»; lo que se escribió en el panel («Yape») queda tal cual. */
function metodoLabel(m: string | null | undefined) {
  if (!m) return '—'
  return m in FORMA_PAGO ? FORMA_PAGO[m as FormaPago] : m
}

/** «S/ 39.98»; los pedidos viejos en otra moneda, con su código */
const dinero = (n: number, moneda = 'PEN') => (moneda === 'PEN' ? `S/ ${n.toFixed(2)}` : `${moneda} ${n.toFixed(2)}`)

/** Sin que «p. m.» se parta en dos líneas */
const fechaLarga = (iso: string) => new Date(iso).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' }).replace(/\s([ap])\.\s?m\./g, '\u00a0$1.\u00a0m.')

/** Una fila con línea fina, como en /clase */
function Fila({ etiqueta, children, nota }: { etiqueta: string; children: React.ReactNode; nota?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-dark-300 px-5 py-3 first:border-t-0">
      <dt className="shrink-0 text-sm text-neutral">{etiqueta}</dt>
      <dd className="min-w-0 break-words text-right text-base text-white">
        {children}
        {nota ? <span className="block text-sm text-neutral">{nota}</span> : null}
      </dd>
    </div>
  )
}

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

/**
 * El mensaje para abrir el chat con el cliente: menciona el número de pedido y lo que pidió, y lo que toca según el
 * estado (cómo pagar o coordinar el envío). Richard lo revisa en WhatsApp antes de mandarlo.
 */
function mensajeCliente(order: Order, datos: PedidoDatos | null): string {
  const nombre = order.customerName?.trim().split(/\s+/)[0]
  const envio = datos?.envio
  const total = `Total: ${dinero(order.totalAmount, order.currency)}${
    envio ? (envio.monto > 0 ? `, con envío ${envio.nombre.toLowerCase()}` : `, envío ${envio.nombre.toLowerCase()} gratis`) : ''
  }.`
  const a = datos?.distrito ? ` a ${datos.distrito}` : ''
  const sinPagar = order.paymentStatus !== 'paid'
  const cierre =
    order.status === 'cancelled'
      ? []
      : sinPagar
        ? [`Te confirmo el envío${a} y te paso cómo pagar.`]
        : order.status === 'paid' || order.status === 'processing'
          ? [`Ya tenemos tu pago. Te escribo para coordinar el envío${a}.`]
          : []
  return [
    `Hola${nombre ? `, ${nombre}` : ''}. Te escribo de RR Boxing por tu pedido ${order.id}:`,
    ...order.items.map((it) => `• ${it.quantity} × ${it.productName}`),
    ...(sinPagar && order.status !== 'cancelled' ? [total] : []),
    ...cierre,
  ].join('\n')
}

/** Marcar el pago de un pedido que ya existe (sobre todo los de la web, que se pagan por WhatsApp) */
function MarcarPagado({ orderId, onListo }: { orderId: string; onListo: () => void }) {
  const [forma, setForma] = useState('')
  const [otra, setOtra] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<{ texto: string; campo?: string } | null>(null)

  async function marcar(e: React.FormEvent) {
    e.preventDefault()
    if (!forma) {
      setError({ texto: 'Elige cómo te pagó.', campo: 'formaPago' })
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/pagado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formaPago: forma, ...(forma === 'otro' && otra.trim() ? { formaPagoOtra: otra.trim() } : {}) }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; campo?: string }
      if (!res.ok) {
        setError({ texto: data.error || 'No se pudo guardar. Prueba otra vez.', campo: data.campo })
        return
      }
      onListo()
    } catch {
      setError({ texto: 'No hay conexión. Prueba otra vez.' })
    } finally {
      setEnviando(false)
    }
  }

  const errorForma = error?.campo === 'formaPago'
  return (
    <form onSubmit={marcar} noValidate className="rounded-2xl border border-dark-300 bg-dark-100 px-5 py-4" aria-labelledby="titulo-pago">
      <h2 id="titulo-pago" className="text-lg font-semibold text-white">
        ¿Ya te pagó?
      </h2>
      <p className="mt-1 text-sm text-neutral-light">
        Márcalo aquí. No lo registres otra vez en Registrar venta: se contaría dos veces.
      </p>
      <fieldset className="mt-3" aria-describedby={errorForma ? 'error-forma-pago' : undefined}>
        <legend className="text-sm text-neutral">Cómo te pagó</legend>
        <div className="mt-1 flex flex-wrap gap-x-5">
          {FORMAS_DE_PAGO.map((f) => (
            <label key={f.valor} className="flex min-h-[44px] items-center gap-2 text-base text-white">
              <input
                type="radio"
                name="formaPago"
                value={f.valor}
                checked={forma === f.valor}
                onChange={() => {
                  setForma(f.valor)
                  if (errorForma) setError(null)
                }}
                className="h-4 w-4 accent-accent"
              />
              {f.texto}
            </label>
          ))}
        </div>
      </fieldset>
      {errorForma && (
        <p id="error-forma-pago" className="mt-1 text-sm text-red-400">
          {error?.texto}
        </p>
      )}
      {forma === 'otro' && (
        <label className="mt-3 block text-sm text-neutral-light">
          ¿Cuál? (opcional)
          <input
            value={otra}
            onChange={(e) => setOtra(e.target.value)}
            maxLength={40}
            autoComplete="off"
            className="mt-2 block w-full rounded-lg border border-dark-300 bg-dark px-4 py-3 text-base text-white focus:border-accent focus:outline-none"
          />
        </label>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="mt-4 block w-full rounded-lg border border-accent px-6 py-3 text-center text-base font-bold text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
      >
        {enviando ? 'Guardando…' : 'Marcar como pagado'}
      </button>
      {error && !errorForma && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error.texto}
        </p>
      )}
    </form>
  )
}

type EmailDraft = { subject: string; text: string; to: string }

export default function OrderDetailClient({ orderId, datos = null }: { orderId: string; datos?: PedidoDatos | null }) {
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
  const [aviso, setAviso] = useState('')

  const load = useCallback(async () => {
    setError('')
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { cache: 'no-store' }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}
    if (!res || !res.ok) {
      setError(res?.status === 404 ? 'No encontramos este pedido.' : 'No se pudo cargar el pedido. Recarga la página.')
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
    await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internalNotes: notes || null }),
    }).catch(() => null)
    setSaving(false)
    void load()
  }

  async function patchOrder(patch: Partial<Order>, hecho?: string) {
    setSaving(true)
    setAviso('')
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => null)
    await load()
    setSaving(false)
    setAviso(res?.ok ? (hecho ?? '') : 'No se pudo guardar el cambio. Prueba otra vez.')
  }

  function toggleGiftInOrder(giftId: string) {
    setGiftIdsSelection((sel) => (sel.includes(giftId) ? sel.filter((x) => x !== giftId) : [...sel, giftId]))
  }

  async function saveGiftAssociation() {
    setAssocSaving(true)
    setSendHint('')
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/digital-gifts`, {
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
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/digital-gifts/send`, { method: 'POST' })
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
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/digital-gifts/mark-manual`, {
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
  if (error || !order) return <p className="text-sm text-red-400">{error || 'No encontramos este pedido.'}</p>

  const subtotal = order.items.reduce((s, i) => s + i.unitAmount * i.quantity, 0)
  const hasSuccessfulGiftSend = giftSendEvents.some((e) => e.success)
  const lastSuccessEvent = giftSendEvents.find((e) => e.success)
  // La forma de pago vive en el pedido (la cambia «Marcar como pagado»); los datos guardados son de cuando se hizo
  const formaPago = order.paymentMethod || datos?.formaPago
  const sinPagar = order.paymentStatus !== 'paid'
  const sePuedeMarcarPagado = (order.paymentStatus === 'unpaid' || order.paymentStatus === 'failed') && order.status !== 'cancelled'
  const sePuedeMarcarEnviado = !sinPagar && (order.status === 'paid' || order.status === 'processing')
  const enlaceCliente = datos?.whatsapp
    ? `https://wa.me/${datos.whatsapp}?text=${encodeURIComponent(mensajeCliente(order, datos))}`
    : null
  const unidades = order.items.reduce((s, i) => s + i.quantity, 0)
  const regalosAbiertos = digitalGifts.length > 0 || giftSendEvents.length > 0

  const regalos = (
    <div className="space-y-4 px-5 pb-5">
      <p className="text-sm text-neutral">
        Asocia regalos del catálogo a este pedido. El correo al cliente solo incluirá regalos activos.
      </p>
      {hasSuccessfulGiftSend ? (
        <p className="text-sm text-white">
          Enviado al menos una vez
          {lastSuccessEvent
            ? ` · último: ${new Date(lastSuccessEvent.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })} (${channelLabel(lastSuccessEvent.channel)})`
            : ''}
        </p>
      ) : (
        <p className="text-sm text-neutral-light">Aún no consta un envío exitoso (automático o manual).</p>
      )}

      <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-dark-300 p-2">
        {catalogGifts.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-neutral">No hay regalos en el catálogo. Se crean en Regalos digitales.</p>
        ) : (
          catalogGifts.map((g) => (
            <label
              key={g.id}
              className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md px-2 text-sm hover:bg-dark-300/40 ${!g.active ? 'opacity-60' : ''}`}
            >
              <input
                type="checkbox"
                checked={giftIdsSelection.includes(g.id)}
                onChange={() => toggleGiftInOrder(g.id)}
                className="h-4 w-4 accent-accent"
              />
              <span>
                <span className="text-white">{g.name}</span>
                <span className="ml-2 text-xs text-neutral">({giftTypeLabel(g.giftType)})</span>
                {!g.active ? <span className="ml-2 text-xs text-neutral">inactivo</span> : null}
              </span>
            </label>
          ))
        )}
      </div>
      <button
        type="button"
        disabled={assocSaving}
        onClick={() => void saveGiftAssociation()}
        className="min-h-[44px] rounded-lg border border-dark-300 px-4 text-sm font-medium text-white hover:border-accent disabled:opacity-50"
      >
        Guardar regalos en el pedido
      </button>

      {digitalGifts.length > 0 ? (
        <ul className="space-y-2 border-t border-dark-300 pt-4 text-sm">
          {digitalGifts.map((g) => (
            <li key={g.id} className="text-neutral-light">
              <span className="font-medium text-white">{g.name}</span> · {giftTypeLabel(g.giftType)}
              {!g.active ? <span className="text-neutral"> (inactivo, no se envía)</span> : null}
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

      <div className="border-t border-dark-300 pt-4">
        <button
          type="button"
          disabled={sendBusy || digitalGifts.length === 0}
          onClick={() => void sendGiftsEmail()}
          className="min-h-[44px] rounded-lg border border-accent px-4 text-sm font-semibold text-accent hover:bg-accent/10 disabled:opacity-50"
        >
          Enviar regalos por correo
        </button>
      </div>

      {sendHint ? <p className="text-sm text-neutral-light">{sendHint}</p> : null}

      {emailDraft ? (
        <div className="space-y-2 rounded-lg border border-dark-300 bg-dark p-3 text-sm">
          <p className="font-medium text-white">Borrador de correo (para envío manual)</p>
          <p className="text-xs text-neutral">Para: {emailDraft.to}</p>
          <p className="text-xs text-neutral">Asunto: {emailDraft.subject}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyText(`Para: ${emailDraft.to}\nAsunto: ${emailDraft.subject}\n\n${emailDraft.text}`)}
              className="min-h-[44px] rounded-lg border border-dark-300 px-3 text-xs text-white"
            >
              Copiar todo
            </button>
            <button
              type="button"
              onClick={() => void copyText(emailDraft.text)}
              className="min-h-[44px] rounded-lg border border-dark-300 px-3 text-xs text-white"
            >
              Copiar cuerpo
            </button>
          </div>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded border border-dark-300 bg-dark-100 p-2 text-xs text-neutral-light">
            {emailDraft.text}
          </pre>
        </div>
      ) : null}

      <div className="space-y-2 border-t border-dark-300 pt-4">
        <p className="text-xs text-neutral">
          Si ya enviaste el correo tú mismo (Gmail, Outlook…), regístralo aquí para dejar constancia y permitir reenvíos marcados como
          reenvío.
        </p>
        <textarea
          value={manualNote}
          onChange={(e) => setManualNote(e.target.value)}
          rows={2}
          placeholder="Nota opcional (por ejemplo, enviado desde Gmail a las 10:30)"
          className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 text-base text-white"
        />
        <button
          type="button"
          disabled={manualBusy}
          onClick={() => void markManualSent()}
          className="min-h-[44px] rounded-lg border border-dark-300 px-4 text-sm text-white hover:border-accent disabled:opacity-50"
        >
          Registrar envío manual
        </button>
      </div>

      {giftSendEvents.length > 0 ? (
        <div className="border-t border-dark-300 pt-4">
          <h3 className="mb-2 text-sm font-semibold text-white">Historial de envíos</h3>
          <ul className="divide-y divide-dark-300 text-xs text-neutral-light">
            {giftSendEvents.map((ev) => (
              <li key={ev.id} className="py-2">
                <span className={ev.success ? 'text-white' : 'text-red-400'}>{ev.success ? 'Enviado' : 'Error'}</span>
                {' · '}
                {new Date(ev.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                {' · '}
                {channelLabel(ev.channel)}
                {ev.isResend ? ' · reenvío' : ''}
                {ev.errorText ? <span className="block text-red-400">{ev.errorText}</span> : null}
                {ev.adminNote ? <span className="block text-neutral">Nota: {ev.adminNote}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="max-w-3xl space-y-6">
      {/* 1. Estado, total y a quién escribir */}
      <section aria-label="Estado del pedido" className="space-y-3">
        <dl className="rounded-2xl border border-dark-300 bg-dark-100">
          <Fila etiqueta="Pago" nota={metodoLabel(formaPago)}>
            <span className={`font-semibold ${sinPagar ? (order.paymentStatus === 'unpaid' ? 'text-accent' : 'text-red-400') : 'text-white'}`}>
              {payLabel(order.paymentStatus)}
            </span>
          </Fila>
          <Fila etiqueta="Pedido">{orderStatusLabel(order.status)}</Fila>
          <Fila
            etiqueta="Total"
            nota={datos?.montos && datos.montos.envio > 0 ? `incluye envío ${dinero(datos.montos.envio, order.currency)} de referencia` : undefined}
          >
            <span className="text-xl font-semibold tabular-nums">{dinero(order.totalAmount, order.currency)}</span>
          </Fila>
          <Fila etiqueta="Cliente" nota={fechaLarga(order.createdAt)}>
            {order.customerName || order.customerEmail || '—'}
          </Fila>
        </dl>

        {enlaceCliente ? (
          <>
            <a
              href={enlaceCliente}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-accent px-6 py-4 text-center text-lg font-bold text-dark transition-colors hover:bg-accent-dark"
            >
              Escribir por WhatsApp
            </a>
            <p className="text-sm text-neutral">
              Se abre el chat con {datos ? whatsappLegible(datos.whatsapp) : ''} y un mensaje con el número de pedido. Revísalo antes de
              enviarlo.
            </p>
          </>
        ) : (
          <p className="rounded-2xl border border-dark-300 bg-dark-100 px-5 py-4 text-sm text-neutral-light">
            Este pedido no tiene WhatsApp guardado.
            {order.customerEmail ? (
              <>
                {' '}
                Escríbele a{' '}
                <a href={`mailto:${order.customerEmail}`} className="text-accent underline underline-offset-2">
                  {order.customerEmail}
                </a>
                .
              </>
            ) : null}
          </p>
        )}
      </section>

      {/* 2. A dónde se envía */}
      {datos ? (
        <section aria-labelledby="titulo-entrega">
          <h2 id="titulo-entrega" className="mb-2 text-lg font-semibold text-white">
            Entrega
          </h2>
          <dl className="rounded-2xl border border-dark-300 bg-dark-100">
            <Fila etiqueta="Distrito">{datos.distrito || '—'}</Fila>
            <Fila etiqueta="Dirección">{datos.direccion || '—'}</Fila>
            {datos.referencia ? <Fila etiqueta="Referencia">{datos.referencia}</Fila> : null}
            <Fila etiqueta="Envío" nota={datos.envio ? 'de referencia: confírmalo por WhatsApp' : undefined}>
              {datos.envio
                ? `${datos.envio.nombre} · ${datos.envio.plazo} · ${datos.envio.monto > 0 ? dinero(datos.envio.monto) : 'gratis'}`
                : '—'}
            </Fila>
            {datos.colores.length > 0 ? (
              <Fila etiqueta="Color">{datos.colores.map((c) => `${c.producto}: ${c.color} (${c.cantidad})`).join(' · ')}</Fila>
            ) : null}
            <Fila etiqueta="WhatsApp">{datos.whatsapp ? whatsappLegible(datos.whatsapp) : '—'}</Fila>
            {datos.dni ? <Fila etiqueta="DNI">{datos.dni}</Fila> : null}
          </dl>
        </section>
      ) : (
        <p className="text-sm text-neutral">
          Este pedido no tiene datos de entrega guardados en la web (es anterior a /checkout o no se pudieron guardar).
        </p>
      )}

      {/* 3. Marcar el pago o el envío */}
      {sePuedeMarcarPagado && <MarcarPagado orderId={order.id} onListo={() => void load().then(() => setAviso('Listo: el pedido quedó pagado.'))} />}
      {sePuedeMarcarEnviado && (
        <button
          type="button"
          disabled={saving}
          onClick={() => void patchOrder({ status: 'shipped' }, 'Listo: el pedido quedó como enviado.')}
          className="block w-full rounded-lg border border-accent px-6 py-3 text-center text-base font-bold text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
        >
          Marcar como enviado
        </button>
      )}
      {aviso && (
        <p role="status" className={`text-sm ${aviso.startsWith('Listo') ? 'text-white' : 'text-red-400'}`}>
          {aviso}
        </p>
      )}

      {/* 4. Lo que pidió */}
      <section aria-labelledby="titulo-productos">
        <h2 id="titulo-productos" className="mb-2 text-lg font-semibold text-white">
          Productos <span className="text-sm font-normal text-neutral">· {unidades === 1 ? '1 unidad' : `${unidades} unidades`}</span>
        </h2>
        <dl className="rounded-2xl border border-dark-300 bg-dark-100">
          {order.items.map((it, idx) => (
            <div
              key={`${it.productId}-${idx}`}
              className="flex items-baseline justify-between gap-4 border-t border-dark-300 px-5 py-3 first:border-t-0"
            >
              <dt className="min-w-0 break-words text-base text-white">
                {it.quantity} × {it.productName}
                {it.quantity > 1 ? (
                  <span className="block text-sm text-neutral">{dinero(it.unitAmount, it.currency)} cada uno</span>
                ) : null}
              </dt>
              <dd className="shrink-0 text-base tabular-nums text-white">{dinero(it.unitAmount * it.quantity, it.currency)}</dd>
            </div>
          ))}
          {datos?.montos && datos.montos.descuentoCombo > 0 ? (
            <>
              <Fila etiqueta="Subtotal">
                <span className="tabular-nums">{dinero(subtotal, order.currency)}</span>
              </Fila>
              <Fila etiqueta="Combo 10%">
                <span className="tabular-nums">−{dinero(datos.montos.descuentoCombo, order.currency)}</span>
              </Fila>
            </>
          ) : null}
          {datos?.montos ? (
            <Fila etiqueta="Envío" nota="de referencia">
              <span className="tabular-nums">{datos.montos.envio > 0 ? dinero(datos.montos.envio, order.currency) : 'gratis'}</span>
            </Fila>
          ) : null}
          <Fila etiqueta="Total">
            <span className="font-semibold tabular-nums text-accent">{dinero(order.totalAmount, order.currency)}</span>
          </Fila>
        </dl>
      </section>

      {/* 5. Lo demás */}
      <section aria-labelledby="titulo-mas">
        <h2 id="titulo-mas" className="mb-2 text-lg font-semibold text-white">
          Más datos
        </h2>
        <dl className="rounded-2xl border border-dark-300 bg-dark-100">
          <Fila etiqueta="Número">
            <span className="whitespace-nowrap font-mono text-sm">{order.id}</span>
          </Fila>
          <Fila etiqueta="Correo">{order.customerEmail || '—'}</Fila>
          <Fila etiqueta="Forma de pago">{metodoLabel(formaPago)}</Fila>
          {datos ? (
            <Fila
              etiqueta="Origen"
              nota={datos.origen?.entrada ? `entró por ${datos.origen.entrada}` : undefined}
            >
              {origenTexto(datos.origen)}
            </Fila>
          ) : null}
          {datos?.canal === 'panel' ? <Fila etiqueta="Canal">Venta registrada en el panel</Fila> : null}
          <Fila etiqueta="País">{order.country}</Fila>
        </dl>
      </section>

      <section aria-labelledby="titulo-cambiar" className="rounded-2xl border border-dark-300 bg-dark-100 px-5 py-4">
        <h2 id="titulo-cambiar" className="text-lg font-semibold text-white">
          Cambiar el estado a mano
        </h2>
        <p className="mt-1 text-sm text-neutral">Para casos especiales (cancelado, en proceso, reembolso). Cada cambio se guarda al elegirlo.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-neutral-light">
            Estado del pedido
            <select
              value={order.status}
              disabled={saving}
              onChange={(e) => void patchOrder({ status: e.target.value as OrderStatus })}
              className="mt-2 block min-h-[44px] w-full rounded-lg border border-dark-300 bg-dark px-3 text-base text-white"
            >
              {(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
                <option key={s} value={s}>
                  {orderStatusLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-neutral-light">
            Estado de pago
            <select
              value={order.paymentStatus}
              disabled={saving}
              onChange={(e) => void patchOrder({ paymentStatus: e.target.value as PaymentStatus })}
              className="mt-2 block min-h-[44px] w-full rounded-lg border border-dark-300 bg-dark px-3 text-base text-white"
            >
              {(['unpaid', 'paid', 'failed', 'refunded'] as const).map((s) => (
                <option key={s} value={s}>
                  {payLabel(s)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section aria-labelledby="titulo-notas" className="rounded-2xl border border-dark-300 bg-dark-100 px-5 py-4">
        <h2 id="titulo-notas" className="text-lg font-semibold text-white">
          Notas internas
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          aria-labelledby="titulo-notas"
          className="mt-3 w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 text-base text-white"
          placeholder="Uso interno: incidencias, courier, llamadas…"
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveNotes()}
          className="mt-2 min-h-[44px] rounded-lg border border-accent px-4 text-sm font-semibold text-accent hover:bg-accent/10 disabled:opacity-50"
        >
          Guardar notas
        </button>
      </section>

      {/* Los regalos digitales casi no se usan: si el pedido no tiene, la sección va cerrada */}
      <details open={regalosAbiertos} className="group rounded-2xl border border-dark-300 bg-dark-100">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-3">
          <span className="whitespace-nowrap text-lg font-semibold text-white">Regalos digitales</span>
          <span className="whitespace-nowrap text-sm text-neutral">
            {digitalGifts.length > 0 ? `${digitalGifts.length} en el pedido` : 'ninguno'}
            <span aria-hidden className="ml-2 inline-block transition-transform group-open:rotate-180">
              ▾
            </span>
          </span>
        </summary>
        {regalos}
      </details>
    </div>
  )
}
