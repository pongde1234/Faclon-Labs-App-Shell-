import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { Box } from './Box'
import { ShellContext } from './NavContext'
import { SideNav } from './SideNav'
import { NotificationsMenu } from './NotificationsMenu'
import { ProfileMenu } from './ProfileMenu'
import { TopNav } from './TopNav'
import type { AppShellProps, LinkComponent } from './types'
import { useFocusTrap } from './useFocusTrap'
import { useTransitionGuard } from './useTransitionGuard'

import './tokens.css'
import styles from './AppShell.module.css'

/** Matches the 768px in the stylesheets. See the note in tokens.css. */
const MOBILE_BREAKPOINT = 768

/**
 * Hover intent. Opening is delayed so crossing the rail on the way somewhere
 * else does not trigger it; closing is delayed longer so travelling between
 * rows does not make it flicker shut. Closing is always the more forgiving.
 */
const PEEK_OPEN_MS = 120
const PEEK_CLOSE_MS = 220

/**
 * These mirror --shell-collapse-duration and --shell-drawer-duration in
 * tokens.css. They exist only to size the FALLBACK timers, so a consumer who
 * retunes the CSS custom property gets a slightly loose fallback rather than a
 * broken one — the timer is a backstop for when transitionend never arrives,
 * not the thing that drives the animation.
 */
const COLLAPSE_MS = 200
const DRAWER_MS = 200

/**
 * Below the breakpoint the sidebar is an overlay drawer rather than chrome.
 *
 * `matchMedia` rather than a resize listener: the browser evaluates the query
 * itself and fires only when the answer changes, instead of on every pixel of a
 * drag. The initialiser also has to run on the first render — a `useEffect`
 * would render the desktop layout once on a phone and then correct it.
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

/**
 * The application shell: a sticky top bar, a sidebar, and a content area that
 * scrolls independently of both.
 *
 * LAYOUT, and the two rules that make it predictable:
 *
 *  - The sidebar is `position: absolute` inside a `position: relative` wrapper.
 *    It takes NO part in flex flow, so its width can animate, it can become an
 *    overlay at a breakpoint, and it can be hidden entirely — none of which
 *    reflows the content beside it.
 *  - The content area is offset by `margin-left` alone. Flexing beside the
 *    sidebar would make the content's width a function of the sidebar's, and
 *    every collapse would then reflow and repaint the whole page.
 *
 * State: the collapsed rail is always the shell's own. The mobile drawer is
 * optionally controlled — pass `isSidebarOpen` and you own it.
 */
export function AppShell({
  navItems,
  currentPath,
  linkComponent,
  brand,
  topNavContent,
  topNavActions,
  notifications,
  profile,
  footer,
  collapsible = 'icon',
  expandOnHover = true,
  side = 'left',
  isSidebarOpen,
  onSidebarDismiss,
  children,
}: AppShellProps) {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const navId = useId()
  const mainId = useId()
  const drawerRef = useRef<HTMLDivElement>(null)

  /**
   * Nothing animates on the first paint.
   *
   * The transitions in AppShell.module.css are all scoped to `[data-mounted]`,
   * which is set one frame after mount. Without it a shell rendered with the
   * rail already collapsed — a restored preference, an SSR'd page — plays a
   * 200ms opening animation the user never asked for, on every single load.
   */
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const collapse = useTransitionGuard(COLLAPSE_MS)

  /**
   * The temporary hover preview, which is a different thing from being open.
   *
   * "Pinned" is the click state and moves the page. "Peeking" is the hover
   * state and floats over it. Keeping them separate is what stops a hover from
   * reflowing the content — see the CSS, where a peek holds the content offset
   * at the collapsed width while the panel itself is full size.
   */
  const [isPeeking, setIsPeeking] = useState(false)
  const peekTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(peekTimer.current), [])

  /** The rail only collapses on desktop, and only when collapsing is enabled. */
  const isRailCollapsed = isCollapsed && !isMobile && collapsible !== 'none'

  const isControlled = isSidebarOpen !== undefined
  const isDrawerOpen = isControlled ? isSidebarOpen : uncontrolledOpen

  /**
   * The drawer has to outlive its own dismissal, or there is nothing left on
   * screen to animate out — `{isOpen && <Drawer/>}` can only ever animate IN.
   *
   * `mounted` keeps it in the DOM; `visible` is the flag the CSS transitions
   * against. A transition needs a starting value the browser has actually
   * PAINTED — with no painted "closed" frame there is nothing to interpolate
   * from and the drawer just appears.
   *
   * Hence the DOUBLE requestAnimationFrame, which is not superstition. An
   * effect runs after commit but before paint, and a single rAF callback also
   * runs before that same paint — so `mounted` and `visible` would both land
   * in one frame and the closed state would never reach the screen. Measured
   * exactly that: opacity was already 1 at 30ms. The inner rAF defers to the
   * NEXT frame, after "closed" has been painted.
   */
  const [drawerMounted, setDrawerMounted] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  useEffect(() => {
    if (isMobile && isDrawerOpen) {
      setDrawerMounted(true)
      let inner = 0
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setDrawerVisible(true))
      })
      return () => {
        cancelAnimationFrame(outer)
        cancelAnimationFrame(inner)
      }
    }
    setDrawerVisible(false)
    // Unmount after the exit. The effect's own cleanup cancels it, which
    // covers unmount-mid-animation as well as a reopen that interrupts it.
    const id = setTimeout(() => setDrawerMounted(false), DRAWER_MS + 50)
    return () => clearTimeout(id)
  }, [isMobile, isDrawerOpen])

  const closeDrawer = useCallback(() => {
    if (isControlled) onSidebarDismiss?.()
    else setUncontrolledOpen(false)
  }, [isControlled, onSidebarDismiss])

  const toggleNav = useCallback(() => {
    if (isMobile) {
      if (isDrawerOpen) {
        closeDrawer()
        return
      }
      // Opening, and only the uncontrolled shell can do it.
      //
      // The prop contract is `isSidebarOpen` + `onSidebarDismiss` — a
      // controlled DISMISSAL, with no matching open callback. So when a
      // consumer owns the state, opening is theirs to trigger from their own
      // control; this button can only close. The previous version called
      // `onSidebarDismiss()` here, which asked the consumer to CLOSE a drawer
      // that was already closed — at best a no-op, at worst a confusing
      // callback with nothing behind it.
      if (!isControlled) setUncontrolledOpen(true)
      return
    }
    // `none` means the rail does not collapse at all, so there is nothing to
    // animate and nothing to guard.
    if (collapsible === 'none') return
    collapse.begin()
    setIsCollapsed((c) => !c)
  }, [isMobile, isDrawerOpen, isControlled, closeDrawer, collapsible, collapse])

  // A drawer left "open" across a resize to desktop would strand a scroll lock
  // on <body> with no visible control to release it.
  useEffect(() => {
    if (!isMobile && isDrawerOpen) closeDrawer()
  }, [isMobile, isDrawerOpen, closeDrawer])

  // The page behind an overlay must not scroll under it.
  useEffect(() => {
    if (!isMobile || !isDrawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isMobile, isDrawerOpen])

  /**
   * `drawerMounted` in the condition, not just `isDrawerOpen`, and it is not
   * belt-and-braces — without it the trap silently does nothing.
   *
   * Opening now takes several renders: the first flips `isDrawerOpen`, an
   * effect mounts the panel, and a double rAF later it becomes visible. On that
   * first render `drawerRef` is still null, so the trap bails on its
   * `if (!container) return` — and its deps never change again, meaning no
   * keydown listener is attached, focus never enters, and Escape stops closing.
   *
   * `drawerVisible` rather than `drawerMounted`, for a second reason found the
   * same way: while mounted-but-not-yet-visible the panel carries `inert`, and
   * the trap's own focusable() filter discards anything inside an inert
   * subtree. It would find no candidate, fall back to focusing the container —
   * which is itself inert — and focus would silently stay on the toggle.
   */
  useFocusTrap(drawerRef, isMobile && isDrawerOpen && drawerVisible, closeDrawer)

  /**
   * Following a link inside the drawer must close it, or the user lands on the
   * new page with the drawer still covering it. Desktop has no such problem, so
   * this is a no-op there.
   */
  const onNavigate = useCallback(() => {
    if (isMobile && isDrawerOpen) closeDrawer()
  }, [isMobile, isDrawerOpen, closeDrawer])

  const shell = useMemo(
    () => ({
      // The rail only collapses on desktop; in a drawer there is room for
      // labels, so a collapsed drawer would be a rail nobody asked for.
      //
      // Restricted to the "icon" mode as well: offcanvas slides the whole
      // panel off screen, so there is no rail left to show glyph-only rows in
      // and telling the rows they are collapsed would be a lie.
      isCollapsed: isRailCollapsed && !isPeeking && collapsible === 'icon',
      isMobile,
      currentPath,
      linkComponent: (linkComponent ?? 'a') as LinkComponent,
      onNavigate,
    }),
    [isRailCollapsed, isPeeking, collapsible, isMobile, currentPath, linkComponent, onNavigate],
  )

  /** Only a collapsed icon rail on a desktop pointer has anything to preview. */
  const canPeek = expandOnHover && collapsible === 'icon' && isRailCollapsed && !isMobile

  const schedulePeek = useCallback(
    (next: boolean) => {
      clearTimeout(peekTimer.current)
      peekTimer.current = setTimeout(
        () => {
          setIsPeeking((current) => {
            // The same guard the click path uses, so labels fade rather than
            // squeeze — without it a peek re-lays-out the text every frame.
            if (current !== next) collapse.begin()
            return next
          })
        },
        next ? PEEK_OPEN_MS : PEEK_CLOSE_MS,
      )
    },
    [collapse],
  )

  // A peek is meaningless once the rail is pinned open, on mobile, or in a mode
  // that has no rail. Left set, it would hold the panel expanded for good.
  useEffect(() => {
    if (!canPeek && isPeeking) {
      clearTimeout(peekTimer.current)
      setIsPeeking(false)
    }
  }, [canPeek, isPeeking])

  const sidebar = (
    <SideNav
      navItems={navItems}
      brand={brand}
      footer={footer}
      onDismiss={closeDrawer}
      id={navId}
    />
  )

  return (
    <ShellContext.Provider value={shell}>
      {/* Two classes, and the split matters: `appShell` is a GLOBAL name from
          tokens.css, not a hashed module class, because it is the handle a
          consumer overrides tokens through. `styles.root` is the hashed one
          carrying our own layout. The data attributes are what the stylesheets
          key their responsive rules off. */}
      <div
        className={`appShell ${styles.root}`}
        // One attribute per axis, and CSS reads all of them. State selectors
        // rather than conditional inline styles: an inline style cannot be
        // transitioned cleanly and cannot be overridden by a consumer.
        // A peek reports as EXPANDED, so every rule that reveals labels, headings
        // and sub-trees applies unchanged. What a peek must not do is move the
        // page, and `data-peek` is what holds the content offset back.
        data-state={isRailCollapsed && !isPeeking ? 'collapsed' : 'expanded'}
        data-peek={isPeeking || undefined}
        data-collapsible={collapsible}
        data-side={side}
        data-mobile={isMobile ? 'true' : 'false'}
        // Present only while a collapse is in flight. Labels are held visible
        // for exactly this window — see useTransitionGuard.
        data-transitioning={collapse.isTransitioning || undefined}
        // Absent on the first paint, which is what suppresses an opening
        // animation on load. Every transition below is scoped to it.
        data-mounted={isMounted || undefined}
      >
        {/* First focusable element on the page. Visually hidden until focused —
            not `display: none`, which would take it out of the tab order and
            defeat the point. */}
        <a className={styles.skipLink} href={`#${mainId}`}>
          Skip to content
        </a>

        <TopNav
          content={topNavContent}
          actions={
            <>
              {/* Consumer extras first, so the two the shell owns always sit
                  hard right and never shuffle when a page adds a control. */}
              {topNavActions}
              {notifications && (
                <NotificationsMenu
                  items={notifications.items}
                  unreadCount={notifications.unreadCount}
                  onSelect={notifications.onSelect}
                  onViewAll={notifications.onViewAll}
                />
              )}
              {profile && <ProfileMenu user={profile.user} actions={profile.actions} />}
            </>
          }
          onToggleNav={toggleNav}
          isNavOpen={isMobile ? isDrawerOpen : !isRailCollapsed}
          navId={navId}
          isMobile={isMobile}
        />

        <div className={styles.body}>
          {isMobile ? (
            <>
              {/* Mounted through the exit animation, then removed — see the
                  drawerMounted effect. A PERMANENTLY mounted drawer would keep
                  its links in the tab order behind the page, so `inert` covers
                  the ~200ms it lingers while sliding out. */}
              {drawerMounted && (
                <>
                  <div
                    className={styles.scrim}
                    data-state={drawerVisible ? 'open' : 'closed'}
                    onClick={closeDrawer}
                    // The Escape key and the ✕ are the accessible paths out;
                    // this is a mouse convenience, so it is hidden rather than
                    // exposed as a second unnamed control.
                    aria-hidden="true"
                  />
                  <div
                    className={styles.drawer}
                    data-state={drawerVisible ? 'open' : 'closed'}
                    ref={drawerRef}
                    tabIndex={-1}
                    // `|| undefined` rather than a bare boolean: it renders the
                    // attribute or omits it entirely, which is correct under
                    // React 18 (where `inert={false}` would emit inert="false"
                    // — and any inert attribute, whatever its value, is inert).
                    inert={!drawerVisible || undefined}
                  >
                    {sidebar}
                  </div>
                </>
              )}
            </>
          ) : (
            <div
              className={styles.sidebar}
              // `pointerType` rather than a CSS hover media query: the listener
              // itself must not fire on touch, where pointerenter arrives with
              // the tap that was meant to follow a link and no leave ever comes.
              onPointerEnter={(e) => {
                if (canPeek && e.pointerType === 'mouse') schedulePeek(true)
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') schedulePeek(false)
              }}
              // Keyboard parity, and not optional: without it a keyboard user
              // tabbing into a collapsed rail gets glyphs with no labels, which
              // is the one group least able to guess what they mean. Capture
              // phase because focus lands on a descendant, never on this div.
              onFocusCapture={() => { if (canPeek) schedulePeek(true) }}
              onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) schedulePeek(false)
              }}
              // The panel and the content beside it must move as one object,
              // so the guard is ended by the PANEL's width transition — the
              // thing whose end actually means "the rail has arrived".
              onTransitionEnd={collapse.onTransitionEnd(
                collapsible === 'offcanvas' ? 'left' : 'width',
              )}
            >
              {sidebar}
            </div>
          )}

          {/* The content area. Its box is props; the module class carries ONLY
              the responsive `margin-left`, which is a media query and therefore
              cannot be one. The two never set the same property. */}
          <Box
            as="main"
            className={styles.content}
            id={mainId}
            tabIndex={-1}
            data-shell-region="content"
            height="belowTopnav"
            overflowY="auto"
            overflowX="hidden"
            boxSizing="border-box"
            padding="content"
            // A spaced column, so anything a consumer drops in is evenly
            // separated without each page inventing its own margins. Reaches
            // direct children only — a page that nests its own wrapper owns
            // the spacing inside it, and the demo's does exactly that using
            // the same token.
            display="flex"
            flexDirection="column"
            gap="contentGap"
          >
            {children}
          </Box>
        </div>
      </div>
    </ShellContext.Provider>
  )
}
