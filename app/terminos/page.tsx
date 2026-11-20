import LegalPageShell from '@/components/LegalPageShell'

export const metadata = {
  title: 'Términos y condiciones',
  description: 'Términos de uso del sitio y la tienda oficial RRBOXING.',
}

export default function TerminosPage() {
  return (
    <LegalPageShell title="Términos y condiciones">
      <p>
        Al usar el sitio y la tienda de RRBOXING aceptas estas condiciones. El contenido formativo, la marca y los
        materiales comerciales son propiedad de RRBOXING.
      </p>
      <p>
        Los precios, envíos y disponibilidad pueden variar según país. Por ahora la tienda no cobra en línea: los
        productos se piden por WhatsApp y ahí te decimos cómo pagar.
      </p>
      <p>
        Para consultas sobre pedidos o clases personalizadas, utiliza los canales indicados en el sitio o agenda en la
        sección de consultoría.
      </p>
    </LegalPageShell>
  )
}
