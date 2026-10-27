import type { DayKey } from './lib/dates'

export const CATEGORIES = ['Laptops', 'Phones', 'Audio', 'Wearables', 'Accessories'] as const
export type Category = (typeof CATEGORIES)[number]

export const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'] as const
export type Region = (typeof REGIONS)[number]

export const ORDER_STATUSES = ['completed', 'shipped', 'pending', 'cancelled', 'refunded'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_METHODS = ['Credit card', 'PayPal', 'Bank transfer', 'Digital wallet'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const CHANNELS = ['Web', 'Mobile app', 'Marketplace', 'Retail'] as const
export type Channel = (typeof CHANNELS)[number]

export interface Product {
  id: string
  name: string
  category: Category
  /** List price in USD. */
  price: number
}

export interface Order {
  id: string
  /** ISO timestamp of when the order was placed. */
  date: string
  /** Local calendar day of `date`, precomputed for fast range filtering. */
  day: DayKey
  customer: string
  email: string
  productId: string
  product: string
  category: Category
  region: Region
  channel: Channel
  paymentMethod: PaymentMethod
  quantity: number
  unitPrice: number
  /** Discount as a fraction, e.g. 0.1 = 10 %. */
  discount: number
  /** Price after discount, before shipping and tax. */
  subtotal: number
  shipping: number
  tax: number
  /** Grand total charged to the customer. */
  amount: number
  status: OrderStatus
}

/** Inclusive range of local calendar days. */
export interface DateRange {
  start: DayKey
  end: DayKey
}
