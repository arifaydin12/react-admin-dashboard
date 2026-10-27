/**
 * Pure aggregation helpers. Nothing in here touches React, the DOM or any
 * global state, so everything is trivially unit-testable.
 */
import { addDays, diffDays, eachDay, type DayKey } from './dates'
import type { Category, DateRange, Order, OrderStatus, Region } from '../types'

// ---------------------------------------------------------------------------
// Ranges
// ---------------------------------------------------------------------------

/** Number of days in an inclusive range. */
export function rangeLength(range: DateRange): number {
  return Math.max(0, diffDays(range.start, range.end) + 1)
}

/** The range of equal length that ends the day before `range` starts. */
export function previousRange(range: DateRange): DateRange {
  const length = rangeLength(range)
  return { start: addDays(range.start, -length), end: addDays(range.start, -1) }
}

export function isInRange(day: DayKey, range: DateRange): boolean {
  return day >= range.start && day <= range.end
}

export function filterByRange(orders: readonly Order[], range: DateRange): Order[] {
  return orders.filter((order) => isInRange(order.day, range))
}

// ---------------------------------------------------------------------------
// Summaries
// ---------------------------------------------------------------------------

/** Orders that count towards revenue: paid and not later reversed. */
export function isRevenueOrder(order: Pick<Order, 'status'>): boolean {
  return order.status === 'completed' || order.status === 'shipped'
}

export interface Summary {
  /** Sum of `amount` for revenue orders. */
  revenue: number
  /** All orders placed, whatever their status. */
  orders: number
  /** Orders that produced revenue. */
  paidOrders: number
  /** Average revenue per paid order. */
  averageOrderValue: number
  /** Units sold across paid orders. */
  units: number
  /** Share (0..1) of orders that ended up cancelled or refunded. */
  lossRate: number
}

export function summarize(orders: readonly Order[]): Summary {
  let revenue = 0
  let paidOrders = 0
  let units = 0
  let lost = 0
  for (const order of orders) {
    if (isRevenueOrder(order)) {
      revenue += order.amount
      paidOrders += 1
      units += order.quantity
    } else if (order.status === 'cancelled' || order.status === 'refunded') {
      lost += 1
    }
  }
  return {
    revenue: round2(revenue),
    orders: orders.length,
    paidOrders,
    averageOrderValue: paidOrders > 0 ? round2(revenue / paidOrders) : 0,
    units,
    lossRate: orders.length > 0 ? lost / orders.length : 0,
  }
}

/**
 * Relative change from `previous` to `current` as a fraction (0.1 = +10 %).
 * Returns `null` when there is no meaningful baseline.
 */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null
  return (current - previous) / Math.abs(previous)
}

// ---------------------------------------------------------------------------
// Time series
// ---------------------------------------------------------------------------

export interface SeriesPoint {
  /** First day of the bucket. */
  date: DayKey
  revenue: number
  /** All orders placed in the bucket. */
  orders: number
  /** Orders that produced revenue. */
  paidOrders: number
  /** Cancelled or refunded orders. */
  lostOrders: number
}

/** Daily buckets for short ranges, weekly buckets for long ones. */
export function bucketSizeFor(range: DateRange): 1 | 7 {
  return rangeLength(range) > 120 ? 7 : 1
}

/**
 * Revenue and order counts per bucket. Every bucket in the range is present,
 * including empty ones, so charts never skip days.
 */
export function buildSeries(orders: readonly Order[], range: DateRange, bucketSize: number = bucketSizeFor(range)): SeriesPoint[] {
  const days = eachDay(range.start, range.end)
  const points: SeriesPoint[] = []
  const indexByDay = new Map<DayKey, number>()
  days.forEach((day, i) => {
    if (i % bucketSize === 0) points.push({ date: day, revenue: 0, orders: 0, paidOrders: 0, lostOrders: 0 })
    indexByDay.set(day, points.length - 1)
  })
  for (const order of orders) {
    const index = indexByDay.get(order.day)
    const point = index === undefined ? undefined : points[index]
    if (!point) continue
    point.orders += 1
    if (isRevenueOrder(order)) {
      point.revenue += order.amount
      point.paidOrders += 1
    } else if (order.status === 'cancelled' || order.status === 'refunded') {
      point.lostOrders += 1
    }
  }
  return points.map((p) => ({ ...p, revenue: round2(p.revenue) }))
}

// ---------------------------------------------------------------------------
// Breakdowns
// ---------------------------------------------------------------------------

export interface BreakdownRow {
  key: string
  revenue: number
  orders: number
  units: number
  /** Share of total revenue, 0..1. */
  share: number
}

export type BreakdownKey = 'category' | 'region' | 'product' | 'paymentMethod' | 'channel'

/** Revenue grouped by a dimension (revenue orders only), largest first. */
export function breakdownBy(orders: readonly Order[], key: BreakdownKey): BreakdownRow[] {
  const groups = new Map<string, BreakdownRow>()
  let total = 0
  for (const order of orders) {
    if (!isRevenueOrder(order)) continue
    const groupKey = order[key]
    const row = groups.get(groupKey) ?? { key: groupKey, revenue: 0, orders: 0, units: 0, share: 0 }
    row.revenue += order.amount
    row.orders += 1
    row.units += order.quantity
    total += order.amount
    groups.set(groupKey, row)
  }
  return [...groups.values()]
    .map((row) => ({ ...row, revenue: round2(row.revenue), share: total > 0 ? row.revenue / total : 0 }))
    .sort((a, b) => b.revenue - a.revenue)
}

export interface ProductStat {
  productId: string
  name: string
  category: Category
  revenue: number
  units: number
  orders: number
  share: number
  /** Revenue change versus the previous period (fraction) or `null`. */
  delta: number | null
  /** Revenue per time bucket, for sparklines. */
  trend: number[]
}

/** Per product performance for the current range, compared with the previous one. */
export function productStats(
  orders: readonly Order[],
  previousOrders: readonly Order[],
  range: DateRange,
): ProductStat[] {
  const bucketSize = bucketSizeFor(range)
  const days = eachDay(range.start, range.end)
  const bucketOfDay = new Map<DayKey, number>(days.map((day, i) => [day, Math.floor(i / bucketSize)]))
  const bucketCount = Math.ceil(days.length / bucketSize)

  const previousRevenue = new Map<string, number>()
  for (const order of previousOrders) {
    if (isRevenueOrder(order)) {
      previousRevenue.set(order.productId, (previousRevenue.get(order.productId) ?? 0) + order.amount)
    }
  }

  const stats = new Map<string, ProductStat>()
  let total = 0
  for (const order of orders) {
    if (!isRevenueOrder(order)) continue
    const stat = stats.get(order.productId) ?? {
      productId: order.productId,
      name: order.product,
      category: order.category,
      revenue: 0,
      units: 0,
      orders: 0,
      share: 0,
      delta: null,
      trend: new Array<number>(bucketCount).fill(0),
    }
    stat.revenue += order.amount
    stat.units += order.quantity
    stat.orders += 1
    const bucket = bucketOfDay.get(order.day)
    if (bucket !== undefined) stat.trend[bucket] = (stat.trend[bucket] ?? 0) + order.amount
    total += order.amount
    stats.set(order.productId, stat)
  }

  return [...stats.values()]
    .map((stat) => ({
      ...stat,
      revenue: round2(stat.revenue),
      share: total > 0 ? stat.revenue / total : 0,
      delta: percentChange(stat.revenue, previousRevenue.get(stat.productId) ?? 0),
      trend: stat.trend.map(round2),
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

export interface HeatMatrix {
  rows: Region[]
  columns: Category[]
  /** `values[row][column]` is revenue. */
  values: number[][]
  max: number
}

/** Revenue for every region × category pair. */
export function regionCategoryMatrix(
  orders: readonly Order[],
  rows: readonly Region[],
  columns: readonly Category[],
): HeatMatrix {
  const values = rows.map(() => columns.map(() => 0))
  for (const order of orders) {
    if (!isRevenueOrder(order)) continue
    const r = rows.indexOf(order.region)
    const c = columns.indexOf(order.category)
    const line = values[r]
    if (r >= 0 && c >= 0 && line) line[c] = (line[c] ?? 0) + order.amount
  }
  const rounded = values.map((line) => line.map(round2))
  return { rows: [...rows], columns: [...columns], values: rounded, max: Math.max(0, ...rounded.flat()) }
}

// ---------------------------------------------------------------------------
// Order querying (table filtering, sorting, pagination)
// ---------------------------------------------------------------------------

export type SortField = 'id' | 'date' | 'customer' | 'product' | 'quantity' | 'amount' | 'status'
export type SortOrder = 'asc' | 'desc'

export interface OrderFilters {
  search?: string
  statuses?: readonly OrderStatus[]
  categories?: readonly Category[]
  regions?: readonly Region[]
}

export interface OrderQuery extends OrderFilters {
  sortField?: SortField
  sortOrder?: SortOrder
  /** 1-based page number. */
  page?: number
  pageSize?: number
}

export interface OrderPage {
  rows: Order[]
  /** Number of orders matching the filters, across all pages. */
  total: number
  page: number
  pageSize: number
}

export function matchesSearch(order: Order, term: string): boolean {
  const needle = term.trim().toLowerCase()
  if (!needle) return true
  return (
    order.id.toLowerCase().includes(needle) ||
    order.customer.toLowerCase().includes(needle) ||
    order.email.toLowerCase().includes(needle) ||
    order.product.toLowerCase().includes(needle)
  )
}

export function filterOrders(orders: readonly Order[], filters: OrderFilters): Order[] {
  const { search, statuses, categories, regions } = filters
  return orders.filter(
    (order) =>
      (!statuses?.length || statuses.includes(order.status)) &&
      (!categories?.length || categories.includes(order.category)) &&
      (!regions?.length || regions.includes(order.region)) &&
      (!search || matchesSearch(order, search)),
  )
}

const STATUS_RANK: Record<OrderStatus, number> = { pending: 0, shipped: 1, completed: 2, refunded: 3, cancelled: 4 }

function compareBy(field: SortField, a: Order, b: Order): number {
  switch (field) {
    case 'amount':
      return a.amount - b.amount
    case 'quantity':
      return a.quantity - b.quantity
    case 'status':
      return STATUS_RANK[a.status] - STATUS_RANK[b.status]
    case 'date':
      return a.date.localeCompare(b.date)
    case 'customer':
      return a.customer.localeCompare(b.customer)
    case 'product':
      return a.product.localeCompare(b.product)
    case 'id':
      return a.id.localeCompare(b.id, undefined, { numeric: true })
  }
}

export function sortOrders(orders: readonly Order[], field: SortField, order: SortOrder): Order[] {
  const direction = order === 'asc' ? 1 : -1
  // Deterministic: ties fall back to the most recent order first.
  return [...orders].sort(
    (a, b) =>
      direction * compareBy(field, a, b) ||
      b.date.localeCompare(a.date) ||
      b.id.localeCompare(a.id, undefined, { numeric: true }),
  )
}

/** Filter, sort and paginate - the same contract a REST endpoint would offer. */
export function queryOrders(orders: readonly Order[], query: OrderQuery): OrderPage {
  const { sortField = 'date', sortOrder = 'desc', pageSize = 10 } = query
  const filtered = sortOrders(filterOrders(orders, query), sortField, sortOrder)
  const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(Math.max(1, query.page ?? 1), lastPage)
  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize }
}

// ---------------------------------------------------------------------------

function round2(value: number): number {
  return Math.round(value * 100) / 100
}
