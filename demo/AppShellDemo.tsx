import { createContext, useContext, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { Boxes, CircleQuestionMark, Search } from 'lucide-react'

import {
  AppShell,
  BaseBox,
  Box,
  Breadcrumb,
  Card,
  Grid,
  Stack,
  type ProfileAction,
  type ShellNotification,
  type ShellUser,
} from '@faclon-labs/app-shell'

import { APP_SHELL_NAV, PAGE_TITLES, trailFor } from './appShellNav'

/**
 * The demo for `@faclon-labs/app-shell` — the REACT-ONLY package.
 *
 * Served on its own page (`/appshell.html`) rather than beside the iosense
 * chrome, because the point of this package is what it looks like with no design
 * system underneath: its own tokens, its own stylesheet, and react + react-dom
 * as the only runtime dependencies. Mounting it next to design-sdk would let the
 * SDK's global CSS answer for it.
 *
 * Everything on screen that is CONTENT is passed in from this file — the nav,
 * the brand, the footer, the breadcrumb, the notifications, the profile, the
 * page. The package supplies the layout, the collapse, the bell and the avatar.
 *
 * It imports the package BY ITS PUBLISHED NAME, so if this compiles the exports
 * map is complete.
 */

/**
 * How a nav click becomes a page change, with NO ROUTER.
 *
 * `linkComponent` is the whole router story: the shell renders `<As href>` and
 * imports no router at all, so the default plain `<a>` would do a full page load
 * on every row. This demo passes its own anchor that intercepts the click and
 * moves React state instead — the same shape a Next or React Router link has.
 *
 * The context exists so `DemoLink` can be declared ONCE at module scope. A
 * component defined inside a render body is a new type on every render, and
 * React would unmount and remount the entire nav on every state change.
 */
const NavigateContext = createContext<(href: string) => void>(() => {})

function DemoLink(props: Record<string, unknown>) {
  const go = useContext(NavigateContext)
  const { href, children, onClick, ...rest } = props as {
    href?: string
    children?: ReactNode
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  }

  return (
    <a
      {...rest}
      href={href}
      onClick={(event) => {
        // THE SHELL'S OWN HANDLER FIRST, and it must not be dropped: the shell
        // passes an `onClick` that closes the mobile drawer after a navigation.
        // Swallowing it leaves the drawer sitting open over the page you just
        // navigated to.
        onClick?.(event)

        // Leave modified clicks to the browser — ctrl/cmd-click means "open in
        // a new tab", and hijacking it is the most irritating thing a fake link
        // can do.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        if (event.button !== 0) return

        event.preventDefault()
        if (href) go(href)
      }}
    >
      {children}
    </a>
  )
}

/**
 * A placeholder brand mark. The brand slot is the host's, entirely.
 *
 * BaseBox rather than Box, and that is the documented split: the size scale has
 * no 32px step — it holds the shell's own named sizes — so a square swatch is
 * exactly the "cases the scales genuinely do not cover" that BaseBox is the
 * escape hatch for. It still points at the shell's custom properties rather
 * than hard-coding a hex.
 */
const BrandMark = () => (
  <BaseBox
    display="flex"
    alignItems="center"
    justifyContent="center"
    width="32px"
    height="32px"
    borderRadius="var(--shell-radius-md)"
    background="var(--shell-accent)"
    color="var(--shell-text-on-accent)"
    style={{ flexShrink: 0 }}
  >
    <Boxes size={16} />
  </BaseBox>
)

/** Invented, not borrowed — see the note in sampleData.ts. */
const DEMO_USER: ShellUser = {
  name: 'Ada Byron',
  email: 'ada@example.com',
}

const DEMO_NOTIFICATIONS: ShellNotification[] = [
  {
    id: 'n1',
    title: 'Steam trap ST-114 failed open',
    detail: 'Site 7 · Boiler house',
    // PRE-FORMATTED by the caller. The package ships no date library, so the
    // relative string is the host's job — which is also why these never drift
    // out of whatever format the rest of your app already uses.
    timestamp: '2 min ago',
    isUnread: true,
  },
  {
    id: 'n2',
    title: 'Workflow run #4821 failed',
    detail: 'Create company when a deal closes',
    timestamp: '18 min ago',
    isUnread: true,
  },
  {
    id: 'n3',
    title: 'Scheduled report delivered',
    detail: 'Weekly summary · 240 rows',
    timestamp: '1 hr ago',
    isUnread: true,
  },
  { id: 'n4', title: 'Device DX-09 back online', detail: 'Warehouse B', timestamp: 'Yesterday' },
  { id: 'n5', title: 'API key rotated', detail: 'ingest-prod', timestamp: '2 days ago' },
]

/** `danger` is for the one destructive action a profile menu has. */
const PROFILE_ACTIONS: ProfileAction[] = [
  { id: 'profile', label: 'Your profile', onSelect: () => {} },
  { id: 'preferences', label: 'Preferences', onSelect: () => {} },
  { id: 'signout', label: 'Sign out', onSelect: () => {}, tone: 'danger' },
]

export function AppShellDemo() {
  // Deep-linked three levels in, so the branch arrives already unfolded —
  // open state is derived from `currentPath`, not stored by the shell.
  const [currentPath, setCurrentPath] = useState('/workflows/runs/failed')

  const trail = useMemo(() => trailFor(currentPath), [currentPath])
  const title = PAGE_TITLES[currentPath] ?? currentPath

  return (
    <NavigateContext.Provider value={setCurrentPath}>
      <AppShell
        navItems={APP_SHELL_NAV}
        currentPath={currentPath}
        linkComponent={DemoLink}
        brand={
          <>
            <BrandMark />
            <span>Acme Operations</span>
          </>
        }
        topNavContent={<Breadcrumb trail={trail} />}
        // EXTRAS ONLY, and they land to the LEFT of the bell and the avatar.
        // Those two are mounted by the shell at the right edge in a fixed order,
        // so a user moving between two apps built on this shell finds them in
        // the same place.
        /* A plain <button>, not a BaseBox: BaseBox types its DOM props as a
           `div`, so `type="button"` is a type error on it even with
           `as="button"`. The escape hatch covers style, not element-specific
           attributes — so anything that needs them is just the element. */
        topNavActions={
          <button
            type="button"
            aria-label="Search"
            onClick={() => {}}
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 32,
              height: 32,
              border: 'none',
              borderRadius: 'var(--shell-radius-md)',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            <Search size={16} />
          </button>
        }
        notifications={{
          items: DEMO_NOTIFICATIONS,
          // `unreadCount` omitted on purpose: the shell derives 3 from the items
          // above. Pass it only when the server knows better than the previewed
          // slice does.
          onSelect: (id) => console.log('[demo] notification selected:', id),
          onViewAll: () => setCurrentPath('/notifications'),
        }}
        profile={{ user: DEMO_USER, actions: PROFILE_ACTIONS }}
        footer={
          <Box display="flex" alignItems="center" gap="spacing.2" color="textMuted" fontSize="sm">
            <CircleQuestionMark size={16} />
            <span>Help and docs</span>
          </Box>
        }
      >
        <PageBody title={title} path={currentPath} />
      </AppShell>
    </NavigateContext.Provider>
  )
}

/**
 * The page. Built from `Stack`, `Grid` and `Card` rather than bare divs, because
 * those three take their gaps from the same token scale the shell does — so the
 * page cannot space itself differently from the chrome around it.
 *
 * `Grid` has no breakpoints: it reflows by item width, so there is no media
 * query here to get wrong when the rail collapses.
 */
function PageBody({ title, path }: { title: string; path: string }) {
  return (
    <Stack>
      <Stack gap="spacing.1">
        <Box as="h1" fontSize="lg" fontWeight="semibold" color="text">
          {title}
        </Box>
        <Box as="p" color="textMuted" fontSize="sm">
          {path}
        </Box>
      </Stack>

      <Grid>
        {STATS.map((stat) => (
          <Card key={stat.label} title={stat.label}>
            <Box fontSize="lg" fontWeight="semibold" color="text">
              {stat.value}
            </Box>
            <Box color="textMuted" fontSize="sm">
              {stat.note}
            </Box>
          </Card>
        ))}
      </Grid>

      <Card
        title="What to try"
        actions={
          <Box color="textMuted" fontSize="sm">
            app-shell
          </Box>
        }
      >
        <Box as="ul" color="textMuted" fontSize="md" paddingLeft="spacing.5">
          {TRY_THESE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </Box>
      </Card>

      {/* Enough blocks to make the content area scroll independently of the
          sidebar and the sticky top bar — which is the layout claim worth
          seeing rather than reading. */}
      <Grid columns={2}>
        {FILLER.map((block) => (
          <Card key={block.title} title={block.title}>
            <Box color="textMuted" fontSize="md">
              {block.body}
            </Box>
          </Card>
        ))}
      </Grid>
    </Stack>
  )
}

const STATS = [
  { label: 'Failed runs', value: '2', note: 'Last 24 hours' },
  { label: 'Active workflows', value: '18', note: '3 paused' },
  { label: 'Devices online', value: '236 / 240', note: '4 unreachable' },
  { label: 'Open opportunities', value: '3', note: 'Across 2 regions' },
]

const TRY_THESE = [
  'Click the panel icon in the top bar to collapse the sidebar to a 56px rail.',
  'With it collapsed, hover the rail — it peeks open OVER the page without reflowing the content. Only clicking pins it.',
  'Hover a collapsed row: Steam Trap reads its tooltip, "Steam Trap Analytics", because the label is gone.',
  'Open Workflows > Runs > Failed. Three levels is the cap; a fourth throws a named error rather than rendering broken.',
  'Click Integrations — it has children and no href, so the whole row is an expand toggle rather than a link.',
  'Narrow the window past 768px: the sidebar becomes a drawer that traps focus, closes on Escape and restores focus.',
  'Tab from the very top: the first focusable element is a skip link.',
]

const FILLER = [
  {
    title: 'Throughput',
    body: 'A placeholder block. The content area scrolls under the sticky top bar while the sidebar stays put.',
  },
  {
    title: 'Latency',
    body: 'Another one. <main> is a flex column with a 16px gutter and a 16px gap, and it zeroes the UA margins inside it.',
  },
  {
    title: 'Queue depth',
    body: 'So identical content cannot space differently depending on which tag came first.',
  },
  {
    title: 'Error budget',
    body: 'Every value is a --shell-* custom property on .appShell. Override them anywhere; do not patch the CSS.',
  },
]
