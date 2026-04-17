'use client'

import type { CountryCode } from '@/shared/types/commerce'
import { COUNTRY_SELECT_GROUPS, isCommerceCountry } from '@/shared/constants/country-select'
import { getCountryConfig } from '@/shared/lib/country'

type Props = {
  value: CountryCode
  onChange: (code: CountryCode) => void
  id?: string
  className?: string
}

function optionLabel(opt: { value: string; label: string; enabled: boolean }): string {
  if (!opt.enabled) return `${opt.label} — próximamente`
  if (!isCommerceCountry(opt.value)) return opt.label
  const c = getCountryConfig(opt.value as CountryCode)
  return `${c.name} (${opt.value}) — ${c.currency}`
}

/** Lista regional completa; solo países habilitados pueden elegirse (hoy: Perú). */
export default function CountrySelect({ value, onChange, id, className }: Props) {
  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={(e) => {
        const v = e.target.value
        if (isCommerceCountry(v)) onChange(v as CountryCode)
      }}
      aria-label="País o región"
    >
      {COUNTRY_SELECT_GROUPS.map((g) => (
        <optgroup key={g.groupLabel} label={g.groupLabel}>
          {g.options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={!opt.enabled}>
              {optionLabel(opt)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
