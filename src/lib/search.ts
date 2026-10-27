import type { Order, Product } from '../types'
import { matchesSearch } from './analytics'

/** Newest matching orders first. Requires at least two characters. */
export function searchOrders(orders: readonly Order[], term: string, limit = 5): Order[] {
  const needle = term.trim()
  if (needle.length < 2) return []
  const matches: Order[] = []
  for (let i = orders.length - 1; i >= 0 && matches.length < limit; i--) {
    const order = orders[i]
    if (order && matchesSearch(order, needle)) matches.push(order)
  }
  return matches
}

export function searchProducts(products: readonly Product[], term: string, limit = 5): Product[] {
  const needle = term.trim().toLowerCase()
  if (needle.length < 2) return []
  return products
    .filter((p) => p.name.toLowerCase().includes(needle) || p.category.toLowerCase().includes(needle))
    .slice(0, limit)
}
