import AlertBanner from '@/components/AlertBanner'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import VideoSection from '@/components/VideoSection'
import Benefits from '@/components/Benefits'
import SocialProof from '@/components/SocialProof'
import Testimonials from '@/components/Testimonials'
import Pricing from '@/components/Pricing'
import HighTicket from '@/components/HighTicket'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Alert Banner - Fixed at top */}
      <AlertBanner />
      
      {/* Header - Sticky navigation */}
      <Header />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Video Section - What you'll learn */}
      <section id="video">
        <VideoSection />
      </section>
      
      {/* Benefits Section - Learn from zero */}
      <section id="benefits">
        <Benefits />
      </section>
      
      {/* Social Proof Section - Trust indicators */}
      <section id="social">
        <SocialProof />
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials">
        <Testimonials />
      </section>
      
      {/* Pricing Section */}
      <Pricing />

      {/* High Ticket - Clases Personalizadas */}
      <HighTicket />
      
      {/* Final CTA Section */}
      <FinalCTA />
      
      {/* Footer */}
      <Footer />
    </main>
  )
}
