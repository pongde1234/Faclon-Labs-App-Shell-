import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * The selector for "things a user can Tab to".
 *
 * `[tabindex]:not([tabindex="-1"])` rather than `[tabindex="0"]`: a positive
 * tabindex is still reachable, and excluding it would let focus escape through
 * an element the trap never saw.
 */
const FOCUSABLE = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Elements that are in the DOM but cannot actually be reached. */
function isVisible(el: HTMLElement) {
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
}

function focusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => isVisible(el) && !el.hasAttribute('inert') && el.closest('[inert]') === null,
  )
}

/**
 * Traps Tab inside `container` while `isActive`, closes on Escape, and returns
 * focus to whatever was focused before it opened.
 *
 * Shared by the mobile drawer and both top-bar menus, which need exactly the
 * same three behaviours. Writing it once is also what makes them consistent:
 * a drawer that restores focus and a menu that does not is the kind of
 * difference nobody notices until they are using a keyboard.
 *
 * The element to restore to is captured in a ref at open time rather than read
 * at close time, because by then `document.activeElement` is inside the thing
 * being unmounted.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  onEscape: () => void,
) {
  const restoreTo = useRef<HTMLElement | null>(null)
  // Read inside the keydown handler so the effect does not re-run — and the
  // trap does not tear down and rebuild — every time the caller passes a fresh
  // closure, which is every render.
  const escape = useRef(onEscape)
  escape.current = onEscape

  useEffect(() => {
    if (!isActive) return
    const container = containerRef.current
    if (!container) return

    restoreTo.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    // Move focus in. The container itself is the fallback for a panel that has
    // nothing focusable yet — it carries tabIndex={-1} for exactly this.
    const initial = focusable(container)
    ;(initial[0] ?? container).focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        escape.current()
        return
      }
      if (e.key !== 'Tab') return

      // Recomputed on every Tab, not cached at open: a menu whose contents
      // change while open (a list that loads, a section that expands) would
      // otherwise trap against a stale first and last element.
      const items = focusable(container)
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (e.shiftKey && (active === first || active === container)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      // Only if focus is still inside what we are closing. Stealing it back
      // when the user has already clicked elsewhere is its own bug.
      const stillInside =
        document.activeElement instanceof HTMLElement &&
        container.contains(document.activeElement)
      if (stillInside || document.activeElement === document.body) {
        restoreTo.current?.focus()
      }
    }
  }, [containerRef, isActive])
}

/**
 * Calls `onOutside` for a pointerdown outside `containerRef`, ignoring
 * pointerdowns on `ignoreRef` — the trigger, which owns its own toggle and
 * would otherwise close and reopen in the same gesture.
 *
 * `pointerdown` rather than `click`: a click fires after the mouse is released,
 * so a drag that starts inside the menu and ends outside it counts as an
 * outside click and closes the menu mid-selection.
 */
export function useDismissOnOutside(
  containerRef: RefObject<HTMLElement | null>,
  ignoreRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  onOutside: () => void,
) {
  const handler = useRef(onOutside)
  handler.current = onOutside

  useEffect(() => {
    if (!isActive) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (containerRef.current?.contains(target)) return
      if (ignoreRef.current?.contains(target)) return
      handler.current()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [containerRef, ignoreRef, isActive])
}
