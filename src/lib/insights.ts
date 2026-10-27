import type { Order } from '../types'
import { breakdownBy, filterByRange, percentChange, summarize } from './analytics'
import { addDays, toDayKey } from './dates'
import { formatCurrency, formatPercent } from './format'

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'

export interface AppNotification {
  id: string
  level: NotificationLevel
  title: string
  description: string
  /** ISO timestamp. */
  createdAt: string
  /** In-app route (without the hash) opened when the notification is clicked. */
  href?: string
}

/**
 * Derives operational notifications from the order data. Ids are stable so
 * read / dismissed state can be persisted across reloads.
 */
export function buildInsights(orders: readonly Order[], now: Date = new Date()): AppNotification[] {
  if (orders.length === 0) return []
  const today = toDayKey(now)
  const week = { start: addDays(today, -6), end: today }
  const previousWeek = { start: addDays(today, -13), end: addDays(today, -7) }
  const current = filterByRange(orders, week)
  const previous = filterByRange(orders, previousWeek)
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString()
  const items: AppNotification[] = []

  const currentSummary = summarize(current)
  const previousSummary = summarize(previous)
  const revenueChange = percentChange(currentSummary.revenue, previousSummary.revenue)
  if (revenueChange !== null) {
    const up = revenueChange >= 0
    items.push({
      id: 'revenue-wow',
      level: up ? 'success' : 'warning',
      title: `Revenue ${up ? 'up' : 'down'} ${formatPercent(Math.abs(revenueChange))} week over week`,
      description: `${formatCurrency(currentSummary.revenue, { whole: true })} in the last 7 days versus ${formatCurrency(previousSummary.revenue, { whole: true })} the week before.`,
      createdAt: hoursAgo(1),
      href: '/',
    })
  }

  const stuck = orders.filter((o) => o.status === 'pending' && o.day <= addDays(today, -7))
  if (stuck.length > 0) {
    items.push({
      id: 'stuck-pending',
      level: 'warning',
      title: `${stuck.length} orders pending for over a week`,
      description: 'These orders were never paid or confirmed. Review them before they expire.',
      createdAt: hoursAgo(3),
      href: '/sales?status=pending',
    })
  }

  if (currentSummary.orders > 0) {
    const high = currentSummary.lossRate > 0.1
    items.push({
      id: 'loss-rate',
      level: high ? 'error' : 'info',
      title: `${formatPercent(currentSummary.lossRate)} of orders cancelled or refunded`,
      description: high
        ? 'Above the 10% target over the last 7 days. Check the cancelled orders for a common cause.'
        : 'Within the 10% target over the last 7 days.',
      createdAt: hoursAgo(6),
      href: '/sales?status=cancelled',
    })
  }

  const topProduct = breakdownBy(current, 'product')[0]
  if (topProduct) {
    items.push({
      id: 'best-seller',
      level: 'info',
      title: `${topProduct.key} is the best seller this week`,
      description: `${formatCurrency(topProduct.revenue, { whole: true })} from ${topProduct.units} units sold.`,
      createdAt: hoursAgo(20),
      href: `/sales?q=${encodeURIComponent(topProduct.key)}`,
    })
  }

  const topRegion = breakdownBy(current, 'region')[0]
  if (topRegion) {
    items.push({
      id: 'top-region',
      level: 'success',
      title: `${topRegion.key} leads regional sales`,
      description: `${formatPercent(topRegion.share)} of revenue over the last 7 days.`,
      createdAt: hoursAgo(26),
      href: '/regions',
    })
  }

  return items
}
