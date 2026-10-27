import { describe, expect, it } from 'vitest'
import { CURRENCY, LOCALE, formatCurrency, formatDayKey, formatDelta, formatNumber, formatPercent } from './format'

describe('format', () => {
  it('uses USD and the en-US locale', () => {
    expect(CURRENCY).toBe('USD')
    expect(LOCALE).toBe('en-US')
  })

  it('formats currency with cents by default', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('supports whole-dollar and compact currency', () => {
    expect(formatCurrency(1299.4, { whole: true })).toBe('$1,299')
    expect(formatCurrency(298236, { compact: true })).toBe('$298.2K')
    expect(formatCurrency(2_400_000, { compact: true })).toBe('$2.4M')
  })

  it('formats numbers, optionally compact', () => {
    expect(formatNumber(12345)).toBe('12,345')
    expect(formatNumber(12345, true)).toBe('12.3K')
  })

  it('formats fractions as percentages', () => {
    expect(formatPercent(0.256)).toBe('25.6%')
    expect(formatPercent(0)).toBe('0%')
  })

  it('formats signed deltas', () => {
    expect(formatDelta(0.123)).toBe('+12.3%')
    expect(formatDelta(-0.04)).toBe('-4%')
    expect(formatDelta(0)).toBe('0%')
  })

  it('formats day keys without timezone shifts', () => {
    expect(formatDayKey('2025-03-01')).toBe('Mar 1')
    expect(formatDayKey('2025-03-01', 'medium')).toBe('Mar 1, 2025')
  })

  it('produces plain ASCII output (no lira sign or localised characters)', () => {
    const sample = [formatCurrency(1500), formatDayKey('2025-11-05', 'medium')].join(' ')
    expect(sample).toMatch(/^[\x20-\x7e]*$/)
  })
})
