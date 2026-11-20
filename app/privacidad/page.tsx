import type { Metadata } from 'next'
import LegalPageShell from '@/components/LegalPageShell'
import Documento from '@/components/legal/Documento'
import { empresa } from '@/shared/lib/empresa'
import { privacidad } from '@/shared/legal/privacidad'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Qué datos tuyos usa RR Boxing, para qué, dónde se guardan, con quién se comparten y cómo ejercer tus derechos (Ley N.º 29733).',
  alternates: { canonical: '/privacidad' },
}

export default function PrivacidadPage() {
  return (
    <LegalPageShell>
      <Documento doc={privacidad(empresa())} />
    </LegalPageShell>
  )
}
