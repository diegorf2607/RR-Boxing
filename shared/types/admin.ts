export type AdminNotificationSeverity = 'info' | 'warning' | 'critical'

export type AdminNotificationType =
  | 'new_order'
  | 'order_pending_payment'
  | 'order_paid'
  | 'low_stock'
  | 'product_no_primary_image'
  | 'product_out_of_stock'
  | 'product_incomplete'
  | 'order_manual_review'

export interface AdminNotification {
  id: string
  type: AdminNotificationType
  severity: AdminNotificationSeverity
  title: string
  body: string | null
  link: string | null
  entityType: string | null
  entityId: string | null
  readAt: string | null
  createdAt: string
}

export interface StoreSettings {
  storeName: string
  defaultCurrencyDisplay: string
  lowStockThreshold: number
  supportContactText: string
  checkoutHelperText: string
  storeEnabled: boolean
  updatedAt: string
}
