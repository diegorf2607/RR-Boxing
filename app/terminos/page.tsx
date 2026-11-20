import type { Metadata } from 'next'
import LegalPageShell from '@/components/LegalPageShell'
import Documento from '@/components/legal/Documento'
import { empresa } from '@/shared/lib/empresa'
import { terminos } from '@/shared/legal/terminos'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description:
    'Condiciones de compra en RR Boxing: quién vende, cómo se pide por WhatsApp, precios, envíos dentro del Perú, cambios, clases y cómo reclamar.',
  alternates: { canonical: '/terminos' },
}

export default function TerminosPage() {
  return (
    <LegalPageShell>
      <Documento doc={terminos(empresa())} />
    </LegalPageShell>
  )
}
