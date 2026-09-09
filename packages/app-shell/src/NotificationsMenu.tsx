import { BellIcon } from './icons'
import { Menu, MenuHeader, MenuList, MenuSeparator } from './Menu'
import type { ShellNotification } from './types'
import styles from './NotificationsMenu.module.css'
import interactive from './interactive.module.css'

interface NotificationsMenuProps {
  items: ShellNotification[]
  /** Derived from `items` when omitted. Pass it when the server knows better
      than the previewed slice does. */
  unreadCount?: number
  /** A row was activated. The shell does no routing of its own. */
  onSelect?: (id: string) => void
  /** Renders the footer action only when provided. */
  onViewAll?: () => void
}

/**
 * The notifications bell and its panel.
 *
 * Generic by construction: it knows nothing but the ShellNotification shape in
 * types.ts, and it formats no dates — `timestamp` arrives already a string,
 * because a date library is not a dependency this package may take.
 */
export function NotificationsMenu({
  items,
  unreadCount,
  onSelect,
  onViewAll,
}: NotificationsMenuProps) {
  const unread = unreadCount ?? items.filter((n) => n.isUnread).length
  const label = unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'

  return (
    <Menu
      label={label}
      trigger={
        <span className={styles.trigger}>
          <BellIcon />
          {/* aria-hidden: the count is already in the trigger's accessible
              name, and announcing it twice is worse than not at all. */}
          {unread > 0 && (
            <span className={styles.dot} aria-hidden="true">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </span>
      }
    >
      {(close) => (
        <>
          <MenuHeader>{label}</MenuHeader>
          <MenuSeparator />
          <MenuList>
            {items.length === 0 ? (
              <p className={styles.empty}>Nothing new.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  role="menuitem"
                  className={`${interactive.row} ${styles.item}`}
                  onClick={() => {
                    onSelect?.(n.id)
                    close()
                  }}
                >
                  <span
                    className={styles.unread}
                    data-unread={n.isUnread || undefined}
                    aria-hidden="true"
                  />
                  <span className={styles.body}>
                    <span className={styles.title}>{n.title}</span>
                    {n.detail && <span className={styles.detail}>{n.detail}</span>}
                    {n.timestamp && <span className={styles.time}>{n.timestamp}</span>}
                  </span>
                </button>
              ))
            )}
          </MenuList>
          {onViewAll && (
            <>
              <MenuSeparator />
              <button
                type="button"
                role="menuitem"
                className={`${interactive.row} ${styles.viewAll}`}
                onClick={() => {
                  onViewAll()
                  close()
                }}
              >
                View all
              </button>
            </>
          )}
        </>
      )}
    </Menu>
  )
}
