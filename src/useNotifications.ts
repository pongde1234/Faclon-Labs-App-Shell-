import { useCallback, useMemo, useState } from 'react'

import { NOTIFICATIONS, type AppNotification } from './notifications'

/**
 * Owned by App: the bell badge and the page render the same list, so the state
 * cannot live inside either one or they would drift apart.
 */
export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>(NOTIFICATIONS)

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items])

  const toggleRead = useCallback(
    (id: string) => setItems((xs) => xs.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))),
    [],
  )

  const togglePin = useCallback(
    (id: string) => setItems((xs) => xs.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))),
    [],
  )

  const markAllRead = useCallback(() => setItems((xs) => xs.map((n) => ({ ...n, isRead: true }))), [])

  const addRemark = useCallback(
    (id: string, text: string, author: string) =>
      setItems((xs) =>
        xs.map((n) =>
          n.id === id
            ? {
                ...n,
                remarks: [
                  ...n.remarks,
                  { id: `r-${Date.now()}`, text: text.trim(), author, at: new Date().toISOString() },
                ],
              }
            : n,
        ),
      ),
    [],
  )

  const removeRemark = useCallback(
    (id: string, remarkId: string) =>
      setItems((xs) =>
        xs.map((n) => (n.id === id ? { ...n, remarks: n.remarks.filter((r) => r.id !== remarkId) } : n)),
      ),
    [],
  )

  const remove = useCallback((id: string) => setItems((xs) => xs.filter((n) => n.id !== id)), [])

  const restore = useCallback(
    (n: AppNotification, index: number) =>
      setItems((xs) => {
        const next = [...xs]
        next.splice(index, 0, n)
        return next
      }),
    [],
  )

  return { items, unreadCount, toggleRead, togglePin, markAllRead, remove, restore, addRemark, removeRemark }
}
