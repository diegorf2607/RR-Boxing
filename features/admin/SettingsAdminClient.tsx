'use client'

import { useEffect, useState } from 'react'
import type { StoreSettings } from '@/shared/types/admin'

export default function SettingsAdminClient() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' })
      const data = await res.json()
      setSettings(data.settings ?? null)
      setLoading(false)
    })()
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeName: settings.storeName,
        defaultCurrencyDisplay: settings.defaultCurrencyDisplay,
        lowStockThreshold: settings.lowStockThreshold,
        supportContactText: settings.supportContactText,
        checkoutHelperText: settings.checkoutHelperText,
        storeEnabled: settings.storeEnabled,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setMessage(data.error || 'Error al guardar')
      return
    }
    setSettings(data.settings)
    setMessage('Guardado correctamente.')
  }

  if (loading || !settings) return <p className="text-sm text-neutral">Cargando…</p>

  return (
    <div className="space-y-8">
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold text-white">Variables de entorno (referencia)</h2>
        <p className="text-sm text-neutral-light">
          Los secretos (Stripe, Supabase service role, etc.) no se editan desde aquí; siguen en el entorno del hosting.
        </p>
        <ul className="list-inside list-disc text-sm text-neutral-light">
          <li>STRIPE_SECRET_KEY</li>
          <li>STRIPE_WEBHOOK_SECRET</li>
          <li>NEXT_PUBLIC_APP_URL</li>
          <li>Variables NEXT_PUBLIC_SUPABASE_* y SUPABASE_SERVICE_ROLE_KEY</li>
        </ul>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">Configuración operativa</h2>
        <p className="text-xs text-neutral">Se guarda en la tabla store_settings (Supabase).</p>

        <label className="block text-sm">
          <span className="text-neutral-light">Nombre de tienda</span>
          <input
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            className="mt-1 w-full max-w-md rounded-lg border border-dark-300 bg-dark px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-neutral-light">Moneda mostrada por defecto (código)</span>
          <input
            value={settings.defaultCurrencyDisplay}
            onChange={(e) => setSettings({ ...settings, defaultCurrencyDisplay: e.target.value.toUpperCase() })}
            className="mt-1 w-full max-w-xs rounded-lg border border-dark-300 bg-dark px-3 py-2 font-mono text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="text-neutral-light">Umbral stock bajo (unidades)</span>
          <input
            type="number"
            min={0}
            max={99999}
            value={settings.lowStockThreshold}
            onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
            className="mt-1 w-full max-w-xs rounded-lg border border-dark-300 bg-dark px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-neutral-light">Contacto / soporte interno (texto libre)</span>
          <textarea
            value={settings.supportContactText}
            onChange={(e) => setSettings({ ...settings, supportContactText: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
            placeholder="Ej. WhatsApp interno, horario de atención…"
          />
        </label>

        <label className="block text-sm">
          <span className="text-neutral-light">Texto ayuda checkout (referencia para el equipo)</span>
          <textarea
            value={settings.checkoutHelperText}
            onChange={(e) => setSettings({ ...settings, checkoutHelperText: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm"
            placeholder="Mensajes que quieras coordinar con el front público más adelante…"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-light">
          <input
            type="checkbox"
            checked={settings.storeEnabled}
            onChange={(e) => setSettings({ ...settings, storeEnabled: e.target.checked })}
          />
          Tienda habilitada (bandera interna; el checkout puede leer este valor en una siguiente iteración)
        </label>

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>
        )}

        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-dark disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  )
}
