import type { Metadata } from 'next'
import MainNav from '@/components/MainNav'
import StoreHeroCarousel from '@/components/StoreHeroCarousel'
import StoreClient from '@/features/store/StoreClient'
import StoreComboSection from '@/components/StoreComboSection'
import StoreAboutSection from '@/components/StoreAboutSection'
import StoreFAQSection from '@/components/StoreFAQSection'
import SocialProof from '@/components/SocialProof'
import ClassesPromoSection from '@/components/ClassesPromoSection'
import ClaseDestacada from '@/components/ClaseDestacada'
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

// Primero lo que se vende: un carrusel más bajo, el catálogo (con su precio a la vista), la clase gratis y los combos.
export default function Home() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <StoreHeroCarousel />
      <StoreClient />
      {claseVigente() && <ClaseDestacada />}
      <StoreComboSection />
      <StoreAboutSection />
      <SocialProof />
      <StoreFAQSection pagoEnLinea={pagoEnLineaActivo()} tarifas={textoTarifas(LISTA_ENVIOS)} />
      <ClassesPromoSection />
      <Footer />
    </main>
  )
}
