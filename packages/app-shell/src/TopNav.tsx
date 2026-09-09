import type { ReactNode } from 'react'

import { Box } from './Box'
import { PanelIcon } from './icons'
import styles from './TopNav.module.css'
import interactive from './interactive.module.css'

/**
 * The top bar. Sticky, fixed height, and the owner of the sidebar toggle.
 *
 * The toggle lives HERE rather than in the sidebar on purpose: a control that
 * hides a panel cannot sit inside that panel. Collapsed, the rail is 56px wide,
 * so the button would have to be duplicated somewhere reachable — one control
 * in fixed chrome replaces both, and it does not move when the thing it
 * operates on does.
 *
 * Two actions are mounted by AppShell — the notifications bell and the profile
 * avatar — and they sit at the right edge in that fixed order. Everything else
 * arrives through `TopNavActions` and is placed to their left.
 *
 * Nothing application-specific is baked in even so: both are driven entirely by
 * the `notifications` and `profile` props, and neither renders without one.
 */

export function TopNavBrand({ children }: { children: ReactNode }) {
  return <div className={styles.brand}>{children}</div>
}

export function TopNavContent({ children }: { children: ReactNode }) {
  return <div className={styles.content}>{children}</div>
}

export function TopNavActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>
}

interface TopNavProps {
  brand?: ReactNode
  content?: ReactNode
  actions?: ReactNode
  onToggleNav: () => void
  /** Whether the panel the toggle operates on is currently showing. */
  isNavOpen: boolean
  /** The sidebar's id, so the toggle can point at what it controls. */
  navId: string
  isMobile: boolean
}

export function TopNav({
  brand,
  content,
  actions,
  onToggleNav,
  isNavOpen,
  navId,
  isMobile,
}: TopNavProps) {
  // The same button either collapses the rail or opens the drawer, so its label
  // has to describe whichever it currently does.
  const label = isMobile
    ? isNavOpen
      ? 'Close navigation'
      : 'Open navigation'
    : isNavOpen
      ? 'Collapse sidebar'
      : 'Expand sidebar'

  return (
    // Static box properties as props; the module class carries nothing but the
    // things inline styles cannot express. See BaseBox for why the two never
    // set the same property.
    <Box
      as="header"
      data-shell-region="topnav"
      flex="none"
      position="sticky"
      top="0"
      zIndex="topnav"
      display="flex"
      alignItems="center"
      gap="spacing.2"
      boxSizing="border-box"
      height="topnavHeight"
      paddingLeft="spacing.3"
      paddingRight="spacing.3"
      background="topnavSurface"
      borderBottom="var(--shell-border-width) solid var(--shell-border)"
      color="text"
      fontSize="md"
      lineHeight="var(--shell-line-height)"
    >
      <button
        type="button"
        className={interactive.iconButton}
        onClick={onToggleNav}
        aria-label={label}
        aria-expanded={isNavOpen}
        aria-controls={navId}
      >
        <PanelIcon />
      </button>
      {brand && <TopNavBrand>{brand}</TopNavBrand>}
      <TopNavContent>{content}</TopNavContent>
      <TopNavActions>{actions}</TopNavActions>
    </Box>
  )
}
