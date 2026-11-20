'use client'

// La Hoja de Reclamación del Libro de Reclamaciones virtual: el formulario y, al presentarla, la constancia.
// - Sin cuenta, sin captcha y sin pasos previos. Solo impiden presentarla el nombre, el documento, el domicilio o
//   el correo (basta uno) y el detalle. Lo demás no bloquea: un monto que no se entiende, un canal de respuesta sin
//   su dato o un correo mal escrito (si dejó domicilio) se avisan una vez junto al campo; si presenta igual, la hoja
//   va así (shared/lib/reclamo.ts).
// - La constancia es la hoja completa, la copia del consumidor: número, fecha y hora, plazo, proveedor, lo escrito
//   y las leyendas. Se imprime o se guarda en PDF (los estilos de impresión están en la página).

import Link from 'next/link'
import { useLayoutEffect, useRef, useState } from 'react'
import { whatsappVisible } from '@/shared/lib/empresa'
import { PLAZO_RECLAMO_DIAS_HABILES } from '@/shared/lib/plazos'
import {
  LIMITES,
  normalizarReclamo,
  respuestaPorTexto,
  revisarAvisos,
  revisarObligatorios,
  soles,
  TEXTOS_HOJA,
  textoDocumento,
  TIPOS_DOCUMENTO,
  type AvisoReclamo,
  type CampoReclamo,
  type Proveedor,
  type ReclamoValido,
} from '@/shared/lib/reclamo'

const CAMPO =
  'mt-2 block w-full rounded-lg border bg-dark px-4 py-3 text-base text-white placeholder:text-neutral focus:border-accent focus:outline-none'
const borde = (mal?: string) => (mal ? 'border-red-500' : 'border-dark-300')

/** Los errores que se muestran junto a un campo; los demás (trampa, hoja) van al aviso general */
const CAMPOS: readonly CampoReclamo[] = ['nombre', 'documentoTipo', 'documentoNumero', 'contacto', 'correo', 'detalle']

/** Los campos donde puede salir un aviso que no bloquea, en el orden de la hoja */
type CampoAviso = 'domicilio' | 'correo' | 'monto'
const ORDEN_AVISOS: readonly CampoAviso[] = ['domicilio', 'correo', 'monto']

type Errores = Partial<Record<CampoReclamo, string>>
type Avisos = Partial<Record<CampoAviso, string>>
type MotivoSinCopia = 'sin_correo' | 'correo_mal' | 'sin_config' | 'error'

interface Constancia {
  numero: string
  fechaTexto: string
  vence: string
  copia: boolean
  copiaMotivo: MotivoSinCopia | null
  hoja: ReclamoValido
}

/** Lo escrito, tal cual: el servidor lo limpia y lo revisa */
function leer(f: HTMLFormElement) {
  const d = new FormData(f)
  const t = (k: string) => String(d.get(k) ?? '')
  return {
    nombre: t('nombre'),
    documentoTipo: t('documentoTipo'),
    documentoNumero: t('documentoNumero'),
    domicilio: t('domicilio'),
    correo: t('correo'),
    telefono: t('telefono'),
    menor: d.get('menor') === 'si',
    apoderado: t('apoderado'),
    respuestaPor: t('respuestaPor'),
    bien: t('bien'),
    monto: t('monto'),
    descripcion: t('descripcion'),
    tipo: t('tipo'),
    detalle: t('detalle'),
    pedido: t('pedido'),
    trampa: t('lr_hp'),
  }
}
type Datos = ReturnType<typeof leer>

function mensaje(campo: CampoReclamo, d: Datos): string {
  switch (campo) {
    case 'nombre':
      return 'Escribe tu nombre y apellidos.'
    case 'documentoTipo':
      return 'Elige el tipo de documento.'
    case 'documentoNumero':
      return d.documentoTipo === 'DNI'
        ? 'Escribe tu DNI: son 8 dígitos.'
        : 'Escribe el número de tu documento: de 4 a 20 letras o números.'
    case 'contacto':
      return 'Escribe tu domicilio o tu correo. Basta con uno de los dos.'
    case 'correo':
      return 'Revisa tu correo, por ejemplo nombre@gmail.com.'
    case 'detalle':
      return 'Escribe el detalle de tu reclamo o queja.'
    default:
      return 'Revisa los datos de la hoja.'
  }
}

/** Lo que se avisa sin bloquear, y en qué campo */
const AVISOS: Readonly<Record<AvisoReclamo, [CampoAviso, string]>> = {
  monto: [
    'monto',
    'No entendemos ese monto. Escribe solo el número en soles, por ejemplo 59 o 59.90. Si lo dejas así, lo registramos tal como lo escribiste.',
  ],
  correo_mal: [
    'correo',
    'Tu correo parece mal escrito. Si lo dejas así, te respondemos por carta a tu domicilio y no te llega la copia por correo.',
  ],
  sin_correo: ['correo', 'No dejaste correo: si sigues, te respondemos por carta a tu domicilio.'],
  sin_domicilio: ['domicilio', 'No dejaste domicilio: si sigues, te respondemos por correo.'],
}

/** El campo que recibe el foco por cada error */
const idDe = (c: CampoReclamo) => `lr-${c === 'contacto' ? 'domicilio' : c}`

/** Los navegadores de Instagram, Facebook y TikTok: ahí window.print() no hace nada */
const enAppInterna = () =>
  typeof navigator !== 'undefined' && /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Bytedance/i.test(navigator.userAgent)

/** «escríbenos a hola@… o al WhatsApp 986 964 194» */
function Contacto({ proveedor: p }: { proveedor: Proveedor }) {
  const wa = p.whatsapp ? (
    <a href={`https://wa.me/51${p.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-accent underline">
      {whatsappVisible(p.whatsapp)}
    </a>
  ) : null
  if (p.correo && wa) {
    return (
      <>
        escríbenos a{' '}
        <a href={`mailto:${p.correo}`} className="text-accent underline">
          {p.correo}
        </a>{' '}
        o al WhatsApp {wa}
      </>
    )
  }
  if (p.correo) {
    return (
      <>
        escríbenos a{' '}
        <a href={`mailto:${p.correo}`} className="text-accent underline">
          {p.correo}
        </a>
      </>
    )
  }
  if (wa) return <>escríbenos al WhatsApp {wa}</>
  return <>vuelve a intentarlo más tarde</>
}

/** Una fila de datos, como las de /clase: el rótulo y el dato; en el celular, uno sobre otro */
function Fila({ t, v, primera, largo }: { t: string; v: React.ReactNode; primera?: boolean; largo?: boolean }) {
  const vacio = v === null || v === undefined || v === ''
  return (
    <div
      className={`lr-fila grid gap-1 px-5 py-3.5 sm:grid-cols-[13rem_1fr] sm:gap-4 ${primera ? '' : 'border-t border-dark-300'}`}
    >
      <dt className="text-sm text-neutral">{t}</dt>
      <dd className={`text-base ${largo ? 'whitespace-pre-line' : ''} ${vacio ? 'text-neutral' : 'text-white'} break-words`}>
        {vacio ? '—' : v}
      </dd>
    </div>
  )
}

const falta = <span className="text-neutral">Por confirmar</span>

/** Quién responde la hoja (y, en la constancia, su número, fecha y plazo) */
function Encabezado({
  proveedor: p,
  numero,
  fecha,
  vence,
}: {
  proveedor: Proveedor
  numero?: string
  fecha?: string
  vence?: string
}) {
  const dias = `${PLAZO_RECLAMO_DIAS_HABILES} días hábiles`
  return (
    <dl className="rounded-2xl border border-dark-300 bg-dark-100">
      <Fila primera t="N.º de hoja" v={numero ?? <span className="text-neutral">Se asigna al presentar</span>} />
      <Fila t="Fecha" v={fecha ?? <span className="text-neutral">Se registra al presentar</span>} />
      <Fila t="Plazo de respuesta" v={vence ? `Hasta el ${vence} (${dias})` : dias} />
      <Fila t="Proveedor (razón social)" v={p.razonSocial ?? falta} />
      <Fila t="RUC" v={p.ruc ?? falta} />
      <Fila t="Domicilio fiscal" v={p.domicilio ?? falta} />
      <Fila t="Nombre comercial" v={p.nombreComercial} />
      <Fila t="Sitio web" v={p.sitio.replace(/^https?:\/\//, '')} />
    </dl>
  )
}

function Leyendas() {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-neutral-light">
      {TEXTOS_HOJA.leyendas.map((t) => (
        <li key={t}>
          <span aria-hidden="true">* </span>
          {t}
        </li>
      ))}
    </ul>
  )
}

function Titulo({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-lg font-semibold text-white">
      {children}
    </h2>
  )
}

/** La hoja presentada, completa: la copia del consumidor */
function ConstanciaHoja({ c, proveedor }: { c: Constancia; proveedor: Proveedor }) {
  const h = c.hoja
  const enApp = enAppInterna()
  const monto = h.monto !== null ? soles(h.monto) : h.montoTexto
  const tipo = h.tipo === 'queja' ? 'queja' : 'reclamo'
  const guardala = enApp
    ? 'Toma una captura de pantalla para tenerla.'
    : 'Imprímela o guárdala en PDF para tenerla.'
  const copia = c.copia ? (
    <>
      Te enviamos una copia a <b className="break-all font-semibold text-white">{h.correo}</b>.
    </>
  ) : c.copiaMotivo === 'sin_correo' ? (
    `Como no dejaste correo, no te llega una copia. ${guardala}`
  ) : c.copiaMotivo === 'correo_mal' ? (
    `Tu correo parece mal escrito, así que no te enviamos la copia. ${guardala}`
  ) : c.copiaMotivo === 'sin_config' ? (
    `Por ahora no enviamos la copia por correo. ${guardala}`
  ) : (
    <>
      No pudimos enviarte la copia a <b className="break-all font-semibold text-white">{h.correo}</b>. {guardala}
    </>
  )

  return (
    <section id="lr-constancia" aria-labelledby="lr-constancia-titulo" className="mt-8">
      <div className="lr-no-imprimir">
        <h2
          id="lr-constancia-titulo"
          tabIndex={-1}
          className="font-heading text-4xl leading-none text-accent focus:outline-none sm:text-5xl"
        >
          {h.tipo === 'queja' ? 'Recibimos tu queja' : 'Recibimos tu reclamo'}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white">
          {c.vence
            ? `Te respondemos por escrito a más tardar el ${c.vence}, dentro del plazo de ${PLAZO_RECLAMO_DIAS_HABILES} días hábiles.`
            : `Te respondemos por escrito en un plazo máximo de ${PLAZO_RECLAMO_DIAS_HABILES} días hábiles.`}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-light">{copia}</p>
        {enApp ? (
          <p className="mt-3 text-sm leading-relaxed text-neutral-light">
            En el navegador de Instagram, Facebook o TikTok no se puede imprimir ni guardar en PDF.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-6 block w-full rounded-lg bg-accent px-6 py-3.5 text-center font-bold text-dark transition-colors hover:bg-accent-dark sm:w-auto"
          >
            Imprimir o guardar en PDF
          </button>
        )}
      </div>

      {/* Solo en papel: el título de la hoja */}
      <p className="hidden text-lg font-semibold print:block">
        Hoja de Reclamación N.º {c.numero} ({tipo})
      </p>

      <div className="mt-8 space-y-8 print:mt-4 print:space-y-5">
        <Encabezado proveedor={proveedor} numero={c.numero} fecha={c.fechaTexto || undefined} vence={c.vence || undefined} />

        <div>
          <Titulo>1. Identificación del consumidor reclamante</Titulo>
          <dl className="mt-3 rounded-2xl border border-dark-300 bg-dark-100">
            <Fila primera t="Nombre" v={h.nombre} />
            <Fila t="Documento" v={`${textoDocumento(h.documentoTipo)} ${h.documentoNumero}`} />
            <Fila t="Domicilio" v={h.domicilio} />
            <Fila t="Correo" v={h.correo && <span className="break-all">{h.correo}</span>} />
            <Fila t="Teléfono" v={h.telefono} />
            <Fila t="Menor de edad" v={h.menor ? 'Sí' : 'No'} />
            {h.menor && <Fila t="Padre, madre o apoderado" v={h.apoderado} />}
            <Fila t="Respuesta por" v={respuestaPorTexto(h)} />
          </dl>
        </div>

        <div>
          <Titulo>2. Identificación del bien contratado</Titulo>
          <dl className="mt-3 rounded-2xl border border-dark-300 bg-dark-100">
            <Fila primera t="Producto o servicio" v={h.bien === 'producto' ? 'Producto' : h.bien === 'servicio' ? 'Servicio' : null} />
            <Fila t="Monto reclamado" v={monto} />
            <Fila t="Descripción" v={h.descripcion} />
          </dl>
        </div>

        <div>
          <Titulo>3. Detalle de la reclamación y pedido del consumidor</Titulo>
          <dl className="mt-3 rounded-2xl border border-dark-300 bg-dark-100">
            <Fila primera t="Tipo" v={h.tipo === 'queja' ? 'Queja' : 'Reclamo'} />
            <Fila t="Detalle" v={h.detalle} largo />
            <Fila t="Pedido del consumidor" v={h.pedido} largo />
          </dl>
          <ul className="mt-3 space-y-1 text-sm leading-relaxed text-neutral-light">
            <li>
              <b className="font-semibold text-white">Reclamo:</b> {TEXTOS_HOJA.reclamo}
            </li>
            <li>
              <b className="font-semibold text-white">Queja:</b> {TEXTOS_HOJA.queja}
            </li>
          </ul>
          <p className="mt-3 text-sm text-neutral-light">Al presentar, confirmaste que deseas presentar este reclamo o queja.</p>
        </div>

        <div>
          <Titulo>4. Observaciones y acciones adoptadas por el proveedor</Titulo>
          <dl className="mt-3 rounded-2xl border border-dark-300 bg-dark-100">
            <Fila primera t="Observaciones" v={<span className="text-neutral">En blanco: la completamos al responder.</span>} />
            <Fila t="Fecha de comunicación de la respuesta" v={null} />
          </dl>
        </div>

        <Leyendas />
        <p className="text-sm font-semibold text-white">Copia para el consumidor</p>
      </div>

      <p className="lr-no-imprimir mt-8 text-sm text-neutral-light">
        <Link href="/" className="text-accent underline">
          Volver a la tienda
        </Link>
      </p>
    </section>
  )
}

/** Un grupo de opciones en filas con líneas finas, como las de /clase */
function Opciones({
  nombre,
  opciones,
  describe,
}: {
  nombre: string
  opciones: readonly { valor: string; texto: string; detalle?: string }[]
  describe?: string
}) {
  return (
    <div className="mt-2 rounded-xl border border-dark-300 bg-dark-100">
      {opciones.map((o, i) => (
        <label
          key={o.valor}
          className={`flex cursor-pointer items-start gap-3 px-4 py-3 ${i > 0 ? 'border-t border-dark-300' : ''}`}
        >
          <input
            type="radio"
            name={nombre}
            value={o.valor}
            aria-describedby={describe}
            className="mt-1 h-4 w-4 shrink-0 accent-accent"
          />
          <span className="text-base text-white">
            {o.texto}
            {o.detalle && <span className="block text-sm text-neutral">{o.detalle}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}

function Ayuda({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <span id={id} className="mt-1.5 block text-xs text-neutral">
      {children}
    </span>
  )
}

function ErrorCampo({ id, children }: { id: string; children?: string }) {
  if (!children) return null
  return (
    <span id={id} className="mt-1.5 block text-sm text-red-400">
      {children}
    </span>
  )
}

function Aviso({ id, children }: { id: string; children?: string }) {
  if (!children) return null
  return (
    <span id={id} className="mt-1.5 block text-sm text-accent">
      {children}
    </span>
  )
}

const describe = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(' ') || undefined

export default function HojaReclamacion({ proveedor }: { proveedor: Proveedor }) {
  const [errores, setErrores] = useState<Errores>({})
  const [avisos, setAvisos] = useState<Avisos>({})
  /** error: no se pudo registrar; muchas: llegaron demasiadas hojas desde esta conexión en la última hora (429) */
  const [falla, setFalla] = useState<'error' | 'muchas' | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [menor, setMenor] = useState(false)
  const [conDni, setConDni] = useState(true)
  const [constancia, setConstancia] = useState<Constancia | null>(null)
  /** Lo que recibe el foco después de pintar (el primer error, el primer aviso o la constancia) */
  const enfocar = useRef<string | null>(null)
  /** Lo escrito cuando se mostraron los avisos: si se presenta igual, sin cambiar nada, la hoja va así */
  const avisadoCon = useRef<string | null>(null)

  useLayoutEffect(() => {
    const id = enfocar.current
    if (!id) return
    enfocar.current = null
    const el = document.getElementById(id)
    el?.focus()
    if (id === 'lr-constancia-titulo') window.scrollTo({ top: 0 })
  })

  /** Cambió algo: el error o el aviso de ese campo (si había) ya no aplica */
  function alCambiar(e: React.FormEvent<HTMLFormElement>) {
    const n = (e.target as HTMLInputElement).name
    const campos =
      n === 'domicilio' || n === 'correo' || n === 'respuestaPor'
        ? ['domicilio', 'correo', 'contacto']
        : n === 'documentoTipo'
          ? [n, 'documentoNumero']
          : [n]
    if (campos.some((c) => errores[c as CampoReclamo])) {
      setErrores((antes) => Object.fromEntries(Object.entries(antes).filter(([c]) => !campos.includes(c))))
    }
    if (campos.some((c) => avisos[c as CampoAviso])) {
      setAvisos((antes) => Object.fromEntries(Object.entries(antes).filter(([c]) => !campos.includes(c))))
    }
  }

  async function presentar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (enviando) return
    const datos = leer(e.currentTarget)
    setFalla(null)

    const faltan = revisarObligatorios(datos)
    if (faltan.length) {
      setErrores(Object.fromEntries(faltan.map((c) => [c, mensaje(c, datos)])))
      setAvisos({})
      enfocar.current = idDe(faltan[0])
      return
    }
    setErrores({})

    // Lo que no bloquea se avisa una vez; si presenta igual, sin cambiar nada, la hoja va así
    const nuevos: Avisos = {}
    for (const a of revisarAvisos(datos)) {
      const [campo, texto] = AVISOS[a]
      nuevos[campo] ??= texto
    }
    const huella = JSON.stringify(datos)
    const primero = ORDEN_AVISOS.find((c) => nuevos[c])
    if (primero && avisadoCon.current !== huella) {
      avisadoCon.current = huella
      setAvisos(nuevos)
      enfocar.current = `lr-${primero}`
      return
    }

    setEnviando(true)
    try {
      const r = await fetch('/api/reclamo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })
      const respuesta = (await r.json().catch(() => ({}))) as Record<string, unknown>
      if (r.ok && typeof respuesta.numero === 'string') {
        const motivo = respuesta.copiaMotivo
        setConstancia({
          numero: respuesta.numero,
          fechaTexto: typeof respuesta.fechaTexto === 'string' ? respuesta.fechaTexto : '',
          vence: typeof respuesta.vence === 'string' ? respuesta.vence : '',
          copia: respuesta.copia === true,
          copiaMotivo:
            motivo === 'sin_correo' || motivo === 'correo_mal' || motivo === 'sin_config' || motivo === 'error' ? motivo : null,
          // La misma limpieza que hizo el servidor: la constancia muestra lo que quedó registrado
          hoja: normalizarReclamo(datos),
        })
        enfocar.current = 'lr-constancia-titulo'
        return
      }
      const campo = respuesta.campo as CampoReclamo | undefined
      if (r.status === 400 && campo && CAMPOS.includes(campo)) {
        setErrores({ [campo]: mensaje(campo, datos) })
        enfocar.current = idDe(campo)
      } else if (r.status === 413) {
        setErrores({ detalle: 'Tu hoja es muy larga. Acorta el detalle o el pedido y vuelve a presentarla.' })
        enfocar.current = idDe('detalle')
      } else {
        setFalla(r.status === 429 ? 'muchas' : 'error')
      }
    } catch {
      setFalla('error')
    } finally {
      setEnviando(false)
    }
  }

  if (constancia) return <ConstanciaHoja c={constancia} proveedor={proveedor} />

  const contactoError = errores.contacto ? 'lr-contacto-error' : undefined
  const hayAvisos = ORDEN_AVISOS.some((c) => avisos[c])

  return (
    <form
      aria-label="Hoja de reclamación"
      method="post"
      action="/api/reclamo"
      noValidate
      onSubmit={presentar}
      onChange={alCambiar}
      className="mt-8"
    >
      <Encabezado proveedor={proveedor} />
      <p className="mt-4 text-sm leading-relaxed text-neutral-light">
        Solo son obligatorios tu nombre, tu documento, tu domicilio o tu correo, y el detalle.
      </p>

      <section aria-labelledby="lr-s1" className="mt-8 border-t border-dark-300 pt-8">
        <Titulo id="lr-s1">1. Identificación del consumidor reclamante</Titulo>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm text-neutral-light sm:col-span-2">
            Nombre y apellidos <span className="text-neutral">(obligatorio)</span>
            <input
              id="lr-nombre"
              name="nombre"
              autoComplete="name"
              maxLength={LIMITES.nombre}
              aria-invalid={errores.nombre ? true : undefined}
              aria-describedby={describe(errores.nombre && 'lr-nombre-error')}
              className={`${CAMPO} ${borde(errores.nombre)}`}
            />
            <ErrorCampo id="lr-nombre-error">{errores.nombre}</ErrorCampo>
          </label>

          <label className="block text-sm text-neutral-light">
            Tipo de documento <span className="text-neutral">(obligatorio)</span>
            <select
              id="lr-documentoTipo"
              name="documentoTipo"
              defaultValue="DNI"
              onChange={(e) => setConDni(e.target.value === 'DNI')}
              aria-invalid={errores.documentoTipo ? true : undefined}
              aria-describedby={describe(errores.documentoTipo && 'lr-documentoTipo-error')}
              className={`${CAMPO} ${borde(errores.documentoTipo)}`}
            >
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.texto}
                </option>
              ))}
            </select>
            <ErrorCampo id="lr-documentoTipo-error">{errores.documentoTipo}</ErrorCampo>
          </label>

          <label className="block text-sm text-neutral-light">
            Número de documento <span className="text-neutral">(obligatorio)</span>
            <input
              id="lr-documentoNumero"
              name="documentoNumero"
              inputMode={conDni ? 'numeric' : 'text'}
              autoComplete="off"
              spellCheck={false}
              maxLength={LIMITES.documento + 4}
              aria-invalid={errores.documentoNumero ? true : undefined}
              aria-describedby={describe(errores.documentoNumero && 'lr-documentoNumero-error')}
              className={`${CAMPO} ${borde(errores.documentoNumero)}`}
            />
            <ErrorCampo id="lr-documentoNumero-error">{errores.documentoNumero}</ErrorCampo>
          </label>

          <label className="block text-sm text-neutral-light sm:col-span-2">
            Domicilio <span className="text-neutral">(domicilio o correo: al menos uno)</span>
            <input
              id="lr-domicilio"
              name="domicilio"
              autoComplete="street-address"
              maxLength={LIMITES.domicilio}
              aria-invalid={contactoError ? true : undefined}
              aria-describedby={describe(contactoError, avisos.domicilio && 'lr-domicilio-aviso')}
              className={`${CAMPO} ${borde(contactoError)}`}
            />
            <Aviso id="lr-domicilio-aviso">{avisos.domicilio}</Aviso>
          </label>

          {errores.contacto && (
            <p id="lr-contacto-error" className="-mt-2 text-sm text-red-400 sm:col-span-2">
              {errores.contacto}
            </p>
          )}

          <label className="block text-sm text-neutral-light">
            Correo <span className="text-neutral">(domicilio o correo: al menos uno)</span>
            <input
              id="lr-correo"
              name="correo"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={LIMITES.correo}
              placeholder="Ej.: tucorreo@gmail.com"
              aria-invalid={errores.correo || contactoError ? true : undefined}
              aria-describedby={describe(
                errores.correo && 'lr-correo-error',
                contactoError,
                avisos.correo && 'lr-correo-aviso',
              )}
              className={`${CAMPO} ${borde(errores.correo || contactoError)}`}
            />
            <ErrorCampo id="lr-correo-error">{errores.correo}</ErrorCampo>
            <Aviso id="lr-correo-aviso">{avisos.correo}</Aviso>
          </label>

          <label className="block text-sm text-neutral-light">
            Teléfono
            <input
              id="lr-telefono"
              name="telefono"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={LIMITES.telefono}
              placeholder="Ej.: 987 654 321"
              className={`${CAMPO} ${borde()}`}
            />
          </label>

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-3 text-base text-white">
              <input
                type="checkbox"
                name="menor"
                value="si"
                checked={menor}
                onChange={(e) => setMenor(e.target.checked)}
                className="h-4 w-4 shrink-0 accent-accent"
              />
              Soy menor de edad
            </label>
            <label className={menor ? 'mt-4 block text-sm text-neutral-light' : 'hidden'}>
              Nombre del padre, madre o apoderado
              <input
                id="lr-apoderado"
                name="apoderado"
                autoComplete="off"
                maxLength={LIMITES.nombre}
                className={`${CAMPO} ${borde()}`}
              />
            </label>
          </div>

          <fieldset className="sm:col-span-2">
            <legend className="text-sm text-neutral-light">¿Cómo quieres recibir la respuesta?</legend>
            <Opciones
              nombre="respuestaPor"
              describe="lr-respuesta-ayuda"
              opciones={[
                { valor: 'correo', texto: 'Por correo' },
                { valor: 'domicilio', texto: 'Por carta a mi domicilio' },
              ]}
            />
            <Ayuda id="lr-respuesta-ayuda">Si no eliges, te respondemos por correo o, si no lo dejaste, por carta.</Ayuda>
          </fieldset>
        </div>
      </section>

      <section aria-labelledby="lr-s2" className="mt-10 border-t border-dark-300 pt-8">
        <Titulo id="lr-s2">2. Identificación del bien contratado</Titulo>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <fieldset className="sm:col-span-2">
            <legend className="text-sm text-neutral-light">¿Es un producto o un servicio?</legend>
            <Opciones
              nombre="bien"
              opciones={[
                { valor: 'producto', texto: 'Producto', detalle: 'Guantes, vendas, cuerda u otro artículo de la tienda' },
                { valor: 'servicio', texto: 'Servicio', detalle: 'Una clase virtual o una clase 1 a 1' },
              ]}
            />
          </fieldset>

          <label className="block text-sm text-neutral-light">
            Monto reclamado (S/) <span className="text-neutral">(opcional)</span>
            <input
              id="lr-monto"
              name="monto"
              inputMode="decimal"
              autoComplete="off"
              maxLength={LIMITES.monto}
              placeholder="Ej.: 50.00"
              aria-describedby={describe(avisos.monto && 'lr-monto-aviso')}
              className={`${CAMPO} ${borde()}`}
            />
            <Aviso id="lr-monto-aviso">{avisos.monto}</Aviso>
          </label>

          <label className="block text-sm text-neutral-light sm:col-span-2">
            Descripción
            <input
              id="lr-descripcion"
              name="descripcion"
              maxLength={LIMITES.descripcion}
              aria-describedby="lr-descripcion-ayuda"
              className={`${CAMPO} ${borde()}`}
            />
            <Ayuda id="lr-descripcion-ayuda">
              Por ejemplo: guantes de boxeo de 12 oz, la clase virtual del 28 de noviembre o una clase 1 a 1.
            </Ayuda>
          </label>
        </div>
      </section>

      <section aria-labelledby="lr-s3" className="mt-10 border-t border-dark-300 pt-8">
        <Titulo id="lr-s3">3. Detalle de la reclamación y pedido del consumidor</Titulo>
        <div className="mt-5 grid gap-5">
          <fieldset>
            <legend className="text-sm text-neutral-light">¿Es un reclamo o una queja?</legend>
            <Opciones
              nombre="tipo"
              describe="lr-tipo-ayuda"
              opciones={[
                { valor: 'reclamo', texto: 'Reclamo', detalle: TEXTOS_HOJA.reclamo },
                { valor: 'queja', texto: 'Queja', detalle: TEXTOS_HOJA.queja },
              ]}
            />
            <Ayuda id="lr-tipo-ayuda">Si no eliges, la registramos como reclamo.</Ayuda>
          </fieldset>

          <label className="block text-sm text-neutral-light">
            Detalle del reclamo o queja <span className="text-neutral">(obligatorio)</span>
            <textarea
              id="lr-detalle"
              name="detalle"
              rows={6}
              maxLength={LIMITES.detalle}
              aria-invalid={errores.detalle ? true : undefined}
              aria-describedby={describe('lr-detalle-ayuda', errores.detalle && 'lr-detalle-error')}
              className={`${CAMPO} ${borde(errores.detalle)}`}
            />
            <Ayuda id="lr-detalle-ayuda">Cuéntanos qué pasó, con fechas si las tienes.</Ayuda>
            <ErrorCampo id="lr-detalle-error">{errores.detalle}</ErrorCampo>
          </label>

          <label className="block text-sm text-neutral-light">
            Pedido del consumidor
            <textarea
              id="lr-pedido"
              name="pedido"
              rows={3}
              maxLength={LIMITES.pedido}
              aria-describedby="lr-pedido-ayuda"
              className={`${CAMPO} ${borde()}`}
            />
            <Ayuda id="lr-pedido-ayuda">Lo que quieres que hagamos para solucionarlo.</Ayuda>
          </label>
        </div>
      </section>

      <div className="mt-10 space-y-5 border-t border-dark-300 pt-8">
        <Leyendas />
        <p className="text-sm leading-relaxed text-neutral">
          Usamos tus datos solo para atender tu reclamo o queja, como manda la ley, y los guardamos al menos 2 años. Se
          guardan en Supabase y la copia sale por correo con Resend (EE.&nbsp;UU.).{' '}
          <Link href="/privacidad" className="text-accent underline">
            Política de privacidad
          </Link>
        </p>

        <div id="lr-enviar">
          <p className="text-sm text-neutral-light">{TEXTOS_HOJA.confirmacion}</p>
          {hayAvisos && (
            <p className="mt-3 text-sm text-accent">Revisa los avisos de arriba. Si está bien así, vuelve a presentar la hoja.</p>
          )}
          {/* aria-disabled y no disabled: un botón deshabilitado pierde el foco y el lector no oye el resultado */}
          <button
            type="submit"
            aria-disabled={enviando || undefined}
            className={`mt-5 block w-full rounded-lg bg-accent px-6 py-4 text-center text-lg font-bold text-dark transition-colors hover:bg-accent-dark ${
              enviando ? 'opacity-60' : ''
            }`}
          >
            {enviando ? 'Presentando tu hoja…' : 'Presentar hoja de reclamación'}
          </button>
          <p role="alert" className="mt-3 text-sm text-red-400">
            {falla === 'muchas' && (
              <>
                No pudimos registrar tu hoja: desde tu conexión ya se presentaron varias hojas en la última hora. Vuelve a
                intentarlo en una hora o, si no puedes esperar, <Contacto proveedor={proveedor} /> y te ayudamos a presentarla.
              </>
            )}
            {falla === 'error' && (
              <>
                No pudimos registrar tu hoja. Vuelve a intentarlo en unos minutos. Si sigue sin funcionar,{' '}
                <Contacto proveedor={proveedor} />.
              </>
            )}
          </p>
        </div>
        <p className="text-sm leading-relaxed text-neutral-light">
          Si el formulario no funciona, <Contacto proveedor={proveedor} />.
        </p>
      </div>

      {/* Campo trampa: las personas no lo ven ni llegan con el teclado; si viene lleno, lo llenó un programa */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="lr-hp">No llenes este campo</label>
        <input id="lr-hp" name="lr_hp" tabIndex={-1} autoComplete="off" />
      </div>
    </form>
  )
}

export { Contacto }
