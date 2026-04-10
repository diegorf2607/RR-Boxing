import MainNav from '@/components/MainNav'
import StoreClient from '@/features/store/StoreClient'

export const metadata = {
  title: 'Tienda Oficial RRBOXING',
  description: 'Equipamiento y accesorios oficiales para entrenar con disciplina y alto rendimiento.',
}

export default function StorePage() {
  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <StoreClient />
    </main>
  )
}
