import type { Order } from '../types'

let counter = 0

/** Builds a valid order with sensible defaults; override only what a test cares about. */
export function makeOrder(overrides: Partial<Order> = {}): Order {
  counter += 1
  const day = overrides.day ?? '2025-06-10'
  return {
    id: `ORD-${20000 + counter}`,
    date: `${day}T12:00:00.000Z`,
    day,
    customer: 'Test Customer',
    email: 'test@example.com',
    productId: 'p-nimbus-14',
    product: 'Nimbus 14 Laptop',
    category: 'Laptops',
    region: 'Europe',
    channel: 'Web',
    paymentMethod: 'Credit card',
    quantity: 1,
    unitPrice: 100,
    discount: 0,
    subtotal: 100,
    shipping: 0,
    tax: 0,
    amount: 100,
    status: 'completed',
    ...overrides,
  }
}
