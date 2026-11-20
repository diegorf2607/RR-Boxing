// POST /api/pedido: el pedido de /checkout (shared/lib/cart-checkout.ts calcula, shared/lib/pedido-datos.ts guarda).
// - Revisa los datos (zod), recalcula precios, colores, stock y combo en el servidor desde la base (nunca confía en
//   montos del navegador) y crea el pedido: status pending, payment_status unpaid, payment_method whatsapp o
//   mercadopago. Los datos sin columna (WhatsApp, DNI, entrega, envío, colores, origen) van a pedido_datos.
// - Deja un aviso new_order en el panel y, si Resend está configurado, manda la confirmación al cliente y el aviso
//   a CONTACTO_CORREO (si llegan más de 30 pedidos en una hora entre todos, no salen más correos al cliente).
// - Con pago «mercadopago» y MERCADOPAGO_ACCESS_TOKEN, crea el cobro y responde `pagar` (la página de Mercado Pago).
//   Sin token, o si Mercado Pago falla, el pedido queda «por WhatsApp» y se responde igual.
// - Campo trampa invisible («sitio»), tope de 16 KB para el cuerpo y 8 pedidos por hora desde una misma conexión
//   (se guarda una huella de la IP con sal, no la IP). Si el conteo falla, no se bloquea a nadie.
// Responde { numero, formaPago, pagar, whatsapp, resumen } o { error, campo } (400), 413, 415, 429, 500.
// En los registros va solo el número del pedido: nada de datos personales.
import { createHash, randomInt } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { Order } from '@/shared/types/commerce'
import { appendOrder, insertAdminNotification, updateOrder } from '@/shared/lib/data-store'
import { calcularPedido, checkoutShippingMethodSchema, lineaPedidoSchema, type PedidoCalculado } from '@/shared/lib/cart-checkout'
import { normalizarWhatsapp, whatsappLegible } from '@/shared/lib/clase-virtual'
import { limpiarOrigen, origenTexto } from '@/shared/lib/origen'
import {
  FORMA_PAGO_TEXTO,
  guardarPedidoDatos,
  mensajeWhatsappPedido,
  pedidosUltimaHora,
  resumenTexto,
  type FormaPago,
  type PedidoDatos,
} from '@/shared/lib/pedido-datos'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'
import { correoListo, enviarCorreo } from '@/shared/lib/correo'
import { empresa } from '@/shared/lib/empresa'
import { crearPreferencia, mercadoPagoListo } from '@/shared/lib/mercadopago'
import { formatCurrency } from '@/shared/lib/country'
import { MAX_UNIDADES_LINEA } from '@/features/cart/lineas'

const MAX_BYTES = 16_000
/** Pedidos por hora desde una misma conexión */
const MAX_POR_CONEXION = 8
/** Si entre todos llegan más pedidos que esto en una hora, no salen más correos al cliente */
const MAX_CORREOS_HORA = 30

/** Una sola línea: sin saltos ni caracteres de control (no llegan al asunto ni al cuerpo de los correos). */
const unaLinea = (s: string) => s.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
/** Sin enlaces: así nadie usa el correo de confirmación de RR Boxing para mandar enlaces a terceros. */
const sinEnlaces = (s: string) => !/(https?:\/\/|www\.)/i.test(s)

const schema = z.object({
  nombre: z.string().trim().min(2).max(80).transform(unaLinea).refine(sinEnlaces),
  correo: z.string().trim().toLowerCase().email().max(120),
  whatsapp: z.string().trim().min(6).max(30),
  dni: z.string().trim().max(20).optional(),
  distrito: z.string().trim().min(2).max(80).transform(unaLinea).refine(sinEnlaces),
  direccion: z.string().trim().min(5).max(200).transform(unaLinea).refine(sinEnlaces),
  referencia: z.string().trim().max(200).transform(unaLinea).refine(sinEnlaces).optional(),
  envio: checkoutShippingMethodSchema,
  pago: z.enum(['whatsapp', 'mercadopago']).optional().default('whatsapp'),
  items: z.array(lineaPedidoSchema).min(1).max(30),
  origen: z.unknown().optional(),
  // Campo trampa: las personas no lo ven; si viene lleno, es un bot.
  sitio: z.string().max(200).optional(),
})

const MENSAJES: Record<string, string> = {
  nombre: 'Escribe tu nombre y apellido.',
  correo: 'Revisa tu correo.',
  whatsapp: 'Revisa tu número de WhatsApp.',
  dni: 'Revisa tu DNI: son 8 números (o tu carné de extranjería).',
  distrito: 'Escribe tu distrito.',
  direccion: 'Escribe tu dirección.',
  referencia: 'La referencia es muy larga.',
  envio: 'Elige cómo quieres el envío.',
  items: 'Revisa tu carrito.',
}

const error = (status: number, mensaje: string, campo?: string, extra?: HeadersInit) =>
  NextResponse.json({ error: mensaje, ...(campo ? { campo } : {}) }, { status, headers: extra })

/** «RR-7K2QMX»: seis letras o números al azar, sin los que se confunden (0/O, 1/I). Se lee fácil por WhatsApp. */
function nuevoNumero(): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return `RR-${Array.from({ length: 6 }, () => alfabeto[randomInt(alfabeto.length)]).join('')}`
}

/** Huella de la conexión: sha256 con sal, no la IP. En Vercel, x-real-ip y x-forwarded-for los pone Vercel. */
function huellaDe(req: Request): string {
  const ip = req.headers.get('x-real-ip')?.trim() || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'sin-ip'
  const sal = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createHash('sha256').update(`${sal}|pedido|${ip}`).digest('hex').slice(0, 16)
}

/** «12345678», o null si no lo dejó. undefined si lo que dejó no es un DNI ni un carné de extranjería. */
function limpiarDni(entrada: string | undefined): string | null | undefined {
  const limpio = (entrada ?? '').replace(/[\s.-]/g, '').toUpperCase()
  if (!limpio) return null
  return /^\d{8}$/.test(limpio) || /^[0-9A-Z]{9,12}$/.test(limpio) ? limpio : undefined
}

const soles = (n: number) => formatCurrency(n, 'PEN', 'es-PE')

/** Lo que ve la persona en la pantalla final: lo calculado aquí, no lo del navegador. */
function resumenPublico(p: PedidoCalculado) {
  return {
    lineas: p.lineas.map((l) => ({ nombre: l.nombre, cantidad: l.cantidad, total: l.total })),
    subtotal: p.subtotal,
    descuentoCombo: p.descuentoCombo,
    totalProductos: p.totalProductos,
    envio: p.envio,
    total: p.total,
  }
}

export async function POST(req: Request) {
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) {
    return error(415, 'Datos inválidos.')
  }
  const declarado = Number(req.headers.get('content-length'))
  if (Number.isFinite(declarado) && declarado > MAX_BYTES) return error(413, 'Tu pedido es muy largo.')

  let crudo: unknown
  try {
    const textoCuerpo = await req.text()
    if (textoCuerpo.length > MAX_BYTES) return error(413, 'Tu pedido es muy largo.')
    crudo = JSON.parse(textoCuerpo)
  } catch {
    return error(400, 'Datos inválidos.')
  }

  const parsed = schema.safeParse(crudo)
  if (!parsed.success) {
    const problema = parsed.error.issues[0]
    const campo = String(problema?.path[0] ?? 'pedido')
    // Más unidades de las que acepta una línea: se dice cuál es el tope (el carrito ya no deja pasarlo)
    if (campo === 'items' && problema?.path[2] === 'quantity' && problema.code === 'too_big') {
      return error(400, `Puedes pedir hasta ${MAX_UNIDADES_LINEA} unidades de cada producto. Baja la cantidad en tu carrito.`, campo)
    }
    return error(400, MENSAJES[campo] ?? 'Revisa tus datos.', campo)
  }
  const b = parsed.data
  // Un bot llenó el campo trampa: se le responde como si nada y no se guarda nada
  if (b.sitio) {
    return NextResponse.json({ numero: nuevoNumero(), formaPago: 'whatsapp', pagar: null, whatsapp: enlaceWhatsapp('Hola, RR Boxing.'), resumen: null })
  }

  // normalizarWhatsapp deja pasar de 8 a 15 dígitos (en /clase se aceptan otros países). Para un pedido, Richard tiene
  // que poder escribirle: un celular del Perú son 9 dígitos que empiezan con 9 (51 9xx xxx xxx); uno de otro país
  // viene con su código (10 dígitos o más). Así «98765432», con un número de menos, ya no pasa.
  const whatsapp = normalizarWhatsapp(b.whatsapp)
  if (!whatsapp || (whatsapp.startsWith('51') ? !/^519\d{8}$/.test(whatsapp) : whatsapp.length < 10)) {
    return error(
      400,
      'Revisa tu WhatsApp: en Perú son 9 números y empiezan con 9. Si es de otro país, ponlo con su código.',
      'whatsapp'
    )
  }
  const dni = limpiarDni(b.dni)
  if (dni === undefined) return error(400, MENSAJES.dni, 'dni')

  const huella = huellaDe(req)
  if ((await pedidosUltimaHora(huella)) >= MAX_POR_CONEXION) {
    console.warn('pedido: tope de pedidos por hora desde una misma conexión')
    return error(429, 'Ya recibimos varios pedidos desde tu conexión. Escríbenos por WhatsApp y lo vemos.', undefined, {
      'Retry-After': '3600',
    })
  }

  let calculo: Awaited<ReturnType<typeof calcularPedido>>
  try {
    calculo = await calcularPedido(b.items, b.envio)
  } catch (e) {
    console.error('pedido: no se pudo leer el catálogo', e instanceof Error ? e.message : 'error')
    return error(500, 'No pudimos registrar tu pedido.')
  }
  if (!calculo.ok) return error(400, calculo.error, calculo.campo)
  const p = calculo.pedido

  const pidioMercadoPago = b.pago === 'mercadopago' && mercadoPagoListo()
  const crearOrden = (id: string): Order => ({
    id,
    customerEmail: b.correo,
    customerName: b.nombre,
    country: 'PE',
    items: p.items,
    totalAmount: p.total,
    currency: 'PEN',
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: pidioMercadoPago ? 'mercadopago' : 'whatsapp',
    createdAt: new Date().toISOString(),
  })

  // Si el número ya existía (muy raro: hay mil millones), se intenta una vez con otro
  let numero = nuevoNumero()
  try {
    try {
      await appendOrder(crearOrden(numero), { aviso: false })
    } catch (e) {
      if (!(e instanceof Error && /duplicate|23505/i.test(e.message))) throw e
      numero = nuevoNumero()
      await appendOrder(crearOrden(numero), { aviso: false })
    }
  } catch (e) {
    console.error('pedido: no se pudo guardar', e instanceof Error ? e.message : 'error')
    return error(500, 'No pudimos registrar tu pedido.')
  }

  const sitio = (process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(req.url).origin).replace(/\/+$/, '')

  let formaPago: FormaPago = pidioMercadoPago ? 'mercadopago' : 'whatsapp'
  let pagar: string | null = null
  if (formaPago === 'mercadopago') {
    try {
      pagar = (
        await crearPreferencia(
          {
            pedidoId: numero,
            detalle: p.lineas.map((l) => `${l.cantidad} × ${l.nombre}`).join(', '),
            totalProductos: p.totalProductos,
            envio: { nombre: p.envio.nombre, monto: p.envio.monto },
            total: p.total,
            pagador: { nombre: b.nombre, correo: b.correo },
          },
          sitio
        )
      ).url
    } catch (e) {
      console.error('pedido: Mercado Pago no creó el cobro, queda por WhatsApp', numero, e instanceof Error ? e.message : 'error')
      formaPago = 'whatsapp'
      await updateOrder(numero, { paymentMethod: 'whatsapp' }).catch(() => null)
    }
  }

  const origen = limpiarOrigen(b.origen)
  const referencia = b.referencia?.trim() || null
  const datos: PedidoDatos = {
    version: 1,
    canal: 'web',
    whatsapp,
    dni,
    distrito: b.distrito,
    direccion: b.direccion,
    referencia,
    envio: p.envio,
    formaPago,
    colores: p.lineas.flatMap((l) => (l.color ? [{ producto: l.producto, color: l.color, cantidad: l.cantidad }] : [])),
    origen,
    montos: {
      subtotal: p.subtotal,
      descuentoCombo: p.descuentoCombo,
      totalProductos: p.totalProductos,
      envio: p.envio.monto,
      total: p.total,
    },
    huella,
  }
  try {
    await guardarPedidoDatos(numero, datos)
  } catch (e) {
    // El pedido ya está: los datos igual llegan en el mensaje de WhatsApp y en el correo a la tienda
    console.error('pedido: no se guardaron los datos del pedido', numero, e instanceof Error ? e.message : 'error')
  }

  try {
    await insertAdminNotification({
      type: 'new_order',
      severity: 'info',
      title: `Nuevo pedido ${numero} · ${b.nombre}`,
      body: [soles(p.total), FORMA_PAGO_TEXTO[formaPago], whatsappLegible(whatsapp), b.distrito, `origen: ${origenTexto(origen)}`].join(' · '),
      link: `/admin/orders/${numero}`,
      entityType: 'order',
      entityId: numero,
    })
  } catch {
    console.warn('pedido: no se dejó el aviso en el panel', numero)
  }

  const mensaje = mensajeWhatsappPedido(numero, p, { nombre: b.nombre, distrito: b.distrito, direccion: b.direccion, referencia }, 'whatsapp')
  const enlace = enlaceWhatsapp(mensaje)

  // Correos: si fallan, el pedido ya quedó guardado
  if (correoListo()) {
    const tienda = empresa().correo
    const resumen = resumenTexto(p).join('\n')
    const entrega = [`Distrito: ${b.distrito}`, `Dirección: ${b.direccion}`, ...(referencia ? [`Referencia: ${referencia}`] : [])].join('\n')
    const alCliente =
      (await pedidosUltimaHora()) <= MAX_CORREOS_HORA
        ? enviarCorreo({
            para: b.correo,
            asunto: `Recibimos tu pedido ${numero} · RR Boxing`,
            texto: [
              `Hola, ${b.nombre}:`,
              `Recibimos tu pedido ${numero} en rrboxing.com. Todavía no está pagado.`,
              resumen,
              `Envío a:\n${entrega}`,
              formaPago === 'mercadopago'
                ? `Elegiste pagar con Mercado Pago. Si no terminaste el pago, escríbenos por WhatsApp y lo vemos: ${enlace}`
                : `Para terminar, mándanos tu pedido por WhatsApp si todavía no lo hiciste: ${enlace}\nTe confirmamos el envío y cómo pagar.`,
              'RR Boxing',
            ].join('\n\n'),
            responderA: tienda,
          })
        : null
    const aLaTienda = tienda
      ? enviarCorreo({
          para: tienda,
          asunto: `Nuevo pedido ${numero} · ${b.nombre} · ${soles(p.total)}`,
          texto: [
            `Llegó un pedido en rrboxing.com. Todavía no está pagado (${FORMA_PAGO_TEXTO[formaPago].toLowerCase()}).`,
            resumen,
            [
              `Cliente: ${b.nombre}`,
              `Correo: ${b.correo}`,
              `WhatsApp: ${whatsappLegible(whatsapp)} (https://wa.me/${whatsapp})`,
              ...(dni ? [`DNI: ${dni}`] : []),
              entrega,
              `Origen: ${origenTexto(origen)}`,
            ].join('\n'),
            `En el panel: ${sitio}/admin/orders/${numero}`,
          ].join('\n\n'),
          responderA: b.correo,
        })
      : null
    await Promise.all([alCliente, aLaTienda])
  }

  console.info('pedido', JSON.stringify({ numero, formaPago, items: p.lineas.length }))
  return NextResponse.json({ numero, formaPago, pagar, whatsapp: enlace, resumen: resumenPublico(p) })
}
