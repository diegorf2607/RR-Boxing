import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import { empresa } from '@/shared/lib/empresa'
import SettingsAdminClient, { type VariableEntorno } from '@/features/admin/SettingsAdminClient'

/** Leída en el servidor en cada visita: nunca sale el valor, solo si está puesta. */
const valor = (nombre: string) => process.env[nombre]?.trim() ?? ''
const puesta = (nombre: string): VariableEntorno['estado'] => (valor(nombre) ? 'puesta' : 'falta')

/**
 * Las variables que la tienda lee de verdad (process.env en app, components, features y shared), con para qué
 * sirve cada una. Se configuran en Vercel (Settings → Environment Variables) y después se vuelve a publicar.
 */
function variablesDeEntorno(): VariableEntorno[] {
  const e = empresa()
  const validada = (nombre: string, ok: boolean): VariableEntorno['estado'] =>
    !valor(nombre) ? 'falta' : ok ? 'puesta' : 'invalida'
  const authSecret = valor('AUTH_SECRET')

  return [
    {
      nombre: 'NEXT_PUBLIC_SUPABASE_URL',
      para: 'La dirección del proyecto de Supabase, la base de datos de la tienda.',
      estado: puesta('NEXT_PUBLIC_SUPABASE_URL'),
    },
    {
      nombre: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      para: 'La clave pública de Supabase (también sirve NEXT_PUBLIC_SUPABASE_ANON_KEY).',
      estado: valor('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || valor('NEXT_PUBLIC_SUPABASE_ANON_KEY') ? 'puesta' : 'falta',
    },
    {
      nombre: 'SUPABASE_SERVICE_ROLE_KEY',
      para: 'La clave de servicio de Supabase: solo el servidor la usa para guardar pedidos, inscripciones y hojas del Libro de Reclamaciones.',
      estado: puesta('SUPABASE_SERVICE_ROLE_KEY'),
    },
    {
      nombre: 'NEXT_PUBLIC_APP_URL',
      para: 'La dirección de la web (https://www.rrboxing.com): Mercado Pago vuelve ahí después de pagar y los correos la usan en sus enlaces.',
      estado: puesta('NEXT_PUBLIC_APP_URL'),
    },
    {
      nombre: 'MERCADOPAGO_ACCESS_TOKEN',
      para: 'El Access Token de producción de Mercado Pago. Con ella, el checkout ofrece pagar en línea; sin ella, el pago se coordina por WhatsApp.',
      estado: puesta('MERCADOPAGO_ACCESS_TOKEN'),
    },
    {
      nombre: 'MERCADOPAGO_WEBHOOK_SECRET',
      para: 'Opcional: la clave secreta de los Webhooks de Mercado Pago, para revisar que cada aviso de pago venga de Mercado Pago.',
      estado: puesta('MERCADOPAGO_WEBHOOK_SECRET'),
    },
    {
      nombre: 'RESEND_API_KEY',
      para: 'La clave de Resend para mandar correos: la confirmación del pedido, el aviso a la tienda, la copia de la hoja de reclamación y el resumen diario. Sin ella no sale ningún correo.',
      estado: puesta('RESEND_API_KEY'),
    },
    {
      nombre: 'RESEND_FROM_EMAIL',
      para: 'El remitente de los correos, de un dominio verificado en Resend (por ejemplo «RR Boxing <hola@rrboxing.com>»).',
      estado: puesta('RESEND_FROM_EMAIL'),
    },
    {
      nombre: 'CONTACTO_CORREO',
      para: 'El correo de atención: sale en el pie y en los textos legales, y recibe los avisos de pedidos, reclamos y el resumen diario.',
      estado: validada('CONTACTO_CORREO', !!e.correo),
    },
    {
      nombre: 'CONTACTO_WHATSAPP',
      para: 'Opcional: el WhatsApp de atención de los textos legales. Si falta, se usa el WhatsApp de la tienda.',
      estado: puesta('CONTACTO_WHATSAPP'),
    },
    {
      nombre: 'EMPRESA_RAZON_SOCIAL',
      para: 'Quién vende, como figura en SUNAT. Mientras falte, la web dice «por confirmar».',
      estado: puesta('EMPRESA_RAZON_SOCIAL'),
    },
    {
      nombre: 'EMPRESA_RUC',
      para: 'Los 11 dígitos del RUC (se revisa el dígito verificador). Mientras falte o no sea válido, la web dice «por confirmar».',
      estado: validada('EMPRESA_RUC', !!e.ruc),
    },
    {
      nombre: 'EMPRESA_DOMICILIO',
      para: 'El domicilio fiscal. Mientras falte, la web dice «por confirmar».',
      estado: puesta('EMPRESA_DOMICILIO'),
    },
    {
      nombre: 'CRON_SECRET',
      para: 'La clave del resumen diario de las 8 a. m. (Vercel Cron). Sin ella, ese correo no sale.',
      estado: puesta('CRON_SECRET'),
    },
    {
      nombre: 'NEXT_PUBLIC_ANALITICA',
      para: 'En 1 prende Vercel Web Analytics, que cuenta visitas sin cookies. Además hay que activar Web Analytics en el proyecto de Vercel.',
      estado: validada('NEXT_PUBLIC_ANALITICA', valor('NEXT_PUBLIC_ANALITICA') === '1'),
    },
    {
      nombre: 'GOOGLE_SITE_VERIFICATION',
      para: 'El código de verificación de Google Search Console (solo el valor de content).',
      estado: puesta('GOOGLE_SITE_VERIFICATION'),
    },
    {
      nombre: 'AUTH_SECRET',
      para: 'Opcional: firma la sesión del panel (32 caracteres o más, al azar). Si falta, se usa la clave de servicio de Supabase.',
      estado: !authSecret ? 'falta' : authSecret.length >= 32 ? 'puesta' : 'invalida',
    },
    {
      nombre: 'NEXT_PUBLIC_WHATSAPP_PHONE',
      para: 'Opcional: cambia el número de WhatsApp de la tienda (solo dígitos, con el 51). Si falta, se usa el de siempre.',
      estado: puesta('NEXT_PUBLIC_WHATSAPP_PHONE'),
    },
    {
      nombre: 'NEXT_PUBLIC_POST_PURCHASE_VIDEO_URL',
      para: 'Opcional: el video de YouTube de /bonus/clase-inicial. Sin ella, esa página no muestra video.',
      estado: puesta('NEXT_PUBLIC_POST_PURCHASE_VIDEO_URL'),
    },
  ]
}

export default async function AdminSettingsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <main className="min-h-screen bg-dark">
      <section className="container mx-auto grid grid-cols-1 gap-4 px-4 pb-10 pt-1 md:grid-cols-[240px_1fr] md:gap-6 md:py-10">
        <AdminNav />
        <div>
          <h1 className="mb-6 font-heading text-4xl leading-none text-white md:text-5xl">Configuración ecommerce</h1>
          <SettingsAdminClient variables={variablesDeEntorno()} />
        </div>
      </section>
    </main>
  )
}
