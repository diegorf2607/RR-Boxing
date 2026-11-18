'use client'

import { useState } from 'react'
import { CLASE } from '@/shared/lib/clase-virtual'

type Estado = 'listo' | 'enviando' | 'error'

const campo =
  'mt-2 block w-full rounded-lg border border-dark-300 bg-dark px-4 py-3 text-base text-white placeholder:text-neutral-dark focus:border-accent focus:outline-none'

export default function FormularioClase() {
  const [estado, setEstado] = useState<Estado>('listo')
  const [mensaje, setMensaje] = useState('')

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    setEstado('enviando')
    setMensaje('')

    try {
      const respuesta = await fetch('/api/clase/inscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: String(datos.get('nombre') ?? ''),
          correo: String(datos.get('correo') ?? ''),
          whatsapp: String(datos.get('whatsapp') ?? ''),
          sitio: String(datos.get('sitio') ?? ''),
        }),
      })
      if (respuesta.ok) {
        window.location.href = CLASE.pagoUrl
        return
      }
      const json = (await respuesta.json().catch(() => ({}))) as { error?: string }
      setMensaje(json.error ?? 'No pudimos guardar tus datos')
      setEstado(respuesta.status === 400 ? 'listo' : 'error')
    } catch {
      setMensaje('No pudimos guardar tus datos')
      setEstado('error')
    }
  }

  return (
    <form onSubmit={enviar} className="mt-8">
      <p className="text-base leading-relaxed">
        Déjanos tu nombre, tu correo y tu WhatsApp para mandarte el link de la clase.
      </p>

      <label className="mt-5 block text-sm text-neutral-light">
        Nombre y apellido
        <input name="nombre" required minLength={2} maxLength={80} autoComplete="name" className={campo} />
      </label>

      <label className="mt-4 block text-sm text-neutral-light">
        Correo
        <input
          name="correo"
          type="email"
          inputMode="email"
          required
          maxLength={120}
          autoComplete="email"
          placeholder="tucorreo@gmail.com"
          className={campo}
        />
      </label>

      <label className="mt-4 block text-sm text-neutral-light">
        WhatsApp
        <input
          name="whatsapp"
          type="tel"
          inputMode="tel"
          required
          minLength={6}
          maxLength={30}
          autoComplete="tel"
          placeholder="987 654 321"
          className={campo}
        />
        <span className="mt-1.5 block text-xs text-neutral">Si no eres de Perú, ponlo con el código de tu país.</span>
      </label>

      <input name="sitio" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="mt-6 block w-full rounded-lg bg-accent px-6 py-4 text-center text-lg font-bold text-dark transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Un momento…' : 'Continuar al pago · S/ 30'}
      </button>

      {mensaje && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {mensaje}.
          {estado === 'error' && (
            <>
              {' '}
              Escríbenos al WhatsApp {CLASE.whatsappLegible} o{' '}
              <a href={CLASE.pagoUrl} className="font-semibold text-accent underline">
                paga aquí
              </a>{' '}
              y mándanos tu comprobante.
            </>
          )}
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-neutral">
        Pagas con Mercado Pago. Si estás fuera del Perú, pagas con tu tarjeta y tu banco hace el cambio.
      </p>
    </form>
  )
}
