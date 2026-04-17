'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CountryCode } from '@/shared/types/commerce'
import { DEFAULT_COUNTRY } from '@/shared/lib/country'
import { COUNTRIES_WITH_STORE, isCommerceCountry } from '@/shared/constants/country-select'

interface CountryContextValue {
  country: CountryCode
  setCountry: (country: CountryCode) => void
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined)

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>(DEFAULT_COUNTRY)

  useEffect(() => {
    const stored = localStorage.getItem('rrboxing_country') as CountryCode | null
    if (stored && isCommerceCountry(stored)) {
      setCountryState(stored)
    } else if (stored && !isCommerceCountry(stored)) {
      setCountryState(DEFAULT_COUNTRY)
      localStorage.setItem('rrboxing_country', DEFAULT_COUNTRY)
    }
  }, [])

  const setCountry = (nextCountry: CountryCode) => {
    if (!COUNTRIES_WITH_STORE.includes(nextCountry)) return
    setCountryState(nextCountry)
    localStorage.setItem('rrboxing_country', nextCountry)
  }

  const value = useMemo(() => ({ country, setCountry }), [country])

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
}

export function useCountry() {
  const context = useContext(CountryContext)
  if (!context) throw new Error('useCountry must be used within CountryProvider')
  return context
}
