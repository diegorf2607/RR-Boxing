import type { Metadata } from 'next'
import LegalPageShell from '@/components/LegalPageShell'
import Documento from '@/components/legal/Documento'
import { empresa } from '@/shared/lib/empresa'
import { cambios } from '@/shared/legal/cambios'

export const metadata: Metadata = {
  title: 'Cambios y devoluciones',
  description:
    'Si tu producto de RR Boxing llega fallado, dañado o equivocado, tú eliges cambio o devolución. Cambios por otro motivo y devolución del dinero.',
  alternates: { canonical: '/reembolso' },
}

export default function ReembolsoPage() {
  return (
    <LegalPageShell>
      <Documento doc={cambios(empresa())} />
    </LegalPageShell>
  )
}
