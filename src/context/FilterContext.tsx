import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { addDays, toDayKey } from '../lib/dates'
import type { DateRange } from '../types'

export type RangePreset = '7d' | '30d' | '90d' | '180d' | 'custom'

export const PRESETS: ReadonlyArray<{ key: Exclude<RangePreset, 'custom'>; label: string; days: number }> = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
  { key: '180d', label: 'Last 180 days', days: 180 },
]

interface FilterContextValue {
  range: DateRange
  preset: RangePreset
  setPreset: (preset: Exclude<RangePreset, 'custom'>) => void
  setCustomRange: (range: DateRange) => void
}

export const FilterContext = createContext<FilterContextValue | null>(null)

export function presetRange(days: number, today: string = toDayKey(new Date())): DateRange {
  return { start: addDays(today, -(days - 1)), end: today }
}

/** The global date range that every page filters by. */
export function FilterProvider({ children, today }: { children: ReactNode; today: string }) {
  const [state, setState] = useState<{ preset: RangePreset; custom: DateRange | null }>({
    preset: '30d',
    custom: null,
  })

  const setPreset = useCallback((preset: Exclude<RangePreset, 'custom'>) => setState({ preset, custom: null }), [])
  const setCustomRange = useCallback((range: DateRange) => setState({ preset: 'custom', custom: range }), [])

  const value = useMemo<FilterContextValue>(() => {
    const days = PRESETS.find((p) => p.key === state.preset)?.days ?? 30
    return {
      range: state.custom ?? presetRange(days, today),
      preset: state.preset,
      setPreset,
      setCustomRange,
    }
  }, [state, today, setPreset, setCustomRange])

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useDateRange(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useDateRange must be used inside <FilterProvider>')
  return ctx
}
