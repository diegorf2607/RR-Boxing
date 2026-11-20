'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CLASE } from '@/shared/lib/clase-virtual'
import { RUTAS } from '@/shared/legal/politicas'
import AvisoDatos from '@/components/AvisoDatos'
import { leerOrigen } from '@/shared/lib/origen'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

type Estado = 'listo' | 'enviando' | 'error' | 'inscrito'

const campo =
  'mt-2 block w-full rounded-lg border border-dark-300 bg-dark px-4 py-3 text-base text-white placeholder:text-neutral-dark focus:border-accent focus:outline-none'

export default function FormularioClase() {
  const [estado, setEstado] = useState<Estado>('listo')
  const [mensaje, setMensaje] = useState('')
  const [nombre, setNombre] = useState('')

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
          origen: leerOrigen(),
        }),
      })
      if (respuesta.ok) {
        setNombre(String(datos.get('nombre') ?? '').trim().split(/\s+/)[0] ?? '')
        setEstado('inscrito')
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

  if (estado === 'inscrito') {
    const confirmar = enlaceWhatsapp(
      `Hola, RR Boxing. Me inscribí a la clase virtual gratis del ${CLASE.dia.toLowerCase()}. Quiero confirmar mi lugar.`
    )
    return (
      <div className="mt-8 rounded-2xl border border-dark-300 bg-dark-100 p-5" role="status">
        <p className="text-lg font-semibold text-white">{nombre ? `Listo, ${nombre}: ya estás inscrito.` : 'Listo: ya estás inscrito.'}</p>
        <p className="mt-2 text-base leading-relaxed text-neutral-light">
          La clase es gratis. Antes del sábado te mandamos el link para entrar por WhatsApp. Si quieres, escríbenos para
          confirmar tu lugar.
        </p>
        <a
          href={confirmar}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block rounded-lg bg-accent px-6 py-3.5 text-center font-bold text-dark transition-colors hover:bg-accent-dark"
        >
          Confirmar por WhatsApp
        </a>
      </div>
    )
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
        {estado === 'enviando' ? 'Un momento…' : 'Inscribirme gratis'}
      </button>

      {mensaje && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {mensaje.endsWith('.') ? mensaje : `${mensaje}.`}
          {estado === 'error' && (
            <>
              {' '}
              Escríbenos al WhatsApp {CLASE.whatsappLegible} y te inscribimos por ahí.
            </>
          )}
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-neutral">
        La clase es gratis. Puedes entrar desde cualquier país.
      </p>

      <AvisoDatos para="mandarte el link de la clase y avisarte si algo cambia" className="mt-3" />
      <p className="mt-2 text-xs leading-relaxed text-neutral">
        <Link
          href={`${RUTAS.terminos}#clases`}
          className="text-neutral-light underline underline-offset-2 hover:text-accent"
        >
          Condiciones de la clase
        </Link>
      </p>
    </form>
  )
}
