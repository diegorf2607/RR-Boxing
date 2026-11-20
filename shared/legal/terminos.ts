// Términos y condiciones de RR Boxing. Se arman con quién vende (empresa()), el combo (combo-promo.ts) y las
// políticas (politicas.ts y cambios.ts): ningún dato se escribe dos veces y lo que falta decidir sale «por
// confirmar». Modelo: Longev (lib/legal/terminos.ts), sin lo que es solo de Longev.
// Las clases virtuales se describen en general: la fecha, la hora y el precio de cada una están solo en /clase, para
// que estos términos sigan valiendo cuando esa clase pase.
// Si cambias algo que la persona acepta, sube VERSION.terminos en politicas.ts.
import type { Empresa } from '@/shared/lib/empresa'
import { COMBO_DISCOUNT_RATE, COMBO_MIN_UNITS } from '@/shared/lib/combo-promo'
import { CAMBIOS, CAMBIOS_CLASE } from './cambios'
import { RECLAMO_DIAS_HABILES, RUTAS, VERSION, VIGENTE_DESDE } from './politicas'
import { enlace, filas, grupo, lista, nota, parrafo, porConfirmar, type DocumentoLegal, type Seccion } from './tipos'
import { canales, filasVendedor } from './vendedor'

const porcentajeCombo = `${Math.round(COMBO_DISCOUNT_RATE * 100)}%`

export function terminos(e: Empresa): DocumentoLegal {
  const contacto = canales(e)
  const libro = enlace('Libro de Reclamaciones', RUTAS.libro)

  const secciones: Seccion[] = [
    {
      id: 'quien-vende',
      titulo: 'Quién vende',
      bloques: [
        filas(filasVendedor(e)),
        parrafo(
          'RR Boxing es la marca con la que vendemos. Estos términos se aplican a lo que compras en esta web: los productos de la tienda y las clases. En ellos, «nosotros» es quien vende, con los datos de arriba, y «tú», quien compra.',
        ),
      ],
    },
    {
      id: 'que-vendemos',
      titulo: 'Qué vendemos',
      bloques: [
        filas([
          { nombre: 'Productos', valor: 'Guantes de boxeo, vendas y cuerda para saltar, para entrenar.' },
          {
            nombre: 'Clases',
            valor: [
              'Clases virtuales y ',
              enlace('clases 1 a 1', RUTAS.clases1a1),
              ' con Richard. Cómo funcionan está en ',
              enlace('Clases', '#clases'),
              '.',
            ],
          },
        ]),
      ],
    },
    {
      id: 'como-se-compra',
      titulo: 'Cómo se compra',
      bloques: [
        parrafo('Hoy la tienda no cobra en la web. Los pedidos se hacen por WhatsApp:'),
        lista(
          'Armas tu carrito y tocas «Pedir por WhatsApp». Se abre WhatsApp con tu pedido ya escrito.',
          'Completas tu nombre, tu correo y tu dirección de envío, y nos mandas el mensaje.',
          'Te confirmamos por WhatsApp que hay stock, el costo y el plazo del envío, el total y cómo pagar.',
          'Solo te cobramos cuando aceptas ese total. Mandar el mensaje no te obliga a comprar.',
          'Cuando confirmamos tu pago, preparamos y enviamos tu pedido.',
        ),
        parrafo(CAMBIOS.cancelar),
        filas([{ nombre: 'Comprobante de pago (boleta o factura) y cómo te llega', valor: porConfirmar }]),
      ],
    },
    {
      id: 'precios',
      titulo: 'Precios y descuentos',
      bloques: [
        parrafo('Los precios están en soles (S/) y son finales: no se les suma ningún impuesto. El envío va aparte y te lo confirmamos antes de cobrarte.'),
        parrafo(
          `El único descuento de la tienda es el combo: llevando ${COMBO_MIN_UNITS} o más unidades, aunque sean del mismo producto, tienes ${porcentajeCombo} de descuento sobre los productos que participan del combo. El carrito lo calcula solo y va escrito en tu pedido.`,
        ),
        parrafo('Si después cambiamos un precio, tu pedido no cambia: vale el total que te confirmamos por WhatsApp. Nunca agregamos productos ni cargos que no elegiste.'),
      ],
    },
    {
      id: 'envios',
      titulo: 'Envíos',
      bloques: [
        parrafo('Enviamos solo dentro del Perú.'),
        parrafo(
          'El costo y el plazo del envío dependen de tu distrito y de la opción que elijas. Te los confirmamos por WhatsApp antes de cobrarte, y nunca te cobramos un envío que no hayas aceptado.',
        ),
        parrafo(
          'Si tu pedido no llega en el plazo que te confirmamos, o llega dañado, escríbenos: lo resolvemos contigo y, si se perdió o llegó mal, tú eliges: te enviamos otro o te devolvemos tu dinero.',
        ),
        parrafo('Si después de confirmarte el pedido nos quedamos sin stock, te avisamos y te devolvemos todo lo que pagaste.'),
      ],
    },
    {
      id: 'cambios',
      titulo: 'Cambios y garantía',
      bloques: [
        parrafo(CAMBIOS.resumen),
        parrafo(
          'El detalle está en ',
          enlace('Cambios y devoluciones', RUTAS.cambios),
          ' y en ',
          enlace('Garantía de compra', RUTAS.garantia),
          '.',
        ),
      ],
    },
    {
      id: 'clases',
      titulo: 'Clases',
      bloques: [
        grupo(
          'Clases virtuales',
          parrafo('La fecha, la hora y el precio de cada clase virtual se publican en ', enlace('la página de la clase', RUTAS.clase), '.'),
          lista(
            'Te inscribes ahí con tu nombre, tu correo y tu WhatsApp.',
            'Si la clase es gratis, solo te inscribes con tu nombre, tu correo y tu WhatsApp, y por WhatsApp te enviamos el link para entrar.',
            'Si una clase tiene precio, lo dice su página: pagas con Mercado Pago, en su propia página, en soles; si pagas desde fuera del Perú, tu banco hace la conversión. Después nos mandas tu comprobante por WhatsApp y te enviamos el link.',
          ),
          parrafo(CAMBIOS_CLASE.cancelamos),
          filas([{ nombre: 'Si pagaste y no puedes asistir', valor: CAMBIOS_CLASE.noPuedes }]),
        ),
        grupo(
          'Clases 1 a 1',
          parrafo(
            'Se coordinan por WhatsApp. Antes de cobrarte, acordamos contigo ahí, por escrito: el precio, el día y la hora, y qué pasa si hay que reprogramar o cancelar la clase, de tu lado o del nuestro, incluida la devolución de tu dinero. Solo te cobramos cuando aceptas esas condiciones.',
          ),
        ),
        parrafo('Las clases son de actividad física. Si tienes una lesión, una condición de salud o estás embarazada, consulta antes con tu médico y avísanos antes de empezar.'),
      ],
    },
    {
      id: 'mensajes',
      titulo: 'Mensajes que te enviamos',
      bloques: [
        parrafo(
          'Te escribimos por WhatsApp o por correo solo por tu pedido o tu clase: para confirmarlo, coordinar el pago y el envío, mandarte el link de la clase o atender un cambio o un reclamo. No te mandamos promociones sin tu permiso.',
        ),
        parrafo('Cómo usamos tus datos está en la ', enlace('Política de privacidad', RUTAS.privacidad), '.'),
      ],
    },
    {
      id: 'reclamos',
      titulo: 'Reclamos',
      bloques: [
        parrafo('Si algo salió mal, escríbenos ', ...contacto, ', o deja tu reclamo o queja en nuestro ', libro, ' virtual.'),
        parrafo(`Te respondemos por escrito en un plazo máximo de ${RECLAMO_DIAS_HABILES} días hábiles.`),
        parrafo('Ningún reclamo depende de que pagues algo. Reclamar tampoco te impide acudir al INDECOPI ni a otras vías.'),
        nota(
          'Base legal del Libro de Reclamaciones: Ley N.º\u00a029571, Código de Protección y Defensa del Consumidor, arts. 150 y 151, y su reglamento, el D.S. N.º\u00a0011-2011-PCM y modificatorias.',
        ),
      ],
    },
    {
      id: 'contenido',
      titulo: 'Contenido de la web',
      bloques: [
        parrafo(
          'La marca RR Boxing, los textos y las fotos y videos propios de esta web son nuestros. Las fotos de producto pueden ser del fabricante, y las marcas de los productos son de sus dueños. No copies ni publiques nuestro contenido sin nuestro permiso.',
        ),
      ],
    },
    {
      id: 'version',
      titulo: 'Cambios a estos términos',
      bloques: [
        parrafo(`Esta es la versión ${VERSION.terminos}, vigente desde el ${VIGENTE_DESDE}.`),
        parrafo(
          'Si cambiamos estos términos, publicamos aquí la nueva versión, con su fecha. Los cambios valen solo para pedidos nuevos: un pedido confirmado no cambia sin tu consentimiento expreso, y tu silencio no cuenta como aceptación.',
        ),
      ],
    },
    {
      id: 'ley',
      titulo: 'Ley aplicable',
      bloques: [
        parrafo(
          'Estos términos se rigen por las leyes del Perú. Nada de lo que dicen limita tus derechos como consumidor, que están en el Código de Protección y Defensa del Consumidor (Ley N.º\u00a029571).',
        ),
        parrafo(
          'Puedes reclamarnos directamente, usar el ',
          libro,
          ', acudir al INDECOPI o al juez que corresponda. No te pedimos renunciar a ningún derecho ni te obligamos a ir a un arbitraje.',
        ),
      ],
    },
  ]

  return {
    titulo: 'Términos y condiciones',
    bajada: 'Las condiciones de tu compra en RR Boxing: quién vende, cómo se pide, precios, envíos, cambios, clases y cómo reclamar.',
    version: VERSION.terminos,
    vigenteDesde: VIGENTE_DESDE,
    secciones,
  }
}
