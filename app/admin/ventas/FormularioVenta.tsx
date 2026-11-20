'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { resumenCombo } from '@/shared/lib/combo-promo'
import { FORMAS_DE_PAGO, ORIGENES_MANUALES } from './opciones'

export interface ProductoVenta {
  id: string
  nombre: string
  /** Precio de catálogo en soles */
  precio: number
  comboEligible: boolean
  /** false: borrador o inactivo (no se ve en la tienda) */
  aLaVenta: boolean
}

type Estado = { tipo: 'listo' } | { tipo: 'enviando' } | { tipo: 'error'; texto: string } | { tipo: 'hecho'; id: string; resumen: string }

const campo =
  'mt-2 block w-full rounded-lg border border-dark-300 bg-dark px-4 py-3 text-base text-white placeholder:text-neutral-dark focus:border-accent focus:outline-none'
const etiqueta = 'block text-sm text-neutral-light'
const MAX_CANTIDAD = 99

const soles = (n: number) => `S/ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** «124,99», «S/ 124.99» → 124.99; vacío o mal escrito → null */
function leerTotal(v: string): number | null {
  const t = v.replace(/^\s*s\/\.?/i, '').replace(/\s/g, '').replace(',', '.')
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(t)) return null
  const n = Number(t)
  return n > 0 ? n : null
}

export default function FormularioVenta({ productos, hoy }: { productos: ProductoVenta[]; hoy: string }) {
  const formulario = useRef<HTMLFormElement>(null)
  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const [totalEscrito, setTotalEscrito] = useState<string | null>(null)
  const [formaPago, setFormaPago] = useState('')
  const [estado, setEstado] = useState<Estado>({ tipo: 'listo' })

  const elegidos = productos.filter((p) => (cantidades[p.id] ?? 0) > 0)
  const combo = useMemo(
    () =>
      resumenCombo(
        productos
          .filter((p) => (cantidades[p.id] ?? 0) > 0)
          .map((p) => ({ unitAmount: p.precio, quantity: cantidades[p.id], comboEligible: p.comboEligible })),
      ),
    [productos, cantidades],
  )
  const totalCatalogo = combo.total > 0 ? combo.total.toFixed(2) : ''
  const total = totalEscrito ?? totalCatalogo

  function cambiar(id: string, n: number) {
    setCantidades((c) => ({ ...c, [id]: Math.max(0, Math.min(MAX_CANTIDAD, Math.floor(n) || 0)) }))
    if (estado.tipo !== 'enviando') setEstado({ tipo: 'listo' })
  }

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (estado.tipo === 'enviando') return
    const datos = new FormData(evento.currentTarget)
    if (elegidos.length === 0) return setEstado({ tipo: 'error', texto: 'Elige al menos un producto y su cantidad.' })
    const monto = leerTotal(total)
    if (monto === null) return setEstado({ tipo: 'error', texto: 'Escribe el total que pagó, por ejemplo 124.99.' })
    if (!formaPago) return setEstado({ tipo: 'error', texto: 'Elige cómo pagó.' })

    setEstado({ tipo: 'enviando' })
    try {
      const respuesta = await fetch('/api/admin/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: String(datos.get('cliente') ?? ''),
          whatsapp: String(datos.get('whatsapp') ?? ''),
          correo: String(datos.get('correo') ?? ''),
          productos: elegidos.map((p) => ({ productId: p.id, cantidad: cantidades[p.id] })),
          total: monto,
          formaPago,
          formaPagoOtra: String(datos.get('formaPagoOtra') ?? ''),
          origen: String(datos.get('origen') ?? ''),
          fecha: String(datos.get('fecha') ?? '') || undefined,
          nota: String(datos.get('nota') ?? ''),
        }),
      })
      const json = (await respuesta.json().catch(() => ({}))) as { id?: string; error?: string; datosGuardados?: boolean }
      if (!respuesta.ok || !json.id) {
        setEstado({
          tipo: 'error',
          texto:
            respuesta.status === 401
              ? 'Tu sesión venció. Vuelve a entrar al panel.'
              : (json.error ?? 'No se pudo guardar la venta. Prueba otra vez.'),
        })
        return
      }
      const forma = FORMAS_DE_PAGO.find((f) => f.valor === formaPago)?.texto ?? formaPago
      setEstado({
        tipo: 'hecho',
        id: json.id,
        resumen: `${soles(monto)} · ${forma}${json.datosGuardados === false ? ' (no se guardaron el WhatsApp ni el origen)' : ''}`,
      })
      formulario.current?.reset()
      setCantidades({})
      setTotalEscrito(null)
      setFormaPago('')
    } catch {
      setEstado({ tipo: 'error', texto: 'No se pudo guardar la venta. Revisa tu conexión y prueba otra vez.' })
    }
  }

  return (
    <form ref={formulario} onSubmit={enviar} className="max-w-xl">
      <label className={etiqueta}>
        Nombre del cliente
        <input name="cliente" required minLength={2} maxLength={120} autoComplete="off" className={campo} />
      </label>
      <label className={`${etiqueta} mt-4`}>
        WhatsApp del cliente
        <input
          name="whatsapp"
          type="tel"
          inputMode="tel"
          required
          minLength={6}
          maxLength={30}
          autoComplete="off"
          placeholder="987 654 321"
          className={campo}
        />
      </label>
      <label className={`${etiqueta} mt-4`}>
        Correo del cliente (opcional)
        <input name="correo" type="email" maxLength={120} autoComplete="off" className={campo} />
      </label>

      <fieldset className="mt-6 rounded-2xl border border-dark-300 bg-dark-100">
        <legend className="sr-only">Productos</legend>
        <p className="px-5 py-3 text-sm text-neutral">Productos y cantidades</p>
        {productos.length === 0 && (
          <p className="border-t border-dark-300 px-5 py-4 text-sm text-neutral">No hay productos en el catálogo.</p>
        )}
        {productos.map((p) => {
          const n = cantidades[p.id] ?? 0
          return (
            <div key={p.id} className="flex items-center justify-between gap-3 border-t border-dark-300 px-5 py-3">
              <div className="min-w-0">
                <p className="break-words text-base font-medium text-white">{p.nombre}</p>
                <p className="text-sm text-neutral">
                  {soles(p.precio)}
                  {!p.aLaVenta && ' · no está a la venta en la web'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => cambiar(p.id, n - 1)}
                  disabled={n === 0}
                  aria-label={`Quitar uno de ${p.nombre}`}
                  className="h-10 w-10 rounded-lg border border-dark-300 text-lg text-white hover:border-accent disabled:opacity-40"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_CANTIDAD}
                  value={n}
                  onChange={(e) => cambiar(p.id, Number(e.target.value))}
                  aria-label={`Cantidad de ${p.nombre}`}
                  className="h-10 w-12 rounded-lg border border-dark-300 bg-dark text-center text-base tabular-nums text-white focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => cambiar(p.id, n + 1)}
                  disabled={n >= MAX_CANTIDAD}
                  aria-label={`Agregar uno de ${p.nombre}`}
                  className="h-10 w-10 rounded-lg border border-dark-300 text-lg text-white hover:border-accent disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
        {elegidos.length > 0 && (
          <div className="border-t border-dark-300 px-5 py-3 text-sm text-neutral-light">
            Precio de catálogo: <span className="text-white">{soles(combo.subtotal)}</span>
            {combo.descuento > 0 && (
              <>
                {' '}
                · combo 10%: −{soles(combo.descuento)} · <span className="text-white">{soles(combo.total)}</span>
              </>
            )}
          </div>
        )}
      </fieldset>

      <label className={`${etiqueta} mt-6`}>
        Total que pagó (S/), con envío si lo hubo
        <input
          name="total"
          inputMode="decimal"
          autoComplete="off"
          value={total}
          onChange={(e) => setTotalEscrito(e.target.value)}
          placeholder="0.00"
          className={campo}
        />
      </label>
      {totalEscrito !== null && totalEscrito !== totalCatalogo && totalCatalogo && (
        <button
          type="button"
          onClick={() => setTotalEscrito(null)}
          className="mt-1.5 text-xs text-neutral-light underline underline-offset-2 hover:text-accent"
        >
          Usar el precio de catálogo ({soles(Number(totalCatalogo))})
        </button>
      )}

      <fieldset className="mt-6">
        <legend className={etiqueta}>Cómo pagó</legend>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {FORMAS_DE_PAGO.map((f) => (
            <label key={f.valor} className="flex items-center gap-2 py-1 text-base text-white">
              <input
                type="radio"
                name="formaPago"
                value={f.valor}
                checked={formaPago === f.valor}
                onChange={() => setFormaPago(f.valor)}
                className="h-4 w-4 accent-accent"
              />
              {f.texto}
            </label>
          ))}
        </div>
      </fieldset>
      {formaPago === 'otro' && (
        <label className={`${etiqueta} mt-3`}>
          ¿Cuál? (opcional)
          <input name="formaPagoOtra" maxLength={40} autoComplete="off" className={campo} />
        </label>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={etiqueta}>
          De dónde llegó (opcional)
          <select name="origen" defaultValue="" className={campo}>
            <option value="">No lo sé</option>
            {ORIGENES_MANUALES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.texto}
              </option>
            ))}
          </select>
        </label>
        <label className={etiqueta}>
          Fecha de la venta
          <input name="fecha" type="date" defaultValue={hoy} max={hoy} required className={`${campo} [color-scheme:dark]`} />
        </label>
      </div>

      <label className={`${etiqueta} mt-4`}>
        Nota interna (opcional)
        <textarea
          name="nota"
          rows={2}
          maxLength={1000}
          placeholder="Color, talla, dirección de envío…"
          className={campo}
        />
      </label>

      <button
        type="submit"
        disabled={estado.tipo === 'enviando'}
        className="mt-6 block w-full rounded-lg bg-accent px-6 py-4 text-center text-lg font-bold text-dark transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {estado.tipo === 'enviando' ? 'Guardando…' : 'Registrar venta pagada'}
      </button>

      {estado.tipo === 'error' && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {estado.texto}
        </p>
      )}
      {estado.tipo === 'hecho' && (
        <p role="status" className="mt-3 text-sm text-white">
          Venta registrada: {estado.resumen}.{' '}
          <Link href={`/admin/orders/${estado.id}`} className="font-semibold text-accent underline underline-offset-2">
            Ver el pedido
          </Link>
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-neutral">
        Guarda solo lo que el cliente te dio para su pedido. El WhatsApp y el origen quedan en el panel, no en la web.
      </p>
    </form>
  )
}
