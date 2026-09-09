import { Bell } from 'lucide-react'
import { IconButton } from '@faclon-labs/fds/button'
import { Counter } from '@faclon-labs/fds/counter'

/**
 * The bell, and only the bell.
 *
 * THE PANEL IS NOT HERE, and that is deliberate. This package ships the
 * TRIGGER — a control that is always in the same corner of the bar, with a
 * count on it — and hands the click back to you. What opens is yours: a popover
 * of your own, a drawer, a route to a notifications page.
 *
 * The panel was removed rather than kept, because a preview panel is a piece of
 * PRODUCT: it decides how many to show, what a row says, what "view more" does
 * and what the empty state reads. None of that is chrome, and a shell that
 * guessed at it would be wrong for most hosts.
 *
 * IF YOU BUILD ONE, the rules the removed panel followed are written down in
 * STORY.md §2.3 — five is a preview and not a list, the row is
 * `title` over `kind · source · when`, read state is an Indicator's emphasis
 * rather than a second colour, and an empty panel needs an EmptyState because a
 * popover that opens onto nothing reads as broken.
 */
export function NotificationBell({
  unreadCount,
  onOpen,
}: {
  /** Unread count. `0` hides the pill entirely rather than rendering a zero. */
  unreadCount: number
  /** Called on click. Open your own panel, or navigate to your own page. */
  onOpen: () => void
}) {
  return (
    <span className="topnav__bell">
      <IconButton
        icon={Bell}
        size="Medium"
        isHighlighted
        accessibilityLabel={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        onClick={onOpen}
      />
      {/* Counter, not a hand-rolled pill: this is a quantity, which is
          Counter's job rather than Badge's (a word) or Indicator's (a state).

          Negative by product decision. The guard would say Neutral here — it
          reserves Negative for counts OF failures — but the call is that an
          unread badge should read as "attend to me", and red is the convention
          people arrive with. Negative Intense measures 5.42:1, so it is one of
          only two solid fills that clear AA; the cost is that red now appears
          both here and on a genuine alert, so keep it off anything else.

          `max` has NO default, so it is set explicitly — an uncapped count
          stretches the bar. Counter deliberately has no anchor or overlay mode
          ("position it yourself"), so `.topnav__bell-count` keeps the corner
          placement and the cut-out ring, and nothing else. aria-hidden: the
          IconButton's own label already announces the count. */}
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
  )
}
