import { useCallback, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { IconButton, LinkButton } from '@faclon-labs/fds/button'
import { Popover } from '@faclon-labs/fds/popover'
import { ActionList, ActionListItem } from '@faclon-labs/fds/actionlist'
import { Indicator } from '@faclon-labs/fds/indicator'
import { Counter } from '@faclon-labs/fds/counter'
import { EmptyState } from '@faclon-labs/fds/emptystate'

import { KIND_COLOR, KIND_LABEL, type AppNotification } from './notifications'

/** How many rows the quick view shows before "View more" takes over. */
const PREVIEW_COUNT = 5

/** "2h", "Yesterday", "12 Mar" — the bell only has room for the short form. */
function shortWhen(at: string): string {
  const then = new Date(at)
  const mins = Math.round((Date.now() - then.getTime()) / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m`
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h`
  if (mins < 60 * 24 * 2) return 'Yesterday'
  return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/**
 * The bell's quick view: the most recent notifications, with a "View more" that
 * hands off to the full page.
 *
 * The bell used to navigate straight to the page. A peek is the cheaper
 * interaction — most of the time the title is the whole answer — and it keeps
 * the user where they are, which is the same argument the rail flyout makes.
 *
 * Rows carry no per-row actions on purpose: read/pin/dismiss all live on the
 * page, and a preview that can mutate state invites mis-clicks at speed.
 */
export function NotificationMenu({
  items,
  unreadCount,
  onOpenAll,
}: {
  items: AppNotification[]
  unreadCount: number
  onOpenAll: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const listRef = useRef<HTMLElement | null>(null)

  // ActionList is not a forwardRef, so the focus target is found by query —
  // and Popover's default initial focus is the ✕ this panel hides.
  const mountList = useCallback((node: HTMLDivElement | null) => {
    listRef.current = node?.querySelector<HTMLElement>('.ds-action-list') ?? null
  }, [])

  const preview = items.slice(0, PREVIEW_COUNT)

  const openAll = () => {
    setIsOpen(false)
    onOpenAll()
  }

  return (
    <Popover
      placement="bottom-end"
      title="Notifications"
      isOpen={isOpen}
      onOpenChange={({ isOpen: next }) => setIsOpen(next)}
      initialFocusRef={listRef}
      content={
        <div className="notif-menu" ref={mountList}>
          <p className="notif-menu__head">
            Notifications
            {unreadCount > 0 && <span className="notif-menu__unread">{unreadCount} new</span>}
          </p>

          {preview.length === 0 ? (
            <EmptyState
              size="Medium"
              title="You're all caught up"
              description="New alerts and reports will land here."
            />
          ) : (
            <ActionList accessibilityLabel="Recent notifications">
              {preview.map((n) => (
                <ActionListItem
                  key={n.id}
                  value={n.id}
                  title={n.title}
                  description={`${KIND_LABEL[n.kind]} · ${n.source} · ${shortWhen(n.at)}`}
                  leading={
                    <Indicator
                      color={KIND_COLOR[n.kind]}
                      emphasis={n.isRead ? 'Subtle' : 'Intense'}
                      accessibilityLabel={n.isRead ? 'Read' : 'Unread'}
                    />
                  }
                  onClick={openAll}
                />
              ))}
            </ActionList>
          )}
        </div>
      }
      footer={<LinkButton size="sm" label="View more" onClick={openAll} />}
    >
      <span className="topnav__bell">
        <IconButton
          icon={Bell}
          size="Medium"
          isHighlighted
          accessibilityLabel={
            unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'
          }
          // Popover's useClick supplies the real handler on the cloned span.
          onClick={() => {}}
        />
        {/* Counter, not a hand-rolled pill: this is a quantity, which is
            Counter's job rather than Badge's (a word) or Indicator's (a state).

            Negative by product decision. The guard would say Neutral here — it
            reserves Negative for counts OF failures, and these are mostly
            completed reports — but the call is that an unread badge should read
            as "attend to me", and red is the convention people arrive with.
            Negative Intense measures 5.42:1, so it is one of only two solid
            fills that clear AA; the cost is that red now appears both here and
            on a genuine alert, so keep it off anything else.

            `max` has NO default, so it is set explicitly. Counter deliberately
            has no anchor or overlay mode ("position it yourself"), so
            .topnav__bell-count keeps the corner placement and the cut-out ring —
            and nothing else. aria-hidden: the IconButton's own label already
            announces the count, and an accessibilityLabel here would repeat it. */}
        {unreadCount > 0 && (
          <Counter
            value={unreadCount}
            max={99}
            size="Small"
            color="Negative"
            emphasis="Intense"
            className="topnav__bell-count"
            aria-hidden="true"
          />
        )}
      </span>
    </Popover>
  )
}
