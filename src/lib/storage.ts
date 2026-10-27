/** localStorage access that never throws (private mode, quota, SSR/tests). */

export const STORAGE_PREFIX = 'pulse.'

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage unavailable - preferences simply will not persist */
  }
}
