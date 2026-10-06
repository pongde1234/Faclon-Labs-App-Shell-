import type { ReactNode } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem } from '@faclon-labs/fds/breadcrumb'
import { IconButton } from '@faclon-labs/fds/button'
import { Tooltip } from '@faclon-labs/fds/tooltip'
import { TopNav, TopNavActions, TopNavContent } from '@faclon-labs/design-sdk/TopNav'


import { NotificationBell } from './NotificationBell'
import { ProfileMenu } from './ProfileMenu'
import type { Profile } from './profile'
import type { ThemePreference } from './useAppTheme'

/** One step in the top bar's trail. No `id` means a section label, not a page. */
export interface Crumb {
  label: string
  id?: string
}

export interface AppTopBarProps {
  trail: Crumb[]
  /** Current page — the launcher marks its tile. */
  onNavigate: (id: string) => void
  profile: Profile
  preference: ThemePreference
  onPreferenceChange: (next: ThemePreference) => void
  /** Newest first; the bell previews the top few. */
  unreadCount: number
  onOpenNotifications: () => void
  /**
   * THE SECOND CONTAINER: the assistant, on its own.
   *
   * Separate from `actions` because it is not an icon — it is a labelled
   * button, and it sits flush against the icon container with no gap between
   * them. Passing it through `actions` would put it inside that container and
   * give it the icons' spacing.
   *
   * Empty by default: what the assistant is, and whether there is one, is the
   * product's business and not the shell's.
   */
  assistant?: ReactNode
  /**
   * THE THIRD CONTAINER: extra icons, to the left of the bell and the avatar.
   *
   * Whatever goes here joins the same row as the two the shell mounts itself
   * and takes the same spacing, so a control added later lands in line without
   * anyone touching the stylesheet.
   */
  actions?: ReactNode
  /** Rail state. The bar owns the control that changes it — see the toggle below. */
  isPinned: boolean
  onTogglePin: () => void
  /** Below the breakpoint the leading control opens the nav drawer instead. */
  isMobile?: boolean
  isNavDrawerOpen?: boolean
}

/**
 * A crumb with no page behind it — a section label, drawn as text.
 *
 * fds has no such render. BreadcrumbItem is either the current page
 * (`<span aria-current="page">`) or a LinkButton, which is a tabbable
 * `<button>` even with no onClick — so a label with nothing behind it came out
 * as a dead control. `isCurrentPage` is not a substitute either: it would stamp
 * `aria-current="page"` on two crumbs at once, which is the same "two things
 * marked as the one you are on" defect already fixed in the rail.
 *
 * Breadcrumb's root is a plain `<nav><ol>{children}</ol></nav>` that adds
 * nothing per child, so an <li> of ours composes straight in. It reuses two of
 * fds's classes deliberately: `ds-breadcrumb__item` carries the 4px gap, and
 * `ds-breadcrumb__separator` inherits fds's own `:last-child` hide rule, so
 * this crumb behaves like any other if it ever lands last.
 *
 * `BodyLargeMedium` is what `size="Large"` maps to in BreadcrumbItem's own
 * TEXT_CLASS. It is written out to match the hardcoded size on the Breadcrumb
 * below — the two move together.
 */
function StaticCrumb({ label }: { label: string }) {
  return (
    <li className="ds-breadcrumb__item">
      <span className="app-topbar__crumb-static BodyLargeMedium">{label}</span>
      <span className="ds-breadcrumb__separator BodyLargeMedium" aria-hidden="true">
        /
      </span>
    </li>
  )
}

/**
 * The application top bar, in AppShell's own `topNav` slot above the sheet.
 *
 * This used to be an A/B experiment: #memory pinned the bar INSIDE the sheet as
 * the first child of <main>, everything else used the shell slot. The slot
 * version won and the in-sheet variant is gone, along with its `inSheet` prop
 * and the `.app-topbar--in-sheet` surface it needed — the bar sits above the
 * sheet on every page now.
 *
 * `isSticky` is left at its default (true), which is what pins it.
 */
export function AppTopBar({
  trail,
  onNavigate,
  profile,
  preference,
  onPreferenceChange,
  unreadCount,
  onOpenNotifications,
  assistant,
  actions,
  isPinned,
  onTogglePin,
  isMobile = false,
  isNavDrawerOpen = false,
}: AppTopBarProps) {
  // The same button either pins the rail or opens the drawer, so its label and
  // glyph have to describe whichever it currently does. A hamburger would be a
  // third idiom for the one control; PanelLeft* already says "the panel on the
  // left", which is true in both modes.
  const navOpen = isMobile ? isNavDrawerOpen : isPinned
  const navLabel = isMobile
    ? navOpen ? 'Close navigation' : 'Open navigation'
    : navOpen ? 'Close sidebar' : 'Open sidebar'
  return (
    <TopNav>
      <TopNavContent>
        {/* The rail's collapse control lives HERE, not in the rail. A control
            that hides a panel cannot sit inside that panel: collapsed, the rail
            is 48px wide, which is why this used to exist twice — a close button
            in the rail header and a duplicate "Open sidebar" row in the list.
            One button in fixed chrome replaces both, and it does not move when
            the thing it operates on does.

            The glyph flips because the button is a state toggle, not a command:
            it shows what pressing it will do. */}
        <Tooltip content={isMobile ? navLabel : `${navLabel} (Ctrl+B)`}>
          <IconButton
            className="app-topbar__lead"
            icon={navOpen ? PanelLeftClose : PanelLeftOpen}
            size="Medium"
            isHighlighted
            onClick={onTogglePin}
            accessibilityLabel={navLabel}
          />
        </Tooltip>

        {/* `size` belongs on the root — the guard notes it is cloned onto every
            item and overrides any per-item size.

            Three renders, one rule: the last crumb is the current page, a crumb
            with an id is a link, and a crumb with neither is text. That last
            case is StaticCrumb above — fds would otherwise give it a tabbable
            button that navigates nowhere. */}
        <Breadcrumb size="Large" className="app-topbar__trail">
          {trail.map((c, i) => {
            const isCurrent = i === trail.length - 1
            if (!isCurrent && !c.id) return <StaticCrumb key={c.label} label={c.label} />
            return (
              <BreadcrumbItem
                key={c.label}
                isCurrentPage={isCurrent}
                onClick={c.id ? () => onNavigate(c.id as string) : undefined}
              >
                {c.label}
              </BreadcrumbItem>
            )
          })}
        </Breadcrumb>
      </TopNavContent>

      {/* THE BAR IS THREE CONTAINERS, left to right:
            1. TopNavContent above — the rail toggle and the trail
            2. the assistant
            3. the icons
          Two and three live in here. The gap BETWEEN them is zero and the gap
          WITHIN the icons is 6px, both set in theme-overrides.css — which is
          why they are two elements rather than one flat row: a single row can
          only have one gap.

          Neither the assistant nor the launcher is part of this package. Both
          are product surfaces rather than chrome — one opens an assistant this
          shell knows nothing about, the other lists applications only the host
          can enumerate — so both arrive as props. */}
      <TopNavActions>
        {assistant && <div className="app-topbar__assistant">{assistant}</div>}
        <div className="app-topbar__icons">
          {actions}
          <NotificationBell unreadCount={unreadCount} onOpen={onOpenNotifications} />
          <ProfileMenu
            profile={profile}
            onOpenProfile={() => onNavigate('profile')}
            preference={preference}
            onPreferenceChange={onPreferenceChange}
          />
        </div>
      </TopNavActions>
    </TopNav>
  )
}
