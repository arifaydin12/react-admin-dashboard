import { useEffect } from 'react'

/**
 * Calls `handler` when Ctrl/Cmd + `key` is pressed anywhere on the page.
 * The browser default (for example the address-bar search on Ctrl+K) is prevented.
 */
export function useModHotkey(key: string, handler: () => void): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault()
        handler()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, handler])
}
