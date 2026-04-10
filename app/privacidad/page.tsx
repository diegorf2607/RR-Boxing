import LegalPageShell from '@/components/LegalPageShell'

export const metadata = {
  title: 'Política de privacidad | RRBOXING',
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
        Los pagos los gestiona Stripe según su propia política de privacidad. No almacenamos el número completo de tu
        tarjeta en nuestros servidores.
      </p>
      <p>
        Puedes solicitar información sobre tus datos contactando al equipo RRBOXING a través de los medios oficiales de
        la marca.
      </p>
    </LegalPageShell>
  )
}
