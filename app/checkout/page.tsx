import MainNav from '@/components/MainNav'
import CheckoutClient from '@/features/checkout/CheckoutClient'

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <CheckoutClient />
    </main>
  )
}
