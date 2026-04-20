'use client'

import { useCallback, useEffect, useState } from 'react'
import type { DigitalGift, DigitalGiftType } from '@/shared/types/digital-gifts'

function typeLabel(t: DigitalGiftType) {
  if (t === 'pdf') return 'PDF'
  if (t === 'video') return 'Video'
  return 'Enlace'
}

type FormState = {
  name: string
  giftType: DigitalGiftType
  description: string
  contentUrl: string
  active: boolean
}

const emptyForm: FormState = {
  name: '',
  giftType: 'link',
  description: '',
  contentUrl: '',
  active: true,
}

export default function DigitalGiftsAdminClient() {
  const [gifts, setGifts] = useState<DigitalGift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/digital-gifts?all=1', { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'Error al cargar')
      setGifts([])
    } else {
      setGifts(data.gifts as DigitalGift[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
  }

  function startEdit(g: DigitalGift) {
    setEditingId(g.id)
    setForm({
      name: g.name,
      giftType: g.giftType,
      description: g.description,
      contentUrl: g.contentUrl,
      active: g.active,
    })
  }

  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload-digital-gift', { method: 'POST', body: fd })
    const data = await res.json().catch(() => ({}))
    setUploading(false)
    if (!res.ok) {
      setError(data.error || 'Error al subir')
      return
    }
    setForm((f) => ({ ...f, contentUrl: data.url as string }))
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const isEdit = !!editingId
    const res = await fetch(isEdit ? `/api/admin/digital-gifts/${editingId}` : '/api/admin/digital-gifts', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        giftType: form.giftType,
        description: form.description.trim(),
        contentUrl: form.contentUrl.trim(),
        active: form.active,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'No se pudo guardar')
      return
    }
    startCreate()
    void load()
  }

  async function deactivate(id: string) {
    if (!confirm('¿Desactivar este regalo? (se ocultará de envíos nuevos si está inactivo)')) return
    setSaving(true)
    await fetch(`/api/admin/digital-gifts/${id}`, { method: 'DELETE' })
    setSaving(false)
    if (editingId === id) startCreate()
    void load()
  }

  if (loading) return <p className="text-sm text-neutral">Cargando…</p>

  return (
    <div className="space-y-8">
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <article className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">{editingId ? 'Editar regalo' : 'Nuevo regalo'}</h2>
          {editingId ? (
            <button type="button" onClick={startCreate} className="text-sm text-accent hover:underline">
              Cancelar edición
            </button>
          ) : null}
        </div>
        <form onSubmit={(ev) => void submitForm(ev)} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-neutral sm:col-span-2">
            Nombre
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-neutral">
            Tipo
            <select
              value={form.giftType}
              onChange={(e) => setForm((f) => ({ ...f, giftType: e.target.value as DigitalGiftType }))}
              className="mt-1 w-full rounded-lg border border-dark-300 bg-dark px-2 py-2 text-sm text-white"
            >
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="link">Enlace externo</option>
            </select>
          </label>
          <label className="flex items-end gap-2 pb-0.5 text-xs text-neutral">
            <span className="flex cursor-pointer items-center gap-2 rounded-lg border border-dark-300 bg-dark px-3 py-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              />
              Activo
            </span>
          </label>
          <label className="block text-xs text-neutral sm:col-span-2">
            Descripción corta
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-neutral sm:col-span-2">
            URL o archivo (público)
            <input
              required
              value={form.contentUrl}
              onChange={(e) => setForm((f) => ({ ...f, contentUrl: e.target.value }))}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-dark-300 bg-dark px-3 py-2 font-mono text-xs text-white"
            />
          </label>
          {form.giftType !== 'link' ? (
            <div className="sm:col-span-2">
              <p className="text-xs text-neutral">Subir {form.giftType === 'pdf' ? 'PDF' : 'video'} (máx. 40MB)</p>
              <input
                type="file"
                accept={form.giftType === 'pdf' ? '.pdf,application/pdf' : 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'}
                disabled={uploading || saving}
                onChange={(e) => void onUploadFile(e)}
                className="mt-1 text-sm text-neutral-light file:mr-2 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-dark"
              />
              {uploading ? <span className="ml-2 text-xs text-accent">Subiendo…</span> : null}
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-dark disabled:opacity-50"
            >
              {editingId ? 'Guardar cambios' : 'Crear regalo'}
            </button>
          </div>
        </form>
      </article>

      <article className="card overflow-x-auto">
        <h2 className="mb-4 text-lg font-semibold text-white">Catálogo</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-dark-300 text-xs text-neutral">
            <tr>
              <th className="py-2 pr-2">Nombre</th>
              <th className="py-2 pr-2">Tipo</th>
              <th className="py-2 pr-2">Estado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gifts.map((g) => (
              <tr key={g.id} className="border-b border-dark-300/40">
                <td className="py-2 pr-2">
                  <p className="font-medium text-white">{g.name}</p>
                  {g.description ? <p className="text-xs text-neutral">{g.description}</p> : null}
                  <a href={g.contentUrl} target="_blank" rel="noreferrer" className="break-all text-xs text-accent hover:underline">
                    {g.contentUrl}
                  </a>
                </td>
                <td className="py-2 pr-2 text-neutral-light">{typeLabel(g.giftType)}</td>
                <td className="py-2 pr-2">
                  <span className={g.active ? 'text-emerald-300' : 'text-amber-200'}>{g.active ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEdit(g)} className="text-xs text-accent hover:underline">
                      Editar
                    </button>
                    {g.active ? (
                      <button type="button" onClick={() => void deactivate(g.id)} className="text-xs text-neutral-light hover:underline">
                        Desactivar
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gifts.length === 0 ? <p className="py-4 text-sm text-neutral">No hay regalos todavía.</p> : null}
      </article>
    </div>
  )
}
