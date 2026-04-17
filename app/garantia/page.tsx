import LegalPageShell from '@/components/LegalPageShell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Garantía de compra | RRBOXING',
  description:
    'Condiciones de garantía, producto original, plazos, envíos y devoluciones de la tienda oficial RRBOXING.',
}

export default function GarantiaPage() {
  return (
    <LegalPageShell title="Garantía de compra RRBOXING">
      <p className="text-sm text-neutral">
        <strong className="text-white">Última actualización:</strong> documento informativo. Para conflictos
        prevalecen los textos legales de <a href="/terminos">Términos y condiciones</a> y{' '}
        <a href="/reembolso">Política de reembolso</a> vigentes al momento de la compra.
      </p>

      <h2 className="!mt-10 text-xl font-bold text-white">1. Alcance</h2>
      <p>
        Esta garantía aplica a productos adquiridos a través de la tienda oficial RRBOXING en este sitio web, enviados
        dentro del territorio y condiciones de envío indicadas en el checkout.
      </p>

      <h2 className="!mt-8 text-xl font-bold text-white">2. Producto original</h2>
      <p>
        Comercializamos equipamiento y artículos de marca RRBOXING por el canal oficial. Si detectáramos un error de
        preparación del pedido (referencia equivocada frente a lo comprado), coordinamos la corrección conforme a
        nuestra política de cambios y a la disponibilidad de stock.
      </p>

      <h2 className="!mt-8 text-xl font-bold text-white">3. Garantía de 30 días (defectos y transporte)</h2>
      <p>
        Dentro de los <strong className="text-white">30 días calendario</strong> siguientes a la fecha de entrega
        registrada o, en su defecto, a la recepción material del paquete, puedes reportar:
      </p>
      <ul className="list-inside list-disc space-y-2 pl-1">
        <li>Defectos de fabricación que impidan el uso razonable del producto según su destino.</li>
        <li>Daños evidentes causados durante el transporte hasta tu dirección (debes conservar el empaque cuando sea
          posible y enviar fotografías claras del producto y del embalaje).</li>
      </ul>
      <p>
        Debes contactarnos indicando <strong className="text-white">número de pedido</strong>, descripción del
        problema y, cuando aplique, fotografías. Evaluaremos cada caso y te responderemos por el mismo canal.
      </p>

      <h2 className="!mt-8 text-xl font-bold text-white">4. Pago seguro</h2>
      <p>
        Los pagos con tarjeta se procesan mediante <strong className="text-white">Stripe</strong>. Los datos sensibles
        de la tarjeta no transitan ni se almacenan en nuestros servidores. Cualquier otra forma de pago que se habilite
        en el futuro se anunciará en el checkout.
      </p>

      <h2 className="!mt-8 text-xl font-bold text-white">5. Envíos y seguimiento</h2>
      <p>
        El método de envío, plazo y coste se eligen en el checkout según las opciones publicadas para Perú. Recibirás
        confirmación por correo electrónico con los datos del pedido. El seguimiento logístico depende del operador;
        te indicaremos los pasos disponibles cuando corresponda.
      </p>

      <h2 className="!mt-8 text-xl font-bold text-white">6. Cambios y devoluciones</h2>
      <p>
        Las solicitudes de cambio o devolución por desistimiento o talla, cuando la ley y nuestras políticas lo
        permitan, requieren producto <strong className="text-white">sin uso</strong>, en condiciones comerciales
        razonables y, salvo indicación distinta, <strong className="text-white">empaque original</strong>. La gestión se
        realiza por los canales indicados en el correo de confirmación del pedido o, si tienes cuenta, desde el área de
        usuario cuando esté disponible.
      </p>

      <h2 className="!mt-8 text-xl font-bold text-white">7. Contenido digital (PDF, clase grabada)</h2>
      <p>
        Los complementos digitales opcionales en el checkout pueden tener condiciones distintas (naturaleza del
        contenido descargable o en streaming). Las condiciones específicas se muestran al momento de la compra y, en
        caso de conflicto, se complementan con la política de reembolso aplicable a bienes digitales.
      </p>

      <h2 className="!mt-8 text-xl font-bold text-white">8. Contacto</h2>
      <p>
        Para temas de pedido: responde al correo de confirmación o escríbenos por{' '}
        <a href="https://instagram.com/rrboxingperu" target="_blank" rel="noopener noreferrer">
          Instagram @rrboxingperu
        </a>{' '}
        con tu número de orden. Para clases personalizadas, utiliza la sección de consulta del sitio.
      </p>
    </LegalPageShell>
  )
}
