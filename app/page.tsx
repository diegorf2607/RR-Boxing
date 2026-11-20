import type { Metadata } from 'next'
import MainNav from '@/components/MainNav'
import StoreHero from '@/components/StoreHero'
import StoreClient from '@/features/store/StoreClient'
import StoreFAQSection from '@/components/StoreFAQSection'
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

/**
 * El inicio con la línea A («Oscuro sobrio», maqueta en RR\rrboxing-tienda-auditoria\opciones-visuales\opcion-a.html):
 * la portada fija (sin carrusel), la tienda con sus combos, las clases (1 a 1 y la clase virtual mientras esté
 * vigente) y las preguntas. La barra y el pie van fuera de <main> para que existan las regiones de cabecera y pie.
 */
export default function Home() {
  return (
    <>
      <MainNav />
      <main className="min-h-screen bg-dark">
        <StoreHero />
        <StoreClient />
        <ClassesPromoSection>{claseVigente() ? <ClaseDestacada /> : null}</ClassesPromoSection>
        <StoreFAQSection pagoEnLinea={pagoEnLineaActivo()} tarifas={textoTarifas(LISTA_ENVIOS)} />
      </main>
      <Footer />
    </>
  )
}
