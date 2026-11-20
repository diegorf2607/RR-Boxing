import LegalPageShell from '@/components/LegalPageShell'

export const metadata = {
  title: 'Política de privacidad',
  description: 'Cómo RRBOXING trata tus datos cuando navegas o compras en el sitio.',
}

export default function PrivacidadPage() {
  return (
    <LegalPageShell title="Política de privacidad">
      <p>
        Recopilamos los datos necesarios para procesar pedidos, iniciar sesión y mejorar la experiencia (por ejemplo,
        correo, país y datos de envío que nos proporciones en el checkout).
      </p>
      <p>
        Por ahora la tienda no cobra en la web: los pedidos se coordinan por WhatsApp. Cuando un pago se hace con
        Mercado Pago, se hace en su propia página y según su política de privacidad; nosotros no recibimos ni guardamos
        los datos de tu tarjeta.
      </p>
      <p>
        Puedes solicitar información sobre tus datos contactando al equipo RRBOXING a través de los medios oficiales de
        la marca.
      </p>
    </LegalPageShell>
  )
}
