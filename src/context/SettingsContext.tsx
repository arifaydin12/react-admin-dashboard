import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { readStorage, writeStorage } from '../lib/storage'

export interface Settings {
  displayName: string
  /** Show KPI values and chart axes in compact form ($12.4K). */
  compactNumbers: boolean
  /** Animate charts and sparklines. */
  animations: boolean
  /** Rows per page in the sales table. */
  pageSize: 10 | 20 | 50
}

export const DEFAULT_SETTINGS: Settings = {
  displayName: 'Alex Morgan',
  compactNumbers: true,
  animations: true,
  pageSize: 10,
}

interface SettingsContextValue {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  reset: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
    ...readStorage<Partial<Settings>>('settings', {}),
  }))

  useEffect(() => writeStorage('settings', settings), [settings])

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), [])
  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])
  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>')
  return ctx
}
