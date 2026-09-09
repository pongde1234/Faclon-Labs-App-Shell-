import { Drawer, DrawerBody } from '@faclon-labs/fds/drawer'

import { AppSideNav } from './AppSideNav'

/**
 * The navigation, as a drawer, below the mobile breakpoint.
 *
 * WHY THIS IS OURS AND NOT THE SDK'S. design-sdk does ship a mobile nav drawer,
 * and its guard says to open it with `<SideNavBarTrigger mobileOnly />` rather
 * than hand-rolling. That advice assumes the shell owns the drawer. It does not:
 * `AppShell` renders the `sideNav` slot verbatim into `.fds-app-shell__body` and
 * has no drawer of its own — the drawer belongs to `SideNavBar`, driven by
 * whichever `SideNavBarProvider` wraps it. In this app that is the NESTED
 * provider inside AppSideNav (the one keeping the rail's dark theme off the page
 * content), and `SideNavBarProvider` exposes `openMobile` only through context,
 * with no controlled prop. So nothing outside that provider — the top bar
 * included — can open it. Hence an fds Drawer, opened from state in App.
 *
 * `isPinned` is forced true: the rail is the full 240px list here, because a
 * 48px icon strip inside a 320px panel would be absurd. That also means the
 * collapsed-only flyouts never engage, which is correct — there is nothing to
 * fly out of.
 *
 * `isLazy` keeps the whole rail unmounted until first open, so a phone does not
 * build twenty nav rows it may never show.
 */
export function AppNavDrawer({
  isOpen,
  onClose,
  activeId,
  onNavigate,
  railTheme,
  workspace,
}: {
  isOpen: boolean
  onClose: () => void
  activeId: string
  onNavigate: (id: string) => void
  railTheme: 'Light' | 'Dark'
  workspace?: React.ReactNode
}) {
  return (
    <Drawer isOpen={isOpen} onDismiss={onClose} side="left" isLazy>
      {/* isPadded={false}: the rail brings its own gutters, and 20px more would
          push the 240px list past the panel. */}
      <DrawerBody isPadded={false}>
        <AppSideNav
          activeId={activeId}
          // Navigating closes the drawer — on a phone the panel covers the page
          // it just took you to, so leaving it open hides the result.
          onNavigate={(id) => {
            onNavigate(id)
            onClose()
          }}
          isPinned
          railTheme={railTheme}
          workspace={workspace}
        />
      </DrawerBody>
    </Drawer>
  )
}
