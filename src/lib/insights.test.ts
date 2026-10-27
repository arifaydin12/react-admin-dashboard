import { describe, expect, it } from 'vitest'
import { makeOrder } from '../test/factories'
import { searchOrders, searchProducts } from './search'
import { PRODUCTS } from '../data/catalog'
import { buildInsights } from './insights'

const now = new Date(2025, 5, 30, 12, 0, 0)

describe('buildInsights', () => {
  it('returns nothing for an empty data set', () => {
    expect(buildInsights([], now)).toEqual([])
  })

  it('reports week-over-week revenue and a pending alert with stable ids', () => {
    const orders = [
      makeOrder({ day: '2025-06-29', amount: 300 }),
      makeOrder({ day: '2025-06-20', amount: 100 }),
      makeOrder({ day: '2025-06-01', status: 'pending' }),
    ]
    const items = buildInsights(orders, now)
    const revenue = items.find((i) => i.id === 'revenue-wow')
    expect(revenue?.level).toBe('success')
    expect(revenue?.title).toBe('Revenue up 200% week over week')
    expect(items.find((i) => i.id === 'stuck-pending')?.href).toBe('/sales?status=pending')
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
  })
})

describe('search helpers', () => {
  const orders = [
    makeOrder({ id: 'ORD-1', customer: 'Ada Lovelace' }),
    makeOrder({ id: 'ORD-2', customer: 'Grace Hopper' }),
    makeOrder({ id: 'ORD-3', customer: 'Ada Byron' }),
  ]

  it('requires at least two characters', () => {
    expect(searchOrders(orders, 'a')).toEqual([])
    expect(searchProducts(PRODUCTS, ' ')).toEqual([])
  })

  it('returns the newest matching orders first and respects the limit', () => {
    expect(searchOrders(orders, 'ada').map((o) => o.id)).toEqual(['ORD-3', 'ORD-1'])
    expect(searchOrders(orders, 'ada', 1)).toHaveLength(1)
  })

  it('finds products by name or category', () => {
    expect(searchProducts(PRODUCTS, 'laptop').length).toBeGreaterThan(2)
    expect(searchProducts(PRODUCTS, 'audio').every((p) => p.category === 'Audio')).toBe(true)
  })
})
