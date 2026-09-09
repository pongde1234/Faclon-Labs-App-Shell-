import type { ComponentType, ReactNode } from 'react'

import type { ProfileAction } from './ProfileMenu'

/**
 * The public shape of the shell. Everything here is data or a slot — the shell
 * never reaches for application state, and it imports nothing but React.
 */

/**
 * One row in the sidebar.
 *
 * There is no `level` / `depth` field, and there never will be: depth is a fact
 * about where an item SITS, so `SideNavLink` derives it from context. A prop
 * would let a caller lie about it, and the 3-level cap would then be
 * unenforceable.
 */
export interface NavItem {
  /** Stable identity. Also seeds the `aria-controls` id of an expandable row. */
  id: string
  label: string
  /**
   * Where the row goes. A row with children may omit it — that row becomes a
   * pure expand toggle rather than a link, which is the only honest render for
   * a group that has no page of its own.
   */
  href?: string
  /** Any node. The shell ships no icon library, so this is whatever you use. */
  icon?: ReactNode
  /**
   * Secondary line under the label. HONOURED ONLY AT DEPTH 2 AND 3 — depth 1
   * has to survive collapsing to a 56px icon rail, where there is nowhere to
   * put it. Set at depth 1 it is ignored, and dev builds warn.
   */
  description?: string
  /** Trailing count or status. A number, or your own node. */
  badge?: ReactNode
  /** Hover label while the rail is collapsed. Falls back to `label`. */
  tooltip?: string
  children?: NavItem[]
}

/** A labelled group of rows. The label is a heading, never a link. */
export interface NavSection {
  id: string
  /** Omit for an unlabelled group — the rows render with no heading above them. */
  label?: string
  items: NavItem[]
}

/**
 * One step in a breadcrumb trail.
 *
 * `href` absent is MEANINGFUL, not an oversight: it makes the crumb inert text.
 * Sections that are not pages are exactly this case, and rendering them as
 * links was the bug that prompted the rule. See Breadcrumb.
 */
export interface Crumb {
  label: string
  href?: string
}

/** One row in the notifications menu. */
export interface ShellNotification {
  id: string
  title: string
  /** Optional second line. */
  detail?: string
  /** Pre-formatted by the caller — the shell ships no date library. */
  timestamp?: string
  isUnread?: boolean
}

/** The signed-in user, as far as the shell is concerned. */
export interface ShellUser {
  name: string
  /** Shown under the name in the menu header. */
  email?: string
  /** An image URL. Without one the menu draws initials from `name`. */
  avatarUrl?: string
}

/**
 * A router-agnostic link.
 *
 * The shell renders `<As href={...}>` and nothing more, so this is satisfied by
 * a plain `'a'`, by Next's `Link`, by React Router's, or by your own wrapper.
 * No router is imported anywhere in this package.
 */
export type LinkComponent = ComponentType<Record<string, unknown>>

export interface AppShellProps {
  /** The nav tree, as data. The shell renders no hardcoded rows. */
  navItems: NavSection[]
  /** Drives active state for every row. The shell holds no active state of its own. */
  currentPath: string
  /** Default `'a'`. */
  linkComponent?: LinkComponent
  /** Sidebar header — logo and organisation name. */
  brand?: ReactNode
  /** Left of the top bar, after the sidebar toggle. Breadcrumbs go here. */
  topNavContent?: ReactNode
  /**
   * EXTRA actions, to the left of the two the shell mounts itself.
   *
   * The bell and the avatar are not passed through here — see `notifications`
   * and `profile`. They sit at the right edge in a fixed order so that a user
   * moving between two applications built on this shell finds them in the same
   * place, which is the entire argument for a shell owning them at all.
   */
  topNavActions?: ReactNode
  /**
   * Mounts the notifications bell. Omitted, no bell renders — a shell with
   * nothing to notify about should not draw an affordance that opens an empty
   * panel.
   */
  notifications?: {
    items: ShellNotification[]
    /** Derived from `items` when omitted. Pass it when the server knows better
        than the previewed slice does. */
    unreadCount?: number
    onSelect?: (id: string) => void
    onViewAll?: () => void
  }
  /** Mounts the profile menu. Omitted, no avatar renders. */
  profile?: {
    user: ShellUser
    actions?: ProfileAction[]
  }
  /** Sidebar footer. */
  footer?: ReactNode
  /**
   * What collapsing does on desktop. Default `'icon'`.
   *
   *   icon       narrows to a 56px rail — labels go, glyphs stay
   *   offcanvas  slides fully off the left edge; content takes the full width
   *   none       not collapsible; the toggle only opens the mobile drawer
   *
   * Drives `data-collapsible` on the root, which is what the stylesheets read.
   */
  collapsible?: 'icon' | 'offcanvas' | 'none'
  /**
   * While the rail is collapsed, hovering it expands a temporary preview.
   * Default `true`; `icon` mode only.
   *
   * The peek OVERLAYS the page rather than pushing it. That is the whole
   * design: expanding the layout on mouse-over would reflow the content every
   * time the pointer crossed the rail, which is far worse than not having the
   * feature. Clicking still pins, and a pinned panel is what moves the page.
   *
   * Mouse only — a peek triggered by touch would fire on the tap that was
   * meant to follow a link, and there is no "leave" to end it.
   */
  expandOnHover?: boolean
  /**
   * Which edge the sidebar sits on. Default `'left'`. Sets `data-side`.
   *
   * KNOWN DIFFERENCE on `'right'`: the row icons do not hold still through a
   * collapse the way they do on the left. The panel is pinned by its OUTER
   * edge — so on the left the fixed edge is also the one an icon is measured
   * from, while on the right the icon is measured from the edge that moves and
   * travels with the panel. Measured across one collapse: 1368 → 1200.
   *
   * Holding it still would mean mirroring the row so the icon sits flush to
   * the outer edge — label first, icon last. That is a deliberate visual
   * change rather than a bug fix, so it is left undone until someone wants it.
   */
  side?: 'left' | 'right'
  /**
   * Controlled mobile drawer. Leave undefined and the shell owns the state
   * itself; pass it and you own it, with `onSidebarDismiss` to close.
   *
   * NOTE, because it is asymmetric: this pair is a controlled DISMISSAL, not a
   * controlled toggle — there is no `onSidebarOpen`. While you own the state,
   * the shell top bar button can only CLOSE the drawer; opening it is yours to
   * trigger from your own control. Leave `isSidebarOpen` undefined and the
   * button does both.
   */
  isSidebarOpen?: boolean
  onSidebarDismiss?: () => void
  /** Page content. */
  children: ReactNode
}
