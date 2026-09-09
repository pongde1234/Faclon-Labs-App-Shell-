import type { ReactNode } from 'react'

import { Box } from './Box'
import { CloseIcon } from './icons'
import { useShell } from './NavContext'
import { SideNavLink } from './SideNavLink'
import type { NavSection } from './types'
import styles from './SideNav.module.css'
import interactive from './interactive.module.css'

/**
 * The sidebar frame: a brand header, a scrolling body, a footer.
 *
 * The shell renders NO nav rows of its own. Everything between the header and
 * the footer comes from the `navItems` the consumer passes — the frame is the
 * part that is reusable, the entities never are.
 */

export function SideNavBrand({ children }: { children: ReactNode }) {
  return <div className={styles.brand}>{children}</div>
}

/** The scrolling middle. Also the flex child that absorbs leftover height. */
export function SideNavBody({ children }: { children: ReactNode }) {
  return <div className={styles.body}>{children}</div>
}

/**
 * A labelled group of rows.
 *
 * The label is a `<div>` with `id`, referenced by the list's
 * `aria-labelledby` — not a heading. Headings imply a document outline the
 * sidebar does not have, and screen-reader users navigating by heading would
 * find "Payments" competing with the page's own H1.
 */
export function SideNavSection({
  label,
  labelId,
  children,
}: {
  label?: string
  labelId?: string
  children: ReactNode
}) {
  return (
    <div className={styles.section}>
      {label && (
        <div className={styles.sectionLabel} id={labelId}>
          {label}
        </div>
      )}
      <ul className={styles.list} aria-labelledby={label ? labelId : undefined}>
        {children}
      </ul>
    </div>
  )
}

export function SideNavFooter({ children }: { children: ReactNode }) {
  return <div className={styles.footer}>{children}</div>
}

interface SideNavProps {
  navItems: NavSection[]
  brand?: ReactNode
  footer?: ReactNode
  /** Present only in drawer mode — the rail has no room for a close button. */
  onDismiss?: () => void
  id: string
}

export function SideNav({ navItems, brand, footer, onDismiss, id }: SideNavProps) {
  const { isMobile } = useShell('SideNav')
  return (
    // Labelled, because a page can hold several <nav>s and "Main" is what
    // distinguishes this one in a screen reader's landmark list.
    <Box
      as="nav"
      aria-label="Main"
      id={id}
      data-shell-region="sidenav"
      display="flex"
      flexDirection="column"
      height="full"
      background="navSurface"
      overflow="hidden"
    >
      <div className={styles.header}>
        <SideNavBrand>{brand}</SideNavBrand>
        {/* The drawer's own dismiss. On desktop the toggle lives in the top bar
            instead: a control that hides a panel cannot sit inside that panel,
            because collapsed there are 56px and nowhere to put it. In a drawer
            that reasoning does not apply — the overlay is dismissed, not
            shrunk, so the ✕ belongs where the eye already is. */}
        {isMobile && onDismiss && (
          <button
            type="button"
            className={interactive.iconButton}
            onClick={onDismiss}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <SideNavBody>
        {navItems.map((section) => (
          <SideNavSection
            key={section.id}
            label={section.label}
            labelId={`${id}-${section.id}`}
          >
            {section.items.map((item) => (
              <SideNavLink key={item.id} item={item} />
            ))}
          </SideNavSection>
        ))}
      </SideNavBody>

      {footer && <SideNavFooter>{footer}</SideNavFooter>}
    </Box>
  )
}
