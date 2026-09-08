import { useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { useDismissOnOutside, useFocusTrap } from './useFocusTrap'
import styles from './Menu.module.css'
import interactive from './interactive.module.css'

/**
 * A trigger button and the panel it opens.
 *
 * Written once and composed by both top-bar menus, because "opens on click,
 * closes on Escape, closes on outside click, returns focus to its trigger" is
 * four behaviours that are easy to get three of. Two menus each implementing
 * their own would differ in whichever one was forgotten.
 *
 * Positioning is CSS, not JavaScript: the panel is anchored to the bottom-right
 * of its trigger inside a `position: relative` wrapper. There is no collision
 * detection and no floating-element library — the top bar is fixed-height
 * chrome at a known edge of the viewport, so the one case a collision
 * library exists to solve does not arise here.
 */
interface MenuProps {
  /** The trigger's accessible name. */
  label: string
  /** The trigger's contents — an icon, an avatar. */
  trigger: ReactNode
  /** Panel contents. Receives a `close` so an item can dismiss the menu. */
  children: (close: () => void) => ReactNode
  /** Extra class on the trigger, for a non-square trigger like an avatar. */
  triggerClassName?: string
}

export function Menu({ label, trigger, children, triggerClassName }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  const close = () => setIsOpen(false)

  // Escape and focus return. The trap is a no-op while closed, so it can be
  // called unconditionally — hooks cannot be.
  useFocusTrap(panelRef, isOpen, close)
  useDismissOnOutside(panelRef, triggerRef, isOpen, close)

  return (
    <div className={styles.wrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={`${interactive.iconButton} ${triggerClassName ?? ''}`}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        {trigger}
      </button>
      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          className={styles.panel}
          role="menu"
          aria-label={label}
          // The fallback focus target for a panel whose first render has
          // nothing focusable in it — an empty notifications list, say.
          tabIndex={-1}
        >
          {children(close)}
        </div>
      )}
    </div>
  )
}

/** A menu heading. Not a nav row, so it does not compose the interactive row. */
export function MenuHeader({ children }: { children: ReactNode }) {
  return <div className={styles.header}>{children}</div>
}

export function MenuSeparator() {
  return <div className={styles.separator} role="separator" />
}

/**
 * One actionable row. A real `<button>` with `role="menuitem"` — never a
 * clickable div, and never an `<a>` unless it actually navigates.
 */
export function MenuItem({
  children,
  onClick,
  tone,
}: {
  children: ReactNode
  onClick?: () => void
  /** `danger` for a destructive action — sign out, delete. */
  tone?: 'danger'
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`${styles.item} ${tone === 'danger' ? styles.danger : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

/** The scrolling region of a long menu, so the header stays put. */
export function MenuList({ children }: { children: ReactNode }) {
  return <div className={styles.list}>{children}</div>
}
