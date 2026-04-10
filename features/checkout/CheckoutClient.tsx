'use client'

import { useMemo, useState } from 'react'
import { useCart } from '@/features/cart/CartProvider'
import { useCountry } from '@/features/country/CountryProvider'

export default function CheckoutClient() {
  const { items } = useCart()
  const { country } = useCountry()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const disabled = useMemo(() => !email || !name || !address || items.length === 0, [email, name, address, items.length])

  const handleCheckout = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, address, country, items }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo iniciar el pago. Revisa Stripe y variables de entorno.')
        return
      }
      if (data.url) window.location.href = data.url
      else setError('No se recibió la URL de Stripe.')
    } catch {
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-4xl font-bold">Checkout profesional</h1>
      <div className="space-y-4 rounded-2xl border border-dark-300 bg-dark-100 p-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre completo"
          className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electronico"
          type="email"
          className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
        />
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Direccion de entrega"
          className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={handleCheckout}
          disabled={disabled || loading}
          className="w-full rounded-lg bg-accent px-4 py-3 font-bold text-dark disabled:opacity-60"
        >
          {loading ? 'Procesando...' : 'Pagar con Stripe'}
        </button>
      </div>
    </section>
  )
}
