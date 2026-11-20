// Cambios, devoluciones y garantía: una sola fuente para /reembolso («Cambios y devoluciones»), /garantia y la
// sección de cambios de los términos, para que nunca digan cosas distintas. Las preguntas frecuentes y las fichas
// pueden importar CAMBIOS (no lee datos del servidor).
// Reglas (Longev, docs/requisitos-legales-2026-11-10.md, §2.1 y §2.2): si el producto llega mal, la persona elige
// cambio o devolución aunque lo haya abierto, y RR Boxing paga los envíos; «sin uso y en su empaque» vale solo para
// el cambio por otro motivo y se dice expresamente; nada limita la garantía legal (Ley N.º 29571, arts. 18-20 y 97).
import type { Empresa } from '@/shared/lib/empresa'
import { CAMBIO_DIAS, GARANTIA_DIAS, RUTAS, VERSION, VIGENTE_DESDE } from './politicas'
import { enlace, falta, filas, nota, parrafo, porConfirmar, type DocumentoLegal, type Pieza, type Seccion, type Texto } from './tipos'
import { canales } from './vendedor'

// El plazo para pedir un cambio por otro motivo lo decide Diego (CAMBIO_DIAS en politicas.ts). Mientras no esté,
// ningún texto promete un plazo: se ve con la persona por WhatsApp y en /reembolso sale «por confirmar».
/** « dentro de los 7 días calendario desde la entrega», o nada si el plazo no está decidido */
const dentroDelPlazo = CAMBIO_DIAS === null ? '' : ` dentro de los ${CAMBIO_DIAS} días calendario desde la entrega`

/** El plazo, como valor de una fila: «7 días calendario desde la entrega» o «Por confirmar» */
export const PLAZO_CAMBIO_OTRO_MOTIVO: Texto =
  CAMBIO_DIAS === null ? porConfirmar : `${CAMBIO_DIAS} días calendario desde la entrega`

export const CAMBIOS = {
  /** Para las preguntas frecuentes y los términos */
  resumen: `Si tu producto llega fallado, dañado o no es el que pediste, lo resolvemos aunque ya lo hayas abierto o probado: tú eliges entre un cambio y la devolución de tu dinero, y los envíos los paga RR Boxing. Si quieres cambiarlo por otro motivo, escríbenos por WhatsApp${dentroDelPlazo} y lo vemos contigo: el producto tiene que estar sin uso y en su empaque.`,
  llegaMal:
    'Si tu producto llega fallado, dañado o no es el que pediste, o falla por un defecto de fabricación, lo resolvemos aunque ya lo hayas abierto o probado y aunque ya no tengas el empaque. Tú eliges: te enviamos uno igual en buen estado o te devolvemos lo que pagaste.',
  pruebas:
    'Para resolverlo más rápido, te podemos pedir fotos del producto y, si llegó dañado, también de la caja en que llegó.',
  garantia: `Avísanos dentro de los ${GARANTIA_DIAS} días calendario desde la entrega: es nuestra garantía de compra.`,
  garantiaLegal: `Esos ${GARANTIA_DIAS} días no acortan tus derechos: si una falla de fabricación aparece después, escríbenos igual. La garantía legal que te da el Código de Protección y Defensa del Consumidor sigue valiendo.`,
  otroMotivo: `Si quieres cambiar un producto por otro motivo (por ejemplo, por otra medida, otro color u otro producto), escríbenos por WhatsApp${dentroDelPlazo} y lo vemos contigo. El producto tiene que estar sin uso, en buen estado y en su empaque.`,
  diferencia: 'Si el producto nuevo cuesta más, pagas la diferencia; si cuesta menos, te la devolvemos.',
  soloOtroMotivo: `Estas condiciones (sin uso y en su empaque${CAMBIO_DIAS === null ? '' : `, y dentro de los ${CAMBIO_DIAS} días`}) valen solo para los cambios por otro motivo. Nunca se aplican a un producto fallado, dañado o equivocado.`,
  envioLlegaMal:
    'Si el producto llegó fallado, dañado o equivocado, RR Boxing paga todos los envíos: el de vuelta del producto y el del nuevo. Te decimos por WhatsApp cómo lo recogemos o cómo nos lo mandas, sin costo para ti.',
  envioOtroMotivo:
    'En un cambio por otro motivo, el envío corre por tu cuenta: el de vuelta del producto y el del nuevo. Antes del cambio te decimos cuánto cuesta.',
  dinero:
    'Te devolvemos lo que pagaste por el mismo medio con que pagaste. Si el producto llegó fallado, dañado o equivocado, también te devolvemos lo que pagaste por el envío.',
  cancelar:
    'Puedes cancelar tu pedido mientras no lo hayamos enviado: escríbenos y te devolvemos todo lo que pagaste.',
} as const

/** La clase virtual: también va en los términos (/terminos#clases) */
export const CAMBIOS_CLASE = {
  cancelamos:
    'Si RR Boxing cancela una clase virtual o le cambia el día o la hora, te devolvemos lo que pagaste o, si prefieres, te pasamos a la nueva fecha.',
  /** Lo decide Diego: devolución, pasar a otra fecha o nada */
  noPuedes: porConfirmar,
} as const

const derechos = (): Pieza[] => [
  'Esta política no limita los derechos que te da el Código de Protección y Defensa del Consumidor (Ley N.º\u00a029571) ni la garantía legal de los productos. Si no quedas conforme, puedes dejar tu reclamo en el ',
  enlace('Libro de Reclamaciones', RUTAS.libro),
  ' o acudir al INDECOPI.',
]

/** /reembolso: Cambios y devoluciones */
export function cambios(e: Empresa): DocumentoLegal {
  const contacto = canales(e)
  const libro = enlace('Libro de Reclamaciones', RUTAS.libro)

  const secciones: Seccion[] = [
    {
      id: 'en-corto',
      titulo: 'En corto',
      bloques: [
        filas([
          {
            nombre: 'Llegó fallado, dañado o equivocado',
            valor:
              'Tú eliges: un cambio o la devolución de tu dinero, aunque lo hayas abierto o probado. Los envíos los paga RR Boxing.',
          },
          {
            nombre: 'Cambio por otro motivo',
            valor:
              CAMBIO_DIAS === null
                ? ['Sin uso y en su empaque: escríbenos por WhatsApp y lo vemos contigo. ', falta('Plazo'), '. El envío corre por tu cuenta.']
                : `Dentro de los ${CAMBIO_DIAS} días desde la entrega, sin uso y en su empaque. El envío corre por tu cuenta.`,
          },
          { nombre: 'Cómo pedirlo', valor: ['Escríbenos ', ...contacto, '.'] },
        ]),
      ],
    },
    {
      id: 'llega-mal',
      titulo: 'Si llega fallado, dañado o equivocado',
      bloques: [parrafo(CAMBIOS.llegaMal), parrafo(CAMBIOS.pruebas)],
    },
    {
      id: 'garantia',
      titulo: 'Garantía de compra',
      bloques: [parrafo(CAMBIOS.garantia), parrafo(CAMBIOS.garantiaLegal)],
    },
    {
      id: 'otro-motivo',
      titulo: 'Cambio por otro motivo',
      bloques: [
        parrafo(CAMBIOS.otroMotivo),
        filas([{ nombre: 'Plazo para pedir el cambio', valor: PLAZO_CAMBIO_OTRO_MOTIVO }]),
        parrafo(CAMBIOS.diferencia),
        parrafo(CAMBIOS.soloOtroMotivo),
      ],
    },
    {
      id: 'envios',
      titulo: 'Quién paga el envío del cambio',
      bloques: [
        filas([
          { nombre: 'Fallado, dañado o equivocado', valor: CAMBIOS.envioLlegaMal },
          { nombre: 'Otro motivo', valor: CAMBIOS.envioOtroMotivo },
        ]),
      ],
    },
    {
      id: 'dinero',
      titulo: 'Devolución del dinero',
      bloques: [
        parrafo(CAMBIOS.dinero),
        parrafo(CAMBIOS.cancelar),
        filas([{ nombre: 'Plazo para devolverte el dinero', valor: porConfirmar }]),
      ],
    },
    {
      id: 'clase',
      titulo: 'Clases virtuales',
      bloques: [
        parrafo('La fecha, la hora y el precio de cada clase virtual se publican en ', enlace('la página de la clase', RUTAS.clase), '.'),
        parrafo(CAMBIOS_CLASE.cancelamos),
        filas([{ nombre: 'Si pagaste y no puedes asistir', valor: CAMBIOS_CLASE.noPuedes }]),
        parrafo(
          'Cómo te inscribes, cómo pagas y cómo entras a la clase está en los ',
          enlace('Términos y condiciones', `${RUTAS.terminos}#clases`),
          '.',
        ),
      ],
    },
    {
      id: 'como-pedirlo',
      titulo: 'Cómo pedirlo',
      bloques: [
        parrafo('Escríbenos ', ...contacto, ' con tu nombre, lo que pediste y qué pasó.'),
        parrafo('Te respondemos y coordinamos contigo el cambio o la devolución. Si prefieres, deja tu reclamo en el ', libro, '.'),
      ],
    },
    {
      id: 'derechos',
      titulo: 'Tus derechos',
      bloques: [
        parrafo(...derechos()),
        nota(`Esta es la versión ${VERSION.cambios}, vigente desde el ${VIGENTE_DESDE}. Si la cambiamos, publicamos aquí la nueva versión con su fecha; un pedido que ya hiciste sigue con la versión que había cuando lo hiciste.`),
      ],
    },
  ]

  return {
    titulo: 'Cambios y devoluciones',
    bajada: 'Qué hacer si tu producto llega mal, cómo cambiarlo por otro motivo y cómo te devolvemos el dinero.',
    version: VERSION.cambios,
    vigenteDesde: VIGENTE_DESDE,
    secciones,
  }
}

/** /garantia: corta, con los mismos textos que Cambios y devoluciones */
export function garantia(e: Empresa): DocumentoLegal {
  const secciones: Seccion[] = [
    {
      id: 'que-cubre',
      titulo: 'Qué cubre',
      bloques: [parrafo(CAMBIOS.llegaMal), parrafo(CAMBIOS.garantia), parrafo(CAMBIOS.garantiaLegal)],
    },
    {
      id: 'como-pedirla',
      titulo: 'Cómo pedirla',
      bloques: [
        parrafo('Escríbenos ', ...canales(e), ' con tu nombre, lo que pediste y qué pasó.'),
        parrafo(CAMBIOS.pruebas),
        parrafo(CAMBIOS.envioLlegaMal),
      ],
    },
    {
      id: 'mas',
      titulo: 'Cambios por otro motivo y devoluciones',
      bloques: [
        parrafo(
          'Los cambios por otro motivo, la devolución del dinero y las clases virtuales están en ',
          enlace('Cambios y devoluciones', RUTAS.cambios),
          '.',
        ),
        parrafo(...derechos()),
      ],
    },
  ]

  return {
    titulo: 'Garantía de compra',
    bajada: 'Qué cubre la garantía de los productos de RR Boxing y cómo pedirla. Es parte de Cambios y devoluciones.',
    version: VERSION.cambios,
    vigenteDesde: VIGENTE_DESDE,
    secciones,
  }
}
