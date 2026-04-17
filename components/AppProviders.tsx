'use client'

import AlertBanner from '@/components/AlertBanner'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import { ModalProvider } from '@/components/ModalProvider'
import { CountryProvider } from '@/features/country/CountryProvider'
import { CartProvider } from '@/features/cart/CartProvider'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <AlertBanner />
      <CountryProvider>
        <CartProvider>
          {children}
          <FloatingWhatsApp />
        </CartProvider>
      </CountryProvider>
    </ModalProvider>
  )
}
