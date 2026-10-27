/**
 * Centralised number, currency and date formatting.
 *
 * Every piece of UI (tables, KPI cards, chart axes, CSV export labels) goes
 * through this module so the currency and locale can be changed in one place.
 */

export const LOCALE = 'en-US'
export const CURRENCY = 'USD'

const currencyFull = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY })
const currencyWhole = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
})
const currencyCompact = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 1,
})
const numberFull = new Intl.NumberFormat(LOCALE)
const numberCompact = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 })
const percentFormat = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 1 })
const deltaFormat = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

export interface CurrencyOptions {
  /** Short form such as `$12.4K`. */
  compact?: boolean
  /** Drop the cents, e.g. `$1,299`. */
  whole?: boolean
}

export function formatCurrency(value: number, options: CurrencyOptions = {}): string {
  if (options.compact) return currencyCompact.format(value)
  if (options.whole) return currencyWhole.format(value)
  return currencyFull.format(value)
}

export function formatNumber(value: number, compact = false): string {
  return (compact ? numberCompact : numberFull).format(value)
}

/** Formats a fraction (0.256) as a percentage ("25.6%"). */
export function formatPercent(fraction: number): string {
  return percentFormat.format(fraction)
}

/** Formats a fraction as a signed percentage ("+12.3%", "-4.0%"). */
export function formatDelta(fraction: number): string {
  return deltaFormat.format(fraction)
}

const shortDate = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric' })
const mediumDate = new Intl.DateTimeFormat(LOCALE, { year: 'numeric', month: 'short', day: 'numeric' })
const dateTime = new Intl.DateTimeFormat(LOCALE, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(value: string | number | Date, style: 'short' | 'medium' | 'datetime' = 'medium'): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  if (style === 'short') return shortDate.format(date)
  if (style === 'datetime') return dateTime.format(date)
  return mediumDate.format(date)
}

/** Formats a local `YYYY-MM-DD` day key without any timezone shifting. */
export function formatDayKey(dayKey: string, style: 'short' | 'medium' = 'short'): string {
  const [y, m, d] = dayKey.split('-').map(Number)
  if (!y || !m || !d) return dayKey
  return formatDate(new Date(y, m - 1, d), style)
}

const relative = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

/** "2 hours ago", "yesterday" … relative to `now`. */
export function formatRelativeTime(value: string | number | Date, now: number = Date.now()): string {
  const diffSeconds = Math.round((new Date(value).getTime() - now) / 1000)
  const abs = Math.abs(diffSeconds)
  if (abs < 60) return relative.format(diffSeconds, 'second')
  if (abs < 3600) return relative.format(Math.round(diffSeconds / 60), 'minute')
  if (abs < 86400) return relative.format(Math.round(diffSeconds / 3600), 'hour')
  return relative.format(Math.round(diffSeconds / 86400), 'day')
}
