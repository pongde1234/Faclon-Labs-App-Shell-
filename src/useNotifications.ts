import { useCallback, useMemo, useState } from 'react'

import { type AppNotification } from './notifications'

/**
 * Local notification state, for hosts without a notifications API of their own.
 *
 * The bell badge and the notifications page render the SAME list, so the state
 * cannot live inside either one or they would drift apart — hence one hook the
 * host owns and passes down.
 *
 * `seed` is EMPTY by default. `IOSENSE_NOTIFICATIONS` is our sample data — real
 * alerts about real floors in a real building — and is an example to look at,
 * not a default to inherit.
 */
export function useNotifications(seed: AppNotification[] = []) {
  const [items, setItems] = useState<AppNotification[]>(seed)

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
