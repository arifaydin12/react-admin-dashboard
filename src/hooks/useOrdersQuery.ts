import { useEffect, useState } from 'react'
import { queryOrders, type OrderPage, type OrderQuery } from '../lib/analytics'
import type { Order } from '../types'

const LATENCY_MS = 220

interface QueryState {
  page: OrderPage | null
  /** Serialised query that `page` belongs to. */
  key: string
}

/**
 * Server-style table data: every change of filters, sorting or pagination
 * triggers an asynchronous "request" that resolves with one page of rows and
 * the total count - the same contract a real REST endpoint would expose.
 * Swapping the body of the effect for `fetch()` is all it takes to go remote.
 */
export function useOrdersQuery(orders: readonly Order[], query: OrderQuery, enabled = true) {
  const key = JSON.stringify(query)
  const [state, setState] = useState<QueryState>({ page: null, key: '' })

  useEffect(() => {
    if (!enabled) return undefined
    const timer = window.setTimeout(() => {
      // `key` is the serialised query, so parsing it back keeps the effect's
      // dependencies honest without relying on object identity.
      setState({ page: queryOrders(orders, JSON.parse(key) as OrderQuery), key })
    }, LATENCY_MS)
    return () => window.clearTimeout(timer)
  }, [orders, key, enabled])

  return {
    page: state.page,
    loading: enabled && state.key !== key,
    /** True only for the very first request, before any rows are known. */
    initialLoading: enabled && state.page === null,
  }
}
