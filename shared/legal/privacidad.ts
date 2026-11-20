// Política de privacidad de RR Boxing. Cubre los diez puntos que pide el reglamento de la Ley N.º 29733
// (D.S. N.º 016-2024-JUS, art. 6.1) con lo que de verdad hace la web hoy: el pedido va por WhatsApp (la web no lo
// guarda), la inscripción a la clase y las hojas del Libro se guardan en Supabase (tabla admin_notifications), la web
// la aloja Vercel, los correos salen por Resend, la clase se cobra con Mercado Pago, /consulta muestra videos de
// YouTube y el carrito y el país quedan en el navegador (localStorage). Stripe sale solo por los datos que recibió el
// formulario de pago que la web tuvo antes. Ningún proveedor que no esté en el código.
// Modelo: Longev (lib/legal/privacidad.ts). Si cambia un proveedor o lo que recibe, cambia aquí y sube
// VERSION.privacidad en politicas.ts.
import type { Empresa } from '@/shared/lib/empresa'
import { RUTAS, VERSION, VIGENTE_DESDE } from './politicas'
import {
  enlace,
  falta,
  filas,
  grupo,
  nota,
  parrafo,
  porConfirmar,
  unir,
  type Bloque,
  type DocumentoLegal,
  type Pieza,
  type Seccion,
  type Texto,
} from './tipos'
import { canales, filasVendedor } from './vendedor'

/** Con espacio duro: «EE.» y «UU.» nunca quedan en dos líneas */
export const EEUU = 'EE.\u00a0UU.'

export interface Destinatario {
  /** El nombre legal, o el comercial si el legal está por confirmar */
  nombre: string
  /** Cómo se lo nombra en una frase */
  corto: string
  /** Qué hace y qué recibe */
  hace: Texto
  pais: Texto
  /** Su domicilio (Ley N.º 29733, art. 18: identidad y domicilio de cada encargado) */
  domicilio: Texto
  /** Su política de privacidad */
  politica: string | null
}

/**
 * Los proveedores que reciben datos personales. Nombre legal, domicilio y política de Vercel, Supabase, Google y
 * WhatsApp: los verificó Longev el 10 nov 2026 (lib/legal/privacidad.ts). Los de Resend, Mercado Pago y Stripe
 * no se verificaron: salen «por confirmar» o con lo que ya se sabe.
 */
export const DESTINATARIOS: readonly Destinatario[] = [
  {
    nombre: 'Supabase Pte. Ltd.',
    corto: 'Supabase',
    hace: 'Guarda la base de datos de la web: las inscripciones a la clase virtual, las hojas del Libro de Reclamaciones, las cuentas del panel de administración y los pedidos que se hicieron antes con el formulario de pago de la web.',
    // La región del proyecto está en el panel de Supabase (Project Settings → General → Region). Cuando se
    // confirme, va aquí (EEUU u otro país) y se revisan el aviso de components/AvisoDatos.tsx y el del Libro
    // (features/legal/HojaReclamacion.tsx).
    pais: [falta('Región')],
    domicilio: '65 Chulia Street #38-02/03, OCBC Centre, Singapur 049513',
    politica: 'https://supabase.com/privacy',
  },
  {
    nombre: 'Vercel Inc.',
    corto: 'Vercel',
    hace: 'Aloja la web: recibe tu dirección IP y lo que envías en los formularios.',
    pais: EEUU,
    domicilio: '440 N Barranca Avenue #4133, Covina, California 91723, Estados Unidos',
    politica: 'https://vercel.com/legal/privacy-policy',
  },
  {
    nombre: 'Resend',
    corto: 'Resend',
    hace: 'Envía los correos de la web, como la copia de tu hoja de reclamación: recibe tu correo y lo que dice el mensaje.',
    pais: EEUU,
    domicilio: [falta('Razón social y domicilio')],
    politica: 'https://resend.com/legal/privacy-policy',
  },
  {
    nombre: 'Mercado Pago',
    corto: 'Mercado Pago',
    hace: 'Cobra la clase virtual en su propia página: recibe los datos de tu tarjeta o de tu medio de pago, tu nombre, tu correo y el monto. Nosotros no vemos los datos de tu tarjeta.',
    pais: porConfirmar,
    domicilio: [falta('Razón social y domicilio')],
    politica: null,
  },
  {
    nombre: 'WhatsApp LLC (Meta)',
    corto: 'WhatsApp',
    hace: 'Por ahí nos mandas tu pedido o tu comprobante y te escribimos: recibe tu número y los mensajes.',
    pais: EEUU,
    domicilio: '1 Meta Way, Menlo Park, California 94025, Estados Unidos',
    politica: 'https://www.whatsapp.com/legal/privacy-policy',
  },
  {
    nombre: 'Google LLC (YouTube)',
    corto: 'YouTube',
    hace: 'Muestra los videos de algunas páginas, como la de clases 1 a 1. Cuando un video se carga, YouTube recibe tu dirección IP y datos de tu navegador, y puede guardar sus propias cookies.',
    pais: EEUU,
    domicilio: '1600 Amphitheatre Parkway, Mountain View, California 94043, Estados Unidos',
    politica: 'https://policies.google.com/privacy',
  },
  {
    nombre: 'Stripe',
    corto: 'Stripe',
    hace: 'Recibió tu correo, tu nombre y tu teléfono solo si llenaste el formulario de pago que la web tuvo antes. Ese formulario ya no se usa y hoy Stripe no recibe datos.',
    pais: EEUU,
    domicilio: [falta('Razón social y domicilio')],
    politica: 'https://stripe.com/privacy',
  },
]

const piezas = (t: Texto): Pieza[] => (typeof t === 'string' ? [t] : [...t])

/** Qué hace, su domicilio y el enlace a su política, en una línea («… por confirmar» si falta) */
const lineaDestinatario = (d: Destinatario): Pieza[] => [
  ...piezas(d.hace),
  ...(typeof d.domicilio === 'string' ? [` Domicilio: ${d.domicilio}.`] : [' ', ...piezas(d.domicilio), '.']),
  ...(d.politica ? [' ', enlace('Su política de privacidad', d.politica)] : []),
]

/** Un tratamiento: qué datos, para qué, con qué base legal y por cuánto tiempo */
const tratamiento = (titulo: string, datos: Texto, paraQue: Texto, base: Texto, tiempo: Texto): Bloque =>
  grupo(
    titulo,
    filas([
      { nombre: 'Datos', valor: datos },
      { nombre: 'Para qué', valor: paraQue },
      { nombre: 'Base legal', valor: base },
      { nombre: 'Cuánto tiempo', valor: tiempo },
    ]),
  )

export function privacidad(e: Empresa): DocumentoLegal {
  const contacto = canales(e)
  const enEEUU = DESTINATARIOS.filter((d) => d.pais === EEUU).map((d) => d.corto)

  const secciones: Seccion[] = [
    {
      id: 'responsable',
      titulo: 'Quién es responsable de tus datos',
      bloques: [
        parrafo('El responsable de tus datos es quien vende en RR Boxing:'),
        filas(filasVendedor(e)),
        parrafo('Para ejercer tus derechos, retirar un permiso o preguntarnos algo sobre tus datos, escríbenos ', ...contacto, '.'),
        parrafo('Las condiciones de compra están en los ', enlace('Términos y condiciones', RUTAS.terminos), '.'),
        nota('Cumplimos la Ley N.º\u00a029733, Ley de Protección de Datos Personales, y su reglamento, aprobado por el D.S. N.º\u00a0016-2024-JUS.'),
      ],
    },
    {
      id: 'datos',
      titulo: 'Qué datos usamos y para qué',
      bloques: [
        parrafo('Usamos solo los datos que necesitamos para cada cosa, y solo para eso:'),
        tratamiento(
          'Tu pedido por WhatsApp',
          'Lo que nos escribes: tu nombre, tu correo, tu número de WhatsApp, tu distrito y tu dirección de envío, los productos y los montos. La web arma el mensaje con tu carrito, pero no lo guarda: lo envías tú desde WhatsApp.',
          'Confirmar tu pedido, cobrarte, enviarlo y atender cambios, devoluciones y reclamos.',
          'Cumplir la compra que haces con nosotros.',
          porConfirmar,
        ),
        tratamiento(
          'Inscripción a la clase virtual',
          'Tu nombre, tu correo y tu WhatsApp. Si pagas, Mercado Pago nos informa el pago (el monto y el nombre o el correo de quien pagó) y por WhatsApp nos mandas tu comprobante.',
          'Mandarte el link de la clase, avisarte si algo cambia y confirmar tu pago.',
          'Cumplir la inscripción que haces con nosotros.',
          porConfirmar,
        ),
        tratamiento(
          'Libro de Reclamaciones',
          'Los de tu hoja: tu nombre, tu documento de identidad, tu domicilio, tu correo y tu teléfono; los de tu padre, madre o representante, si eres menor de edad; el producto o la clase, el monto, lo que pasó y lo que pides.',
          'Registrar tu reclamo o queja, mandarte la copia de tu hoja y responderte por escrito.',
          'Lo manda la ley (Reglamento del Libro de Reclamaciones).',
          'Al menos 2 años desde que lo presentas, como pide la ley.',
        ),
        tratamiento(
          'Pedidos hechos antes en la web',
          'Antes, la tienda tenía un formulario de pago en la web, que ya no se usa. Si lo llenaste, guardamos lo que escribiste: tu nombre, tu correo, tu teléfono, tu dirección y los productos.',
          'Ya no los usamos para nada. Si quieres que los borremos ahora, escríbenos.',
          'Lo que pedías al llenar el formulario: tu compra.',
          porConfirmar,
        ),
        tratamiento(
          'Panel de administración',
          'El correo y la contraseña de quienes administran la tienda, y su sesión.',
          'Entrar al panel y que solo entren ellos.',
          'Es necesario para dar el servicio y proteger los datos de la tienda.',
          'Mientras administren la tienda. La sesión vence a los 7 días.',
        ),
        tratamiento(
          'Registros técnicos',
          'Tu dirección IP y datos técnicos de cada visita, que registra Vercel, el servicio que aloja la web.',
          'Que la web funcione, sea segura y podamos corregir errores.',
          'Es necesario para darte el servicio.',
          porConfirmar,
        ),
        parrafo(
          'No usamos tus datos para nada más: no te mandamos publicidad sin tu permiso, no armamos perfiles y no vendemos tus datos.',
        ),
      ],
    },
    {
      id: 'obligatorios',
      titulo: 'Qué datos son obligatorios',
      bloques: [
        filas([
          {
            nombre: 'Tu pedido',
            valor: 'Tu nombre, tu correo, tu WhatsApp y tu dirección de envío. Sin ellos no podemos confirmar, cobrar ni enviar tu pedido.',
          },
          {
            nombre: 'Clase virtual',
            valor: 'Tu nombre, tu correo y tu WhatsApp. Sin ellos no podemos mandarte el link de la clase.',
          },
          {
            nombre: 'Libro de Reclamaciones',
            valor: 'Los que pide la hoja. La ley los pide para registrar tu reclamo o queja y responderte.',
          },
        ]),
        parrafo(
          'No tomamos decisiones automáticas sobre ti ni armamos perfiles: una persona revisa cada pedido, inscripción, cambio y reclamo.',
        ),
      ],
    },
    {
      id: 'destinatarios',
      titulo: 'Con quién compartimos tus datos',
      bloques: [
        parrafo('Para que la web y la tienda funcionen trabajamos con estos proveedores. Cada uno recibe solo lo que necesita para su parte:'),
        filas(
          DESTINATARIOS.map((d) => ({ nombre: d.nombre, valor: lineaDestinatario(d), nota: d.pais })),
          'Servidores en',
        ),
        grupo(
          'Transferencia internacional',
          parrafo(
            `${unir(enEEUU)} procesan los datos en ${EEUU}, donde están sus servidores. Por eso tus datos salen del Perú: es una transferencia internacional, y la hacemos solo para lo que dice esta política.`,
          ),
          ...(DESTINATARIOS.some((d) => d.corto === 'Supabase' && d.pais !== EEUU)
            ? [parrafo('Supabase también guarda los datos fuera del Perú. ', falta('El país de sus servidores'), '.')]
            : []),
          parrafo('Estos proveedores usan tus datos solo para darnos su servicio, según sus condiciones y sus políticas de privacidad.'),
        ),
        parrafo('No vendemos tus datos ni se los damos a nadie más, salvo que una autoridad nos los pida conforme a la ley.'),
      ],
    },
    {
      id: 'navegador',
      titulo: 'Lo que se guarda en tu navegador',
      bloques: [
        parrafo(
          'Tu carrito y el país que eliges se guardan solo en tu navegador (en su almacenamiento local, localStorage), para que no se pierdan al cambiar de página. No se guardan en nuestros servidores. Puedes borrarlos desde la configuración de tu navegador.',
        ),
        parrafo(
          'No usamos cookies de publicidad ni de seguimiento, ni píxeles de Meta, TikTok o Google. La única cookie nuestra es la de la sesión del panel de administración, y solo la tienen quienes administran la tienda.',
        ),
        parrafo('Los videos de YouTube pueden guardar cookies de YouTube cuando se cargan (mira ', enlace('Con quién compartimos tus datos', '#destinatarios'), ').'),
        parrafo('Si algún día sumamos herramientas de medición o de publicidad, te pediremos permiso antes y actualizaremos esta política.'),
      ],
    },
    {
      id: 'menores',
      titulo: 'Menores de edad',
      bloques: [
        parrafo(
          'Si tienes menos de 14 años, necesitamos el permiso de tu padre, madre o tutor para usar tus datos: pídele que haga el pedido o la inscripción contigo.',
        ),
      ],
    },
    {
      id: 'derechos',
      titulo: 'Tus derechos',
      bloques: [
        parrafo('Puedes pedirnos, gratis, cualquiera de estas cosas. Te respondemos dentro de estos plazos:'),
        filas(
          [
            {
              nombre: 'Información',
              valor: 'Saber qué datos tuyos tenemos, para qué los usamos y con quién los compartimos.',
              nota: '8 días hábiles',
            },
            {
              nombre: 'Acceso y portabilidad',
              valor: 'Recibir una copia de tus datos, también en un archivo CSV o JSON, o que se los enviemos a otra empresa si es posible.',
              nota: '20 días hábiles',
            },
            { nombre: 'Rectificación', valor: 'Corregir datos equivocados o incompletos.', nota: '10 días hábiles' },
            { nombre: 'Cancelación', valor: 'Borrar tus datos, salvo los que la ley nos obliga a guardar.', nota: '10 días hábiles' },
            { nombre: 'Oposición', valor: 'Que dejemos de usar tus datos para algo.', nota: '10 días hábiles' },
          ],
          'Plazo máximo',
        ),
        parrafo(
          'Los plazos son en días hábiles y se cuentan desde el día siguiente a tu solicitud. Salvo el de información, podemos ampliarlos una sola vez, por el mismo plazo, si te explicamos por qué.',
        ),
        grupo(
          'Cómo pedirlo',
          parrafo(
            'Escríbenos ',
            ...contacto,
            '. Para saber que eres tú, nos basta que nos escribas desde el mismo WhatsApp o correo que usaste: no siempre te pediremos tu DNI. Te confirmamos que recibimos tu solicitud y te respondemos por escrito.',
          ),
          parrafo(
            'Si borras tus datos, avisamos a los proveedores con los que los compartimos para que también los borren, y guardamos solo lo que la ley nos obliga a conservar.',
          ),
        ),
        grupo(
          'Si no estás de acuerdo',
          parrafo(
            'Si no te respondemos a tiempo o no estás de acuerdo con la respuesta, puedes presentar una reclamación ante la Autoridad Nacional de Protección de Datos Personales, del Ministerio de Justicia y Derechos Humanos, o acudir al Poder Judicial con un hábeas data.',
          ),
        ),
      ],
    },
    {
      id: 'banco-de-datos',
      titulo: 'Banco de datos',
      bloques: [
        parrafo('Tus datos se guardan en nuestros bancos de datos personales.'),
        filas([
          {
            nombre: 'Inscripción ante la Autoridad Nacional de Protección de Datos Personales',
            valor: porConfirmar,
          },
        ]),
      ],
    },
    {
      id: 'seguridad',
      titulo: 'Seguridad',
      bloques: [
        parrafo(
          'Protegemos tus datos con conexiones cifradas y con acceso solo para quien los necesita: el panel de administración pide usuario y contraseña. Si ocurre un incidente que afecte tus datos, te avisamos y lo comunicamos a la autoridad, como manda la ley.',
        ),
      ],
    },
    {
      id: 'version',
      titulo: 'Cambios a esta política',
      bloques: [
        parrafo(`Esta es la versión ${VERSION.privacidad}, vigente desde el ${VIGENTE_DESDE}.`),
        parrafo('Si la cambiamos, publicamos aquí la nueva versión con su fecha. Si sumamos un proveedor o un uso nuevo de tus datos, lo decimos aquí antes de empezar.'),
      ],
    },
  ]

  return {
    titulo: 'Política de privacidad',
    bajada: 'Qué datos tuyos usamos, para qué, dónde se guardan, con quién los compartimos y cómo ejercer tus derechos.',
    version: VERSION.privacidad,
    vigenteDesde: VIGENTE_DESDE,
    secciones,
  }
}
