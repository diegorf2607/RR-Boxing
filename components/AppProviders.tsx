'use client'

import { ModalProvider } from '@/components/ModalProvider'
import { CountryProvider } from '@/features/country/CountryProvider'
import { CartProvider } from '@/features/cart/CartProvider'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <CountryProvider>
        <CartProvider>{children}</CartProvider>
      </CountryProvider>
    </ModalProvider>
  )
}
