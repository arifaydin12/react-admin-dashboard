import { faker } from '@faker-js/faker/locale/en'
import dayjs from 'dayjs'
import { addDays, toDayKey } from '../lib/dates'
import type { Channel, Order, OrderStatus, PaymentMethod, Product, Region } from '../types'
import { PRODUCTS } from './catalog'

export const DEFAULT_SEED = 20250611
export const DEFAULT_DAYS = 365

export interface GenerateOptions {
  /** Faker seed. The same seed and anchor always give identical orders. */
  seed?: number
  /** Number of days of history, ending on the anchor day. */
  days?: number
  /** "Now". Defaults to the current time. */
  anchor?: Date
  /** Average orders per day at the start of the period. */
  ordersPerDay?: number
}

const WEEKDAY_FACTOR = [0.82, 0.98, 1.05, 1.05, 1.0, 1.12, 0.92] // Sunday first

const REGION_WEIGHTS: { weight: number; value: Region }[] = [
  { weight: 34, value: 'North America' },
  { weight: 28, value: 'Europe' },
  { weight: 24, value: 'Asia Pacific' },
  { weight: 8, value: 'Latin America' },
  { weight: 6, value: 'Middle East & Africa' },
]

const TAX_RATE: Record<Region, number> = {
  'North America': 0.08,
  Europe: 0.2,
  'Asia Pacific': 0.1,
  'Latin America': 0.12,
  'Middle East & Africa': 0.05,
}

const PAYMENT_WEIGHTS: { weight: number; value: PaymentMethod }[] = [
  { weight: 52, value: 'Credit card' },
  { weight: 22, value: 'PayPal' },
  { weight: 10, value: 'Bank transfer' },
  { weight: 16, value: 'Digital wallet' },
]

const CHANNEL_WEIGHTS: { weight: number; value: Channel }[] = [
  { weight: 46, value: 'Web' },
  { weight: 28, value: 'Mobile app' },
  { weight: 16, value: 'Marketplace' },
  { weight: 10, value: 'Retail' },
]

/** Cheaper, more popular items sell more often. */
const PRODUCT_WEIGHT: Record<string, number> = {
  'p-nimbus-14': 8,
  'p-atlas-16': 4,
  'p-breeze-13': 7,
  'p-pulse-x': 10,
  'p-orbit-mini': 9,
  'p-vertex-max': 5,
  'p-echo-buds': 11,
  'p-studio-hp': 6,
  'p-cube-speaker': 6,
  'p-fit-band': 8,
  'p-chrono-watch': 6,
  'p-halo-ring': 3,
  'p-usbc-dock': 6,
  'p-charger-stand': 7,
  'p-keyboard-k2': 5,
  'p-mouse-m3': 6,
}

const round2 = (value: number): number => Math.round(value * 100) / 100

function pickStatus(ageDays: number): OrderStatus {
  const roll = faker.number.float({ min: 0, max: 1 })
  if (roll < 0.05) return 'cancelled'
  if (ageDays > 3 && roll < 0.085) return 'refunded'
  if (ageDays < 2) {
    if (roll < 0.5) return 'pending'
    return roll < 0.8 ? 'shipped' : 'completed'
  }
  if (ageDays < 7) {
    if (roll < 0.12) return 'pending'
    return roll < 0.55 ? 'shipped' : 'completed'
  }
  // A small share of older orders is stuck in "pending" (surfaced as an alert).
  return roll >= 0.085 && roll < 0.0865 ? 'pending' : 'completed'
}

function pickQuantity(product: Product): number {
  if (product.category === 'Laptops' || product.category === 'Phones') {
    return faker.helpers.weightedArrayElement([
      { weight: 90, value: 1 },
      { weight: 10, value: 2 },
    ])
  }
  return faker.helpers.weightedArrayElement([
    { weight: 55, value: 1 },
    { weight: 25, value: 2 },
    { weight: 12, value: 3 },
    { weight: 8, value: 4 },
  ])
}

/**
 * Generates a deterministic set of orders. Volumes follow a gentle upward
 * trend with a weekly rhythm so that charts look like a real storefront.
 * Orders are returned oldest first with sequential ids.
 */
export function generateOrders(options: GenerateOptions = {}): Order[] {
  const { seed = DEFAULT_SEED, days = DEFAULT_DAYS, anchor = new Date(), ordersPerDay = 12 } = options
  faker.seed(seed)

  const anchorTime = anchor.getTime()
  const lastDay = toDayKey(anchor)
  const orders: Omit<Order, 'id'>[] = []

  for (let offset = days - 1; offset >= 0; offset--) {
    const day = addDays(lastDay, -offset)
    const dayStart = dayjs(day)
    const progress = (days - 1 - offset) / Math.max(1, days - 1)
    const trend = 1 + 0.45 * progress + 0.08 * Math.sin(progress * Math.PI * 4)
    const weekday = WEEKDAY_FACTOR[dayStart.day()] ?? 1
    const noise = faker.number.float({ min: 0.8, max: 1.2 })
    const count = Math.max(2, Math.round(ordersPerDay * trend * weekday * noise))

    for (let i = 0; i < count; i++) {
      const product = faker.helpers.weightedArrayElement(
        PRODUCTS.map((p) => ({ weight: PRODUCT_WEIGHT[p.id] ?? 1, value: p })),
      )
      const region = faker.helpers.weightedArrayElement(REGION_WEIGHTS)
      const quantity = pickQuantity(product)
      const discount = faker.helpers.arrayElement([0, 0, 0, 0, 0.05, 0.1, 0.15])
      const subtotal = round2(product.price * quantity * (1 - discount))
      const shipping = subtotal >= 500 ? 0 : faker.helpers.arrayElement([9.99, 14.99])
      const tax = round2(subtotal * TAX_RATE[region])
      const firstName = faker.person.firstName()
      const lastName = faker.person.lastName()

      let timestamp = dayStart.valueOf() + faker.number.int({ min: 6 * 3600, max: 23 * 3600 }) * 1000
      if (timestamp > anchorTime) {
        // Today: spread the orders over the part of the day that has elapsed.
        timestamp = dayStart.valueOf() + faker.number.int({ min: 0, max: Math.max(0, Math.floor((anchorTime - dayStart.valueOf()) / 1000)) }) * 1000
      }

      orders.push({
        date: new Date(timestamp).toISOString(),
        day: toDayKey(timestamp),
        customer: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName, provider: 'example.com' }).toLowerCase(),
        productId: product.id,
        product: product.name,
        category: product.category,
        region,
        channel: faker.helpers.weightedArrayElement(CHANNEL_WEIGHTS),
        paymentMethod: faker.helpers.weightedArrayElement(PAYMENT_WEIGHTS),
        quantity,
        unitPrice: product.price,
        discount,
        subtotal,
        shipping,
        tax,
        amount: round2(subtotal + shipping + tax),
        status: pickStatus(offset),
      })
    }
  }

  orders.sort((a, b) => a.date.localeCompare(b.date))
  return orders.map((order, index) => ({ ...order, id: `ORD-${10001 + index}` }))
}
