import { describe, expect, it } from 'vitest'
import { makeOrder } from '../test/factories'
import type { Order } from '../types'
import {
  breakdownBy,
  buildSeries,
  bucketSizeFor,
  filterByRange,
  filterOrders,
  isRevenueOrder,
  percentChange,
  previousRange,
  productStats,
  queryOrders,
  rangeLength,
  regionCategoryMatrix,
  sortOrders,
  summarize,
} from './analytics'

const range = { start: '2025-06-01', end: '2025-06-10' }

const orders: Order[] = [
  makeOrder({ day: '2025-06-01', amount: 100, status: 'completed', region: 'Europe', category: 'Laptops', customer: 'Ada Lovelace' }),
  makeOrder({ day: '2025-06-01', amount: 50, status: 'shipped', region: 'Asia Pacific', category: 'Audio', productId: 'p-echo-buds', product: 'Echo Buds Pro', quantity: 2 }),
  makeOrder({ day: '2025-06-03', amount: 200, status: 'pending', region: 'Europe' }),
  makeOrder({ day: '2025-06-05', amount: 300, status: 'cancelled', region: 'Europe' }),
  makeOrder({ day: '2025-06-10', amount: 150, status: 'refunded', region: 'Europe' }),
  makeOrder({ day: '2025-06-10', amount: 400, status: 'completed', region: 'Europe', category: 'Laptops' }),
  makeOrder({ day: '2025-05-20', amount: 999, status: 'completed' }),
]

describe('ranges', () => {
  it('counts days inclusively', () => {
    expect(rangeLength(range)).toBe(10)
    expect(rangeLength({ start: '2025-06-01', end: '2025-06-01' })).toBe(1)
  })

  it('builds the previous range of equal length', () => {
    expect(previousRange(range)).toEqual({ start: '2025-05-22', end: '2025-05-31' })
  })

  it('filters orders by day, inclusive of both ends', () => {
    const inRange = filterByRange(orders, range)
    expect(inRange).toHaveLength(6)
    expect(inRange.every((o) => o.day >= range.start && o.day <= range.end)).toBe(true)
  })
})

describe('summarize', () => {
  it('only counts completed and shipped orders as revenue', () => {
    expect(isRevenueOrder({ status: 'pending' })).toBe(false)
    const summary = summarize(filterByRange(orders, range))
    expect(summary.revenue).toBe(100 + 50 + 400)
    expect(summary.orders).toBe(6)
    expect(summary.paidOrders).toBe(3)
    expect(summary.units).toBe(1 + 2 + 1)
    expect(summary.averageOrderValue).toBeCloseTo(550 / 3, 2)
    expect(summary.lossRate).toBeCloseTo(2 / 6, 5)
  })

  it('handles an empty list without dividing by zero', () => {
    expect(summarize([])).toEqual({
      revenue: 0,
      orders: 0,
      paidOrders: 0,
      averageOrderValue: 0,
      units: 0,
      lossRate: 0,
    })
  })
})

describe('percentChange', () => {
  it('returns the relative change as a fraction', () => {
    expect(percentChange(110, 100)).toBeCloseTo(0.1)
    expect(percentChange(50, 100)).toBeCloseTo(-0.5)
  })

  it('returns null without a usable baseline', () => {
    expect(percentChange(10, 0)).toBeNull()
    expect(percentChange(Number.NaN, 5)).toBeNull()
  })
})

describe('buildSeries', () => {
  it('returns one point per day including empty days', () => {
    const series = buildSeries(filterByRange(orders, range), range)
    expect(series).toHaveLength(10)
    expect(series[0]).toMatchObject({ date: '2025-06-01', revenue: 150, orders: 2, paidOrders: 2, lostOrders: 0 })
    expect(series[1]).toMatchObject({ date: '2025-06-02', revenue: 0, orders: 0 })
    expect(series[9]).toMatchObject({ date: '2025-06-10', revenue: 400, orders: 2, lostOrders: 1 })
  })

  it('aggregates into weekly buckets', () => {
    const series = buildSeries(filterByRange(orders, range), range, 7)
    expect(series).toHaveLength(2)
    expect(series[0]?.date).toBe('2025-06-01')
    expect(series[0]?.revenue).toBe(150)
    expect(series[1]?.date).toBe('2025-06-08')
    expect(series[1]?.revenue).toBe(400)
  })

  it('switches to weekly buckets for long ranges', () => {
    expect(bucketSizeFor({ start: '2025-01-01', end: '2025-03-01' })).toBe(1)
    expect(bucketSizeFor({ start: '2025-01-01', end: '2025-12-31' })).toBe(7)
  })
})

describe('breakdownBy', () => {
  const inRange = filterByRange(orders, range)

  it('groups revenue by dimension, largest first, with shares', () => {
    const regions = breakdownBy(inRange, 'region')
    expect(regions.map((r) => r.key)).toEqual(['Europe', 'Asia Pacific'])
    expect(regions[0]).toMatchObject({ revenue: 500, orders: 2 })
    expect(regions[0]?.share).toBeCloseTo(500 / 550)
    expect(regions.reduce((sum, r) => sum + r.share, 0)).toBeCloseTo(1)
  })

  it('ignores orders that do not count as revenue', () => {
    expect(breakdownBy(inRange, 'category').reduce((sum, r) => sum + r.revenue, 0)).toBe(550)
  })
})

describe('productStats', () => {
  it('ranks products and compares them with the previous period', () => {
    const previous = [makeOrder({ day: '2025-05-25', amount: 250, status: 'completed' })]
    const stats = productStats(filterByRange(orders, range), previous, range)
    expect(stats.map((s) => s.productId)).toEqual(['p-nimbus-14', 'p-echo-buds'])
    expect(stats[0]?.revenue).toBe(500)
    expect(stats[0]?.delta).toBeCloseTo(1) // 500 vs 250
    expect(stats[1]?.delta).toBeNull() // no earlier sales
    expect(stats[0]?.trend).toHaveLength(10)
    expect(stats[0]?.trend.reduce((a, b) => a + b, 0)).toBe(500)
  })
})

describe('regionCategoryMatrix', () => {
  it('builds a revenue grid and its maximum', () => {
    const matrix = regionCategoryMatrix(filterByRange(orders, range), ['Europe', 'Asia Pacific'], ['Laptops', 'Audio'])
    expect(matrix.values).toEqual([
      [500, 0],
      [0, 50],
    ])
    expect(matrix.max).toBe(500)
  })
})

describe('order queries', () => {
  it('filters by search text, status, category and region', () => {
    expect(filterOrders(orders, { search: 'ada' })).toHaveLength(1)
    expect(filterOrders(orders, { search: 'echo buds' })).toHaveLength(1)
    expect(filterOrders(orders, { statuses: ['pending', 'cancelled'] })).toHaveLength(2)
    expect(filterOrders(orders, { categories: ['Audio'] })).toHaveLength(1)
    expect(filterOrders(orders, { regions: ['Asia Pacific'], statuses: ['shipped'] })).toHaveLength(1)
    expect(filterOrders(orders, { search: 'no-such-thing' })).toHaveLength(0)
  })

  it('sorts by amount in both directions with a deterministic tie-break', () => {
    const desc = sortOrders(orders, 'amount', 'desc').map((o) => o.amount)
    expect(desc).toEqual([999, 400, 300, 200, 150, 100, 50])
    const asc = sortOrders(orders, 'amount', 'asc').map((o) => o.amount)
    expect(asc).toEqual([...desc].reverse())
  })

  it('paginates and reports the total', () => {
    const first = queryOrders(orders, { sortField: 'amount', sortOrder: 'desc', page: 1, pageSize: 3 })
    expect(first.rows.map((o) => o.amount)).toEqual([999, 400, 300])
    expect(first.total).toBe(7)
    const last = queryOrders(orders, { sortField: 'amount', sortOrder: 'desc', page: 3, pageSize: 3 })
    expect(last.rows.map((o) => o.amount)).toEqual([50])
  })

  it('clamps out-of-range pages', () => {
    const page = queryOrders(orders, { page: 99, pageSize: 5 })
    expect(page.page).toBe(2)
    expect(page.rows).toHaveLength(2)
    expect(queryOrders(orders, { search: 'zzz' })).toMatchObject({ rows: [], total: 0, page: 1 })
  })
})
