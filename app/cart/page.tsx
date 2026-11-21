import MainNav from '@/components/MainNav'
import CartClient from '@/features/cart/CartClient'

export default function CartPage() {
  return (
    <>
      <MainNav />
      <main className="min-h-[70vh]">
        <CartClient />
      </main>
    </>
  )
}
