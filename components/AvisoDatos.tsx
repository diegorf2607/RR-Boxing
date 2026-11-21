// Una línea corta para debajo de cada formulario que pide datos: para qué se usan, dónde se guardan y el enlace a
// la política de privacidad (Ley N.º 29733, art. 18). Sirve en componentes del servidor y del navegador: no lee
// variables del servidor. Se lee sobre blanco (gris oscuro) y sobre negro, dentro de .bg-tinta (gris claro).
//   <AvisoDatos para="mandarte el link de la clase y avisarte si algo cambia" />
import Link from 'next/link'
import { RUTAS } from '@/shared/legal/politicas'

export default function AvisoDatos({
  para,
  // Sin país: la región de los servidores de Supabase está por confirmar (shared/legal/privacidad.ts)
  donde = 'Supabase y Vercel',
  className = '',
}: {
  /** Para qué se usan, a continuación de «Usamos tus datos solo para…» */
  para: string
  /** Dónde se guardan, a continuación de «Se guardan en…» */
  donde?: string
  className?: string
}) {
  return (
    <p className={`text-xs leading-relaxed text-suave [.bg-tinta_&]:text-claro ${className}`}>
      Usamos tus datos solo para {para}. Se guardan en {donde}. Más en la{' '}
      <Link
        href={RUTAS.privacidad}
        className="text-tinta underline underline-offset-2 hover:decoration-2 [.bg-tinta_&]:text-white"
      >
        Política de privacidad
      </Link>
      .
    </p>
  )
}
