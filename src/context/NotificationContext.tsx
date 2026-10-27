import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { buildInsights, type AppNotification } from '../lib/insights'
import { readStorage, writeStorage } from '../lib/storage'
import { useData } from './DataContext'

export interface NotificationItem extends AppNotification {
  read: boolean
}

interface NotificationContextValue {
  items: NotificationItem[]
  unreadCount: number
  /** Adds a runtime notification (for example "export finished"). */
  push: (notification: Omit<AppNotification, 'id' | 'createdAt'> & { id?: string }) => void
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

/**
 * Combines insights derived from the data with notifications pushed at
 * runtime. Read and dismissed state survives page reloads.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { orders, status } = useData()
  const [runtime, setRuntime] = useState<AppNotification[]>([])
  const [readIds, setReadIds] = useState<string[]>(() => readStorage<string[]>('notifications.read', []))
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => readStorage<string[]>('notifications.dismissed', []))

  useEffect(() => writeStorage('notifications.read', readIds), [readIds])
  useEffect(() => writeStorage('notifications.dismissed', dismissedIds), [dismissedIds])

  const derived = useMemo(() => (status === 'ready' ? buildInsights(orders) : []), [orders, status])

  const items = useMemo<NotificationItem[]>(() => {
    const all = [...runtime, ...derived].filter((n) => !dismissedIds.includes(n.id))
    return all
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((n) => ({ ...n, read: readIds.includes(n.id) }))
  }, [runtime, derived, dismissedIds, readIds])

  const push = useCallback<NotificationContextValue['push']>((notification) => {
    const id = notification.id ?? `runtime-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setRuntime((current) => [
      { ...notification, id, createdAt: new Date().toISOString() },
      ...current.filter((n) => n.id !== id),
    ])
    setReadIds((current) => current.filter((r) => r !== id))
    setDismissedIds((current) => current.filter((d) => d !== id))
  }, [])

  const markRead = useCallback((id: string) => setReadIds((c) => (c.includes(id) ? c : [...c, id])), [])
  const dismiss = useCallback((id: string) => setDismissedIds((c) => (c.includes(id) ? c : [...c, id])), [])
  const markAllRead = useCallback(() => setReadIds([...new Set([...items.map((n) => n.id), ...readIds])]), [items, readIds])
  const clearAll = useCallback(() => setDismissedIds([...new Set([...items.map((n) => n.id), ...dismissedIds])]), [items, dismissedIds])

  const value = useMemo<NotificationContextValue>(
    () => ({
      items,
      unreadCount: items.filter((n) => !n.read).length,
      push,
      markRead,
      markAllRead,
      dismiss,
      clearAll,
    }),
    [items, push, markRead, markAllRead, dismiss, clearAll],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>')
  return ctx
}
