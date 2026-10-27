import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { useDateRange } from '../context/FilterContext'
import { filterByRange, percentChange, previousRange, summarize, type Summary } from '../lib/analytics'
import type { DateRange, Order } from '../types'

export interface Analytics {
  loading: boolean
  range: DateRange
  previous: DateRange
  /** Orders inside the selected range. */
  orders: Order[]
  /** Orders inside the equally long period before it. */
  previousOrders: Order[]
  summary: Summary
  previousSummary: Summary
  /** Whether the previous period has any data to compare against. */
  hasComparison: boolean
  delta: {
    revenue: number | null
    orders: number | null
    averageOrderValue: number | null
    lossRate: number | null
  }
}

/** Everything a page needs to know about the globally selected date range. */
export function useAnalytics(): Analytics {
  const { orders: all, status } = useData()
  const { range } = useDateRange()

  return useMemo(() => {
    const previous = previousRange(range)
    const orders = filterByRange(all, range)
    const previousOrders = filterByRange(all, previous)
    const summary = summarize(orders)
    const previousSummary = summarize(previousOrders)
    const hasComparison = previousOrders.length > 0
    return {
      loading: status !== 'ready',
      range,
      previous,
      orders,
      previousOrders,
      summary,
      previousSummary,
      hasComparison,
      delta: {
        revenue: percentChange(summary.revenue, previousSummary.revenue),
        orders: percentChange(summary.orders, previousSummary.orders),
        averageOrderValue: percentChange(summary.averageOrderValue, previousSummary.averageOrderValue),
        lossRate: percentChange(summary.lossRate, previousSummary.lossRate),
      },
    }
  }, [all, range, status])
}
