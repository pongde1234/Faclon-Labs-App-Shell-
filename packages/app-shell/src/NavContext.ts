import { createContext, useContext } from 'react'

import type { LinkComponent } from './types'

/**
 * Two contexts, one file.
 *
 * They are split because they change on completely different clocks. Shell
 * state changes when the user collapses the rail or opens the drawer; depth
 * changes at every level of the tree and never afterwards. Merging them would
 * mean re-providing the whole shell state at every nesting level, and every
 * nav row in the tree would re-render on every toggle.
 */

/** Everything a nav row needs that is not about where it sits. */
export interface ShellContextValue {
  /** The rail is 56px and labels are hidden. Drives tooltips. */
  isCollapsed: boolean
  /** Below the tablet breakpoint — the sidebar is an overlay drawer. */
  isMobile: boolean
  /** Drives active state. The shell derives, never stores, what is active. */
  currentPath: string
  /** Default `'a'`. See types.ts — no router is imported anywhere. */
  linkComponent: LinkComponent
  /**
   * Called after a nav link is followed. On mobile this dismisses the drawer,
   * which otherwise stays open on top of the page you just navigated to.
   */
  onNavigate: () => void
}

export const ShellContext = createContext<ShellContextValue | null>(null)

/**
 * Throws rather than returning null. A nav row rendered outside the shell has
 * no link component, no current path and no way to close the drawer — every
 * one of its behaviours would silently do nothing, which is much worse to debug
 * than a message naming the problem.
 */
export function useShell(component: string): ShellContextValue {
  const value = useContext(ShellContext)
  if (!value) {
    throw new Error(`<${component}> must be rendered inside <AppShell>.`)
  }
  return value
}

/**
 * How deep this subtree sits. The root provides 0; every SideNavLink reads it,
 * adds one for itself, and re-provides.
 *
 * Deliberately NOT a prop. Depth is a fact about position in the tree, so a
 * prop would let a caller assert a depth it does not have — and the 3-level cap
 * enforced in SideNavLink would then be trivially defeated by passing the wrong
 * number. Reading it from context makes the cap real.
 *
 * The default of 0 also means a bare `useContext(NavContext)` outside any
 * provider is still valid, so the first link renders at depth 1 as expected.
 */
export const NavContext = createContext<{ depth: number }>({ depth: 0 })

/** The maximum nesting the sidebar supports. A 4th level throws in dev. */
export const MAX_NAV_DEPTH = 3
