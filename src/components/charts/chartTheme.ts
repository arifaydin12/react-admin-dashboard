import { useMemo } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { useTheme } from '../../context/ThemeContext'

export const CHART_COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6']

/** Shared theme / animation options for every chart. */
export function useChartBase() {
  const { mode } = useTheme()
  const { settings } = useSettings()
  return useMemo(
    () => ({
      theme: mode === 'dark' ? ('classicDark' as const) : ('classic' as const),
      animate: settings.animations ? undefined : (false as const),
      autoFit: true,
      textColor: mode === 'dark' ? '#a1a1aa' : '#52525b',
    }),
    [mode, settings.animations],
  )
}
