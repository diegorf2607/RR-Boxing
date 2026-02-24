import AlertBanner from '@/components/AlertBanner'
import Header from '@/components/Header'
import VideoGatedCalendly from '@/components/VideoGatedCalendly'
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
      <AlertBanner />
      <Header />
      <VideoGatedCalendly />

      {/* 3) Benefits */}
      <section id="benefits">
        <Benefits />
      </section>

      {/* 4) Social Proof */}
      <section id="social">
        <SocialProof />
      </section>

      {/* 5) Testimonials */}
      <section id="testimonials">
        <Testimonials />
      </section>

      {/* 6) Pricing */}
      <Pricing />

      {/* 7) High Ticket */}
      <HighTicket />

      {/* 8) Final CTA */}
      <FinalCTA />

      {/* 9) Footer */}
      <Footer />
    </main>
  )
}
