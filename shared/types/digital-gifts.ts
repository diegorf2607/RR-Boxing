export type DigitalGiftType = 'pdf' | 'video' | 'link'

export interface DigitalGift {
  id: string
  name: string
  giftType: DigitalGiftType
  description: string
  contentUrl: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type OrderGiftSendChannel = 'resend' | 'manual'

export interface OrderGiftSendEvent {
  id: string
  orderId: string
  createdAt: string
  recipientEmail: string
  isResend: boolean
  channel: OrderGiftSendChannel
  success: boolean
  providerMessageId: string | null
  errorText: string | null
  bodyPreview: string | null
  adminNote: string | null
}
