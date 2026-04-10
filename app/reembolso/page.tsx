import LegalPageShell from '@/components/LegalPageShell'

export const metadata = {
  title: 'Política de reembolso | RRBOXING',
  description: 'Criterios generales de reembolsos y cambios en la tienda RRBOXING.',
}

export default function ReembolsoPage() {
  return (
    <LegalPageShell title="Política de reembolso">
      <p>
        Los reembolsos de productos físicos se evalúan caso por caso cuando el artículo llega defectuoso o no
        corresponde al pedido, siempre en empaque original y sin uso.
      </p>
      <p>
        Los servicios digitales o asesorías pueden tener condiciones específicas según el producto; revisa la
        descripción al momento de la compra.
      </p>
      <p>
        Para iniciar un reembolso, responde al correo de confirmación del pedido o escribe desde tu cuenta indicando el
        número de pedido.
      </p>
    </LegalPageShell>
  )
}
