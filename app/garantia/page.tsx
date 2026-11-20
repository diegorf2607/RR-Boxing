import type { Metadata } from 'next'
import LegalPageShell from '@/components/LegalPageShell'
import Documento from '@/components/legal/Documento'
import { empresa } from '@/shared/lib/empresa'
import { GARANTIA_DIAS } from '@/shared/legal/politicas'
import { garantia } from '@/shared/legal/cambios'

export const metadata: Metadata = {
  title: 'Garantía de compra',
  description: `Garantía de compra de ${GARANTIA_DIAS} días de los productos de RR Boxing, sin perder la garantía legal, y cómo pedirla.`,
  alternates: { canonical: '/garantia' },
}

export default function GarantiaPage() {
  return (
    <LegalPageShell>
      <Documento doc={garantia(empresa())} />
    </LegalPageShell>
  )
}
