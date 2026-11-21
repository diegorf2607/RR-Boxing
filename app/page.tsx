import type { Metadata } from 'next'
import MainNav from '@/components/MainNav'
import PortadaVideo from '@/components/PortadaVideo'
import FranjaCombo from '@/components/FranjaCombo'
import StoreClient from '@/features/store/StoreClient'
import ClaseDestacada from '@/components/ClaseDestacada'
import ClassesPromoSection from '@/components/ClassesPromoSection'
import SocialProof from '@/components/SocialProof'
import StoreFAQSection from '@/components/StoreFAQSection'
import Footer from '@/components/Footer'
import { claseVigente } from '@/shared/lib/clase-virtual'
import { IMAGEN_COMPARTIR } from '@/shared/config/imagen-compartir'
import { pagoEnLineaActivo } from '@/shared/config/pagos'
import { textoTarifas } from '@/shared/config/envios'
import { LISTA_ENVIOS } from '@/shared/lib/cart-checkout'

export const metadata: Metadata = {
  title: { absolute: 'RR Boxing: tienda de boxeo y clases 1 a 1' },
  description:
    'Tienda oficial de RR Boxing. Equipamiento de boxeo y clases personalizadas 1 a 1: escríbenos y te contamos cómo son y cuánto cuestan.',
  openGraph: {
    title: 'RR Boxing: tienda de boxeo y clases 1 a 1',
    description: 'Equipamiento de boxeo y clases personalizadas 1 a 1 de RR Boxing.',
    type: 'website',
    images: [IMAGEN_COMPARTIR],
  },
}

// La sección de la clase del 28 de noviembre se apaga sola: la página se rehace cada hora.
export const revalidate = 3600

/**
 * El inicio, en el orden de la maqueta «Tienda deportiva»: la portada con video, la franja del −10%, la tienda
 * (productos y combos en una grilla), las fotos reales («Así se ven puestos»), la clase virtual gratis mientras no
 * haya pasado, las clases 1 a 1, los seguidores y las preguntas frecuentes.
 */
export default function Home() {
  return (
    <>
      <MainNav />
      <main className="bg-white text-tinta">
        <PortadaVideo />
        <FranjaCombo />
        <StoreClient />
        {claseVigente() && <ClaseDestacada />}
        <ClassesPromoSection />
        <SocialProof />
        <StoreFAQSection pagoEnLinea={pagoEnLineaActivo()} tarifas={textoTarifas(LISTA_ENVIOS)} />
      </main>
      <Footer />
    </>
  )
}
