import MainNav from '@/components/MainNav'
import CartClient from '@/features/cart/CartClient'

export default function CartPage() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <CartClient />
    </main>
  )
}
