import type { Metadata } from 'next'
import MainNav from '@/components/MainNav'
import StoreHeroCarousel from '@/components/StoreHeroCarousel'
import StoreClient from '@/features/store/StoreClient'
import StoreComboSection from '@/components/StoreComboSection'
import StoreAboutSection from '@/components/StoreAboutSection'
import StoreFAQSection from '@/components/StoreFAQSection'
import SocialProof from '@/components/SocialProof'
import ClassesPromoSection from '@/components/ClassesPromoSection'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Tienda oficial RRBOXING | Equipamiento y marca',
  description:
    'Tienda oficial RRBOXING. Equipamiento premium y acceso a clases personalizadas 1 a 1. La propuesta y el precio de entrenamiento se definen en tu llamada.',
  openGraph: {
    title: 'RRBOXING — Tienda oficial',
    description: 'Equipamiento oficial y clases personalizadas. Precio de entrenamiento en la llamada.',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <StoreHeroCarousel />
      <StoreComboSection />
      <StoreClient />
      <StoreAboutSection />
      <SocialProof />
      <StoreFAQSection />
      <ClassesPromoSection />
      <Footer />
    </main>
  )
}
