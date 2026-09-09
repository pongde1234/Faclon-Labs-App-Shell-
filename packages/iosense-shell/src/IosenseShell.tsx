import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AppShell } from '@faclon-labs/design-sdk/AppShell'
// Overlay scrollbar only — this subpath imports nothing but React, so it does
// NOT pull in fds's token stylesheet and cannot re-skin the design-sdk shell.
import { useScrollBars } from '@faclon-labs/fds/scrollarea'

import { AppSideNav } from './AppSideNav'
import { AppTopBar, type Crumb } from './AppTopBar'
import { AppNavDrawer } from './AppNavDrawer'
import { WorkspaceLabel } from './WorkspaceSwitcher'
import { useIsMobile } from './useIsMobile'
import { railThemeFor, useAppTheme, type ThemePreference } from './useAppTheme'
import type { Profile } from './profile'
import type { AppNotification } from './notifications'
import type { NavItem } from './navItems'

const PINNED_KEY = 'iosense:sidenav-pinned'

export interface IosenseShellProps {
  /**
   * The rail's rows. **Empty by default** — this package ships the chrome's
   * behaviour, not its contents. See `navItems.ts` for the three shapes, and
   * `demo/iosenseNav.tsx` for a complete worked example — it is not exported,
   * because those rows are the iosense product's own pages.
   */
  navItems?: NavItem[]
  /** Current page id. Must match a nav id for the rail to mark it active. */
  activeId: string
  onNavigate: (id: string) => void
  /** Breadcrumb trail. Build it with `buildTrail` — see trail.ts. */
  trail: Crumb[]
  profile: Profile
  notifications: AppNotification[]
  unreadCount: number
  /** Where the bell's "view all" goes. */
  onOpenNotifications: () => void

  /**
   * Extra top-bar controls, to the LEFT of the bell and the avatar.
   *
   * This is where an application launcher or an assistant button goes. Neither
   * ships: one lists applications only the host can enumerate, the other opens
   * an assistant this package knows nothing about.
   */
  actions?: ReactNode

  /**
   * The brand mark in the rail header. **Set this.** Left unset, design-sdk
   * renders its own built-in iosense mark, so an unbranded install silently
   * ships someone else's logo.
   */
  logo?: ReactNode

  /** Organisation row in the rail header. Defaults to the profile's `org`. */
  workspace?: ReactNode

  /**
   * The rail's footer. **Empty by default** — Help is what the iosense product
   * puts here, not something every host wants. Build rows with `NavFooterRow`
   * so their labels fade with the rail like every other row.
   */
  sideNavFooter?: ReactNode

  /**
   * Rail pin state. Omit and the shell owns it — including the width-aware
   * first-run default and the localStorage write on toggle. Pass both to drive
   * it yourself.
   */
  isPinned?: boolean
  onPinnedChange?: (next: boolean) => void

  /** Theme. Omit and the shell runs its own `useAppTheme`. */
  preference?: ThemePreference
  onPreferenceChange?: (next: ThemePreference) => void

  /** The page. Rendered inside the scrolling content sheet. */
  children: ReactNode
}

/**
 * The iosense chrome, assembled.
 *
 * WHY THIS EXISTS. The individual pieces — rail, top bar, drawer, menus — are
 * exported on their own, but mounting them is not enough to get the product's
 * look, because `theme-overrides.css` styles the CONTENT AREA through markup
 * none of those pieces render:
 *
 *   .fds-app-shell[data-topbar='column']      the bar sits above the sheet
 *   [data-sidenav-pinned='true'] …            the pinned-rail offset and shadow
 *   .app-scroll-frame > .app-main-scroll      the 16px inset and the overlay bar
 *
 * Hand-assembling all of that and getting one attribute wrong gives you a shell
 * that looks nearly right and is subtly not — no content inset, a native
 * scrollbar, no rail offset. So the assembly ships as a component rather than as
 * instructions in a README.
 *
 * WHAT IT OWNS: rail pin (persisted), the mobile drawer, the theme attribute,
 * the Ctrl/Cmd+B shortcut, and the scroller. WHAT IT DOES NOT: routing, page
 * titles, or any page content — `children` is rendered verbatim.
 */
export function IosenseShell({
  navItems,
  activeId,
  onNavigate,
  trail,
  profile,
  notifications,
  unreadCount,
  onOpenNotifications,
  actions,
  logo,
  workspace,
  sideNavFooter,
  isPinned: pinnedProp,
  onPinnedChange,
  preference: preferenceProp,
  onPreferenceChange,
  children,
}: IosenseShellProps) {
  // Open by default: a first run then shows labels rather than 17 bare icons.
  // An explicit choice always wins and is always persisted. With nothing
  // stored, the DEFAULT is width-aware: 240px of rail against a ~660px content
  // column is a bad trade on a small laptop, so anything under 1024 starts
  // collapsed. Above that, open is still the starting point.
  const [pinnedState, setPinnedState] = useState(() => {
    const stored = localStorage.getItem(PINNED_KEY)
    if (stored !== null) return stored !== 'false'
    return window.innerWidth >= 1024
  })
  const isPinned = pinnedProp ?? pinnedState

  const ownTheme = useAppTheme()
  const preference = preferenceProp ?? ownTheme.preference
  const setPreference = onPreferenceChange ?? ownTheme.setPreference
  // `resolved` has to follow whichever preference is in force, and the hook only
  // resolves its own. Re-resolving here would duplicate the media-query logic,
  // so a controlled caller gets the hook's value for 'system' and its own
  // otherwise — the same answer for every non-'system' preference.
  const resolved =
    preferenceProp && preferenceProp !== 'system' ? preferenceProp : ownTheme.resolved

  const isMobile = useIsMobile()
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false)

  // The drawer only exists below the breakpoint; leaving it "open" across a
  // resize would hide a rail that is now on screen behind a panel that is not.
  useEffect(() => {
    if (!isMobile) setIsNavDrawerOpen(false)
  }, [isMobile])

  // Persist on the TOGGLE, not in an effect on the value. An effect fires for
  // the width-aware initial default too, so merely opening the app on a phone
  // or a small laptop wrote 'false' — which then collapsed the rail the next
  // time that browser opened it on a desktop. Only a deliberate press is a
  // preference; everything else is just today's viewport.
  const togglePin = useCallback(() => {
    const next = !(pinnedProp ?? pinnedState)
    localStorage.setItem(PINNED_KEY, String(next))
    if (onPinnedChange) onPinnedChange(next)
    else setPinnedState(next)
  }, [pinnedProp, pinnedState, onPinnedChange])

  // Ctrl/Cmd+B toggles the sidebar, following the usual editor convention.
  // Skipped while typing so it never hijacks a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key.toLowerCase() !== 'b') return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      e.preventDefault()
      if (isMobile) setIsNavDrawerOpen((v) => !v)
      else togglePin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // Both are real dependencies, not lint noise: with an empty array the
    // handler closes over the FIRST isMobile, so Ctrl+B would keep pinning a
    // rail that had since become a drawer until the next reload.
  }, [isMobile, togglePin])

  // The page scroller is OURS, so <main> stays a positioned, non-scrolling
  // column and the overlay bars can be rendered as a SIBLING of the scroller —
  // which is what they need to sit still while the content moves under them.
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollBars = useScrollBars(scrollRef, 'y')

  const railTheme = railThemeFor(resolved)
  const workspaceNode = workspace ?? <WorkspaceLabel name={profile.org} />

  return (
    <AppShell
      theme="Light"
      contentPadding={0}
      /* AppShell stamps `data-theme` on its own root element from the `theme`
         prop, whose type is only 'Light' | 'Dark'. fds's light token block is
         `:root, [data-theme='light'], [data-color-scheme]`, so a hard-coded
         "light" there BINDS THE LIGHT PALETTE TO THE SHELL and shadows the
         document's dark values for everything inside it — the tokens resolve
         correctly at :root while every surface still paints light.
         The provider writes its own attribute before spreading rest props, so
         passing the resolved theme here wins. 'brand' matches neither package's
         block, which is what we want: the brand page is light. */
      data-theme={resolved}
      // The bar lives in AppShell's slot above the sheet. The attribute stays
      // because the sheet's top margin keys off it.
      data-topbar="column"
      // Drives the pinned-rail CSS in theme-overrides.css. The SDK rail is
      // hover-expand only, so holding it open is an app-level override.
      data-sidenav-pinned={isPinned ? 'true' : undefined}
      topNav={
        <AppTopBar
          trail={trail}
          onNavigate={onNavigate}
          profile={profile}
          preference={preference}
          onPreferenceChange={setPreference}
          notifications={notifications}
          unreadCount={unreadCount}
          onOpenNotifications={onOpenNotifications}
          actions={actions}
          isPinned={isPinned}
          isMobile={isMobile}
          isNavDrawerOpen={isNavDrawerOpen}
          // One control, two jobs. Below the breakpoint there is no rail to
          // pin, so the same button opens the drawer; above it, it pins.
          onTogglePin={() => (isMobile ? setIsNavDrawerOpen((v) => !v) : togglePin())}
        />
      }
      sideNav={
        isMobile ? undefined : (
          <AppSideNav
            items={navItems}
            logo={logo}
            footer={sideNavFooter}
            activeId={activeId}
            onNavigate={onNavigate}
            isPinned={isPinned}
            railTheme={railTheme}
            workspace={workspaceNode}
          />
        )
      }
    >
      {/* Only below the breakpoint — above it the same nav is the rail in the
          shell's sideNav slot, and mounting both would run two copies of the
          open-groups state. */}
      {isMobile && (
        <AppNavDrawer
          items={navItems}
          logo={logo}
          footer={sideNavFooter}
          isOpen={isNavDrawerOpen}
          onClose={() => setIsNavDrawerOpen(false)}
          activeId={activeId}
          onNavigate={onNavigate}
          railTheme={railTheme}
          workspace={workspaceNode}
        />
      )}

      {/* The scroller is this div and the overlay bars are its sibling, so the
          thumb sits still while the content moves under it. The frame is what
          the bars are positioned against — anchoring them to <main> instead let
          the thumb run up over the sheet's top edge.

          `.app-main-scroll` owns the WHOLE spacing rule: 16px left, right and
          top, none at the bottom (a scrolling column has no bottom to pad, only
          a cut-off), and 16px between blocks. Page roots add nothing — one
          owner, so there is no second declaration to keep in sync. Retune with
          --shell-content-pad / --shell-content-gap. See STORY.md §3. */}
      <div className="app-scroll-frame">
        <div className="app-main-scroll" ref={scrollRef}>
          {children}
        </div>
        {scrollBars}
      </div>
    </AppShell>
  )
}
