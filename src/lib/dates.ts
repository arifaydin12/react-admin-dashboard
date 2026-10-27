import dayjs from 'dayjs'

/** Local calendar day in `YYYY-MM-DD` form. Used as a timezone-safe bucket key. */
export type DayKey = string

export const DAY_FORMAT = 'YYYY-MM-DD'

export function toDayKey(value: string | number | Date | dayjs.Dayjs): DayKey {
  return dayjs(value).format(DAY_FORMAT)
}

export function addDays(day: DayKey, amount: number): DayKey {
  return dayjs(day).add(amount, 'day').format(DAY_FORMAT)
}

/** Whole days from `a` to `b` (positive when `b` is later). */
export function diffDays(a: DayKey, b: DayKey): number {
  return dayjs(b).diff(dayjs(a), 'day')
}

/** Every day key from `start` to `end`, inclusive. */
export function eachDay(start: DayKey, end: DayKey): DayKey[] {
  const count = diffDays(start, end) + 1
  if (count <= 0) return []
  return Array.from({ length: count }, (_, i) => addDays(start, i))
}
