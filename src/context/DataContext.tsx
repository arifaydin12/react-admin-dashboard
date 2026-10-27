import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PRODUCTS } from '../data/catalog'
import { toDayKey, type DayKey } from '../lib/dates'
import type { Order, Product } from '../types'

export type DataStatus = 'loading' | 'ready' | 'error'

export interface DataContextValue {
  status: DataStatus
  orders: Order[]
  products: readonly Product[]
  /** Latest day in the data set (today). */
  today: DayKey
  /** First day with data. */
  firstDay: DayKey
  error: Error | null
  reload: () => void
}

export const DataContext = createContext<DataContextValue | null>(null)

/** Minimum time the loading state is shown, so skeletons do not flash. */
const MIN_LOADING_MS = 450

/**
 * Loads the mock data set. The generator (and the faker library) is imported
 * dynamically, so it ships in its own chunk and the UI shell paints first -
 * just like a real API call would.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{ status: DataStatus; orders: Order[]; error: Error | null }>({
    status: 'loading',
    orders: [],
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    const minDelay = new Promise<void>((resolve) => window.setTimeout(resolve, MIN_LOADING_MS))
    Promise.all([import('../data/generate'), minDelay])
      .then(([module]) => {
        if (cancelled) return
        setState({ status: 'ready', orders: module.generateOrders(), error: null })
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setState({
          status: 'error',
          orders: [],
          error: reason instanceof Error ? reason : new Error('Failed to load data'),
        })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = useCallback(() => {
    setState({ status: 'loading', orders: [], error: null })
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo<DataContextValue>(() => {
    const today = toDayKey(new Date())
    return {
      status: state.status,
      orders: state.orders,
      products: PRODUCTS,
      today,
      firstDay: state.orders[0]?.day ?? today,
      error: state.error,
      reload,
    }
  }, [state, reload])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
