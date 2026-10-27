import { describe, expect, it } from 'vitest'
import { summarize } from '../lib/analytics'
import { CATEGORIES, ORDER_STATUSES, REGIONS } from '../types'
import { PRODUCTS } from './catalog'
import { generateOrders } from './generate'

const anchor = new Date(2025, 5, 30, 15, 0, 0) // local time, 30 Jun 2025

describe('generateOrders', () => {
  const orders = generateOrders({ anchor, days: 120 })

  it('is deterministic for the same seed and anchor', () => {
    expect(generateOrders({ anchor, days: 120 })).toEqual(orders)
  })

  it('changes when the seed changes', () => {
    const other = generateOrders({ anchor, days: 120, seed: 1 })
    expect(other.map((o) => o.customer)).not.toEqual(orders.map((o) => o.customer))
  })

  it('covers the requested period and never creates future orders', () => {
    expect(orders[0]?.day).toBe('2025-03-03')
    expect(orders.at(-1)?.day).toBe('2025-06-30')
    expect(orders.every((o) => new Date(o.date).getTime() <= anchor.getTime())).toBe(true)
  })

  it('returns oldest first with sequential unique ids', () => {
    expect(orders[0]?.id).toBe('ORD-10001')
    expect(new Set(orders.map((o) => o.id)).size).toBe(orders.length)
    const dates = orders.map((o) => o.date)
    expect(dates).toEqual([...dates].sort())
  })

  it('produces internally consistent orders', () => {
    for (const o of orders) {
      expect(PRODUCTS.find((p) => p.id === o.productId)?.name).toBe(o.product)
      expect(CATEGORIES).toContain(o.category)
      expect(REGIONS).toContain(o.region)
      expect(ORDER_STATUSES).toContain(o.status)
      expect(o.amount).toBeCloseTo(o.subtotal + o.shipping + o.tax, 2)
      expect(o.email.endsWith('@example.com')).toBe(true)
    }
  })

  it('looks like real traffic: paid revenue dominates and some orders are lost', () => {
    const summary = summarize(orders)
    expect(summary.revenue).toBeGreaterThan(100_000)
    expect(summary.lossRate).toBeGreaterThan(0.03)
    expect(summary.lossRate).toBeLessThan(0.2)
  })

  it('uses plain ASCII text only (no Turkish or other accented characters), even for a full year', () => {
    const fullYear = generateOrders({ anchor })
    expect(JSON.stringify(fullYear)).toMatch(/^[\x20-\x7e]*$/)
  })
})
