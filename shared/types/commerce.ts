/** Sudamérica (sin Brasil) + México + Centroamérica (USD) + EE.UU. */
export type CountryCode =
  | 'AR'
  | 'BO'
  | 'CL'
  | 'CO'
  | 'EC'
  | 'GY'
  | 'PY'
  | 'PE'
  | 'SR'
  | 'UY'
  | 'VE'
  | 'MX'
  | 'CAM'
  | 'US'

export type CurrencyCode =
  | 'ARS'
  | 'BOB'
  | 'CLP'
  | 'COP'
  | 'GYD'
  | 'MXN'
  | 'PEN'
  | 'PYG'
  | 'SRD'
  | 'USD'
  | 'UYU'

export interface ProductPrice {
  country: CountryCode
  currency: CurrencyCode
  amount: number
  compareAtAmount?: number
}

export interface ProductVariant {
  id: string
  name: string
  value: string
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  category: string
  featured?: boolean
  imageUrls: string[]
  prices: ProductPrice[]
  stock: number
  active: boolean
  rating?: number
  reviewCount?: number
  variants?: ProductVariant[]
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitAmount: number
  currency: CurrencyCode
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled'

export interface Order {
  id: string
  customerEmail: string
  country: CountryCode
  items: OrderItem[]
  totalAmount: number
  currency: CurrencyCode
  status: OrderStatus
  createdAt: string
  stripeSessionId?: string
}

export interface UserSession {
  sub: string
  email: string
  role: 'admin' | 'customer'
  name?: string
}
