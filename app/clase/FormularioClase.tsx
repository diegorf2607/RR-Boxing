'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { CLASE } from '@/shared/lib/clase-virtual'
import { RUTAS } from '@/shared/legal/politicas'
import AvisoDatos from '@/components/AvisoDatos'
import { leerOrigen } from '@/shared/lib/origen'
import { enlaceWhatsapp, WHATSAPP_LEGIBLE } from '@/shared/lib/whatsapp'

type Estado = 'listo' | 'enviando' | 'error' | 'inscrito'
type Campo = 'nombre' | 'correo' | 'whatsapp'
const CAMPOS: readonly string[] = ['nombre', 'correo', 'whatsapp']

// El texto de ejemplo va en neutral (7,8:1 sobre el fondo) y empieza con «Ej.:» para que no parezca ya escrito
const campo =
  'mt-2 block w-full rounded-lg border border-dark-300 bg-dark px-4 py-3 text-base text-white placeholder:text-neutral focus:border-accent focus:outline-none aria-[invalid=true]:border-red-500'

const conPunto = (texto: string) => (texto.endsWith('.') ? texto : `${texto}.`)

export default function FormularioClase() {
  const [estado, setEstado] = useState<Estado>('listo')
  const [mensaje, setMensaje] = useState('')
  /** El campo que la API marcó como mal (el mensaje va junto a él) */
  const [campoError, setCampoError] = useState<Campo | null>(null)
  const [nombre, setNombre] = useState('')
  const formulario = useRef<HTMLFormElement>(null)

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    setEstado('enviando')
    setMensaje('')
    setCampoError(null)

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
      const json = (await respuesta.json().catch(() => ({}))) as { error?: string; campo?: string }
      const marcado = json.campo && CAMPOS.includes(json.campo) ? (json.campo as Campo) : null
      setMensaje(json.error ?? 'No pudimos guardar tus datos')
      setCampoError(marcado)
      setEstado(respuesta.status === 400 ? 'listo' : 'error')
      if (marcado) formulario.current?.querySelector<HTMLElement>(`[name="${marcado}"]`)?.focus()
    } catch {
      setMensaje('No pudimos guardar tus datos')
      setEstado('error')
    }
  }

  if (estado === 'inscrito') {
    // Ya está inscrito: el «hola» solo sirve para que el link le llegue (el lugar no depende de este mensaje)
    const saludar = enlaceWhatsapp(
      `Hola, RR Boxing. Me inscribí a la clase virtual gratis del ${CLASE.dia.toLowerCase()}.`
    )
    return (
      <div className="mt-8 rounded-2xl border border-dark-300 bg-dark-100 p-5" role="status">
        <p className="text-lg font-semibold text-white">{nombre ? `Listo, ${nombre}: ya estás inscrito.` : 'Listo: ya estás inscrito.'}</p>
        <p className="mt-2 text-base leading-relaxed text-neutral-light">
          La clase es gratis. Antes del sábado te mandamos el link para entrar por WhatsApp. Escríbenos un hola al{' '}
          <span className="whitespace-nowrap text-white">{WHATSAPP_LEGIBLE}</span> para que te llegue sin
          problemas.
        </p>
        <a href={saludar} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5">
          Escribir a RR Boxing
        </a>
      </div>
    )
  }

  const invalido = (n: Campo) => (campoError === n ? true : undefined)
  const describe = (n: Campo) => (campoError === n ? `clase-error-${n}` : undefined)
  /** Junto al campo: el mensaje del error, enlazado con aria-describedby */
  const errorDe = (n: Campo) =>
    campoError === n && mensaje ? (
      <span id={`clase-error-${n}`} className="mt-1.5 block text-sm text-red-400">
        {conPunto(mensaje)}
      </span>
    ) : null
  /** Al corregir el campo con error, el mensaje ya no aplica */
  const alEscribir = (evento: React.FormEvent<HTMLFormElement>) => {
    const n = (evento.target as HTMLInputElement).name
    if (campoError && n === campoError) {
      setCampoError(null)
      setMensaje('')
    }
  }

  return (
    <form ref={formulario} onSubmit={enviar} onInput={alEscribir} className="mt-8">
      <p className="text-base leading-relaxed">
        Déjanos tu nombre, tu correo y tu WhatsApp para mandarte el link de la clase.
      </p>

      <label className="mt-5 block text-sm text-neutral-light">
        Nombre y apellido
        <input
          name="nombre"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          aria-invalid={invalido('nombre')}
          aria-describedby={describe('nombre')}
          className={campo}
        />
      </label>
      {errorDe('nombre')}

      <label className="mt-4 block text-sm text-neutral-light">
        Correo
        <input
          name="correo"
          type="email"
          inputMode="email"
          required
          maxLength={120}
          autoComplete="email"
          placeholder="Ej.: tucorreo@gmail.com"
          aria-invalid={invalido('correo')}
          aria-describedby={describe('correo')}
          className={campo}
        />
      </label>
      {errorDe('correo')}

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
          placeholder="Ej.: 987 654 321"
          aria-invalid={invalido('whatsapp')}
          aria-describedby={describe('whatsapp')}
          className={campo}
        />
        <span className="mt-1.5 block text-xs text-neutral">Si no eres de Perú, ponlo con el código de tu país.</span>
      </label>
      {errorDe('whatsapp')}

      <input name="sitio" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {/* Los errores sin campo van aquí, a la vista del botón; los de un campo, junto a él */}
      {mensaje && !campoError && (
        <p role="alert" className="mt-6 text-sm text-red-400">
          {conPunto(mensaje)}
          {estado === 'error' && (
            <>
              {' '}
              Escríbenos al WhatsApp {CLASE.whatsappLegible} y te inscribimos por ahí.
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={estado === 'enviando'}
        className={`btn-primary ${mensaje && !campoError ? 'mt-3' : 'mt-6'}`}
      >
        {estado === 'enviando' ? 'Un momento…' : 'Inscribirme gratis'}
      </button>

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
