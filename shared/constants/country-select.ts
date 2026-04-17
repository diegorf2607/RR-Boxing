import type { CountryCode } from '@/shared/types/commerce'

/** Países con checkout y precios activos en la tienda. El resto se muestra en el selector deshabilitado. */
export const COUNTRIES_WITH_STORE: CountryCode[] = ['PE']

export type CountrySelectOption = {
  value: string
  label: string
  /** Si false, se muestra en la lista pero no se puede elegir (próximamente). */
  enabled: boolean
}

export type CountrySelectGroup = {
  groupLabel: string
  options: CountrySelectOption[]
}

/** Misma estructura visual que la versión anterior: regiones y códigos ISO; solo Perú operativo por ahora. */
export const COUNTRY_SELECT_GROUPS: CountrySelectGroup[] = [
  {
    groupLabel: 'Sudamérica',
    options: [
      { value: 'AR', label: 'Argentina (AR)', enabled: false },
      { value: 'BO', label: 'Bolivia (BO)', enabled: false },
      { value: 'CL', label: 'Chile (CL)', enabled: false },
      { value: 'CO', label: 'Colombia (CO)', enabled: false },
      { value: 'EC', label: 'Ecuador (EC)', enabled: false },
      { value: 'GY', label: 'Guyana (GY)', enabled: false },
      { value: 'PY', label: 'Paraguay (PY)', enabled: false },
      { value: 'PE', label: 'Perú (PE)', enabled: true },
      { value: 'SR', label: 'Surinam (SR)', enabled: false },
      { value: 'UY', label: 'Uruguay (UY)', enabled: false },
      { value: 'VE', label: 'Venezuela (VE)', enabled: false },
    ],
  },
  {
    groupLabel: 'México',
    options: [{ value: 'MX', label: 'México (MX)', enabled: false }],
  },
  {
    groupLabel: 'Centroamérica (USD)',
    options: [{ value: 'CAM', label: 'Centroamérica (USD) (CAM)', enabled: false }],
  },
  {
    groupLabel: 'Estados Unidos',
    options: [{ value: 'US', label: 'Estados Unidos (US)', enabled: false }],
  },
]

export function isCommerceCountry(value: string): value is CountryCode {
  return COUNTRIES_WITH_STORE.includes(value as CountryCode)
}
