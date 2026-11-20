import { redirect } from 'next/navigation'
import MainNav from '@/components/MainNav'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/shared/lib/auth'
import { getAdminProducts } from '@/shared/lib/data-store'
import { diaIso } from '@/shared/lib/plazos'
import { getPriceForCountry } from '@/features/store/pricing'
import FormularioVenta, { type ProductoVenta } from './FormularioVenta'

// Registrar a mano una venta que se cerró fuera de la web (por WhatsApp, en persona…): queda como pedido pagado.

export const dynamic = 'force-dynamic'

export default async function AdminVentasPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  let productos: ProductoVenta[] = []
  let error = false
  try {
    const catalogo = await getAdminProducts()
    productos = catalogo
      // Los que están a la venta primero; los borradores e inactivos también se pueden registrar
      .sort((a, b) => Number(b.listingStatus === 'active' && b.active) - Number(a.listingStatus === 'active' && a.active))
      .map((p) => ({
        id: p.id,
        nombre: p.name,
        precio: getPriceForCountry(p, 'PE')?.amount ?? 0,
        comboEligible: p.comboEligible !== false,
        aLaVenta: p.active && p.listingStatus === 'active',
      }))
  } catch {
    error = true
  }

  return (
    <main className="min-h-screen bg-dark">
      <MainNav />
      <section className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-[240px_1fr]">
        <AdminNav />
        <div className="min-w-0">
          <h1 className="mb-2 text-4xl font-bold">Registrar una venta</h1>
          <p className="mb-6 max-w-2xl text-sm text-neutral-light">
            Para las ventas que se cierran por WhatsApp o en persona. Queda como un pedido ya pagado, con su forma de pago y,
            si lo sabes, de dónde llegó el cliente: así cuenta en el panel y en el resumen de cada mañana.
          </p>
          {error ? (
            <p className="text-sm text-red-400">No se pudo leer el catálogo. Recarga la página.</p>
          ) : (
            <FormularioVenta productos={productos} hoy={diaIso(new Date())} />
          )}
        </div>
      </section>
    </main>
  )
}
