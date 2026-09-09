import { useCallback, useMemo, useState } from 'react'
import { CircleQuestionMark } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  IosenseShell,
  NavFooterRow,
  NAV_ICON_SIZE,
  buildTrail,
  resolveSection,
  type NavItem,
} from '@faclon-labs/iosense-shell'

import {
  ACCORDION_ROWS,
  DEMO_NOTIFICATIONS,
  DEMO_PROFILE,
  DEMO_RECORD_PARENT,
  DEMO_SECTION_DEFAULT,
  DemoLogo,
  FULL_NAV,
} from './fixtures'

const PAGE_TITLES: Record<string, string> = {
  home: 'Overview Dashboard',
  finance: 'Finance Overview',
  memory: 'Store Level Dashboard',
  devices: 'Devices',
  workflows: 'Workflows',
  'workflows-all': 'All Workflows',
  'workflows-create': 'Create company when a deal closes',
  'workflows-runs': 'Workflow runs',
  reports: 'Reports',
  'reports-scheduled': 'Scheduled reports',
  'reports-archive': 'Report archive',
}

const card: React.CSSProperties = {
  padding: 16,
  border: '1px solid var(--border-neutral-subtle, #e4e7ec)',
  borderRadius: 8,
  background: 'var(--background-surface-default, #fff)',
}

/**
 * STORY.md — the whole shell assembled.
 *
 * Mounting AppSideNav and AppTopBar by hand is NOT equivalent to this: the
 * content area's styling keys off markup only IosenseShell renders
 * (data-topbar, data-sidenav-pinned, .app-scroll-frame > .app-main-scroll).
 * Hand-assemble it and you lose the 16px inset, the overlay scrollbar and the
 * rail offset.
 */
function ShellHarness({
  navItems,
  logo,
  footer,
  initialId = 'home',
  children,
}: {
  navItems?: NavItem[]
  logo?: React.ReactNode
  footer?: React.ReactNode
  initialId?: string
  children?: React.ReactNode
}) {
  const [activeId, setPage] = useState(initialId)
  const navigate = useCallback(
    (id: string) => setPage(resolveSection(id, DEMO_SECTION_DEFAULT)),
    [],
  )
  const title = PAGE_TITLES[activeId] ?? activeId
  const trail = useMemo(
    () =>
      buildTrail(activeId, title, {
        items: navItems ?? [],
        pageTitles: PAGE_TITLES,
        recordParent: DEMO_RECORD_PARENT,
      }),
    [activeId, title, navItems],
  )

  return (
    <IosenseShell
      navItems={navItems}
      logo={logo}
      sideNavFooter={footer}
      activeId={activeId}
      onNavigate={navigate}
      trail={trail}
      profile={DEMO_PROFILE}
      notifications={DEMO_NOTIFICATIONS}
      unreadCount={3}
      onOpenNotifications={() => {}}
    >
      {children ?? (
        <>
          <h1 style={{ margin: 0, fontSize: 20 }}>{title}</h1>
          <div style={card}>
            Nothing on this page sets a margin. The 16px above, beside and between these
            blocks belongs to the content container.
          </div>
          <div style={card}>A second block, 16px below the first.</div>
        </>
      )}
    </IosenseShell>
  )
}

/**
 * The meta points at the HARNESS, not at IosenseShell itself. The shell needs a
 * dozen required props and real state to be worth looking at, so every story
 * renders the harness; typing the meta against the raw component would demand
 * all twelve in `args` and then ignore them.
 */
const meta = {
  title: 'Shell/IosenseShell',
  component: ShellHarness,
} satisfies Meta<typeof ShellHarness>

export default meta
type Story = StoryObj<typeof meta>

/**
 * WHAT THE PACKAGE SHIPS, with nothing passed in: an empty rail, no footer, and
 * design-sdk's built-in mark in the header because no `logo` was set.
 *
 * The chrome is all there — toggle, breadcrumb, bell, avatar, the content
 * container with its 16px. Only the *content* is missing, because the content
 * is yours.
 */
export const Default: Story = {
  render: () => <ShellHarness />,
}

/** The same shell with a nav, a logo and a footer — three props. */
export const Branded: Story = {
  render: () => (
    <ShellHarness
      navItems={ACCORDION_ROWS}
      logo={<DemoLogo />}
      footer={<NavFooterRow icon={<CircleQuestionMark size={NAV_ICON_SIZE} />} label="Help" />}
    />
  ),
}

/**
 * Every row type at once: badges of both kinds, two accordions and a section.
 *
 * These rows are a FIXTURE, invented for the story and living beside it. No nav
 * ships in the package and none is rendered by the demo either — the demo is the
 * bare chrome. Stories are the only place in this repo where the rail has rows,
 * because a story is where a behaviour is meant to be isolated.
 */
export const EveryRowType: Story = {
  render: () => (
    <ShellHarness
      navItems={FULL_NAV}
      initialId="finance"
      logo={<DemoLogo />}
      footer={<NavFooterRow icon={<CircleQuestionMark size={NAV_ICON_SIZE} />} label="Help" />}
    />
  ),
}

/**
 * Deep-linked three levels in. The accordion opened itself, and the trail reads
 * Workflows (inert) / All Workflows (link) / this record (current).
 */
export const DeepLinked: Story = {
  render: () => (
    <ShellHarness navItems={FULL_NAV} initialId="workflows-create" logo={<DemoLogo />} />
  ),
}

/**
 * The content container's rule, made visible.
 *
 * 16px left, right and top. NONE at the bottom — scroll down and the last block
 * runs to the cut-off, because a scrolling column has no bottom to pad. 16px
 * between blocks, supplied by the container, so none of these divs sets a
 * margin.
 */
export const ContentSpacing: Story = {
  render: () => (
    <ShellHarness navItems={ACCORDION_ROWS} logo={<DemoLogo />}>
      <div style={card}>16px above this, from the container's padding-top.</div>
      <div style={card}>16px between, from the container's gap.</div>
      <div style={{ ...card, minHeight: 900 }}>
        A tall block, to force the scroller. Scroll to the bottom: nothing sits below it.
        <br />
        <br />
        Note it is not squashed to fit either — the gap is <code>&gt; * + *</code> with a
        margin, not <code>display: flex; gap</code>, which would make every child a flex item
        with <code>flex-shrink: 1</code>.
      </div>
    </ShellHarness>
  ),
}

/**
 * SCROLLING. The content area is the only thing that scrolls; the chrome never
 * moves.
 *
 *   scroll container   .app-main-scroll, and nothing above it
 *   rail and top bar   fixed — they do not scroll with the page
 *   the document       does not scroll; the shell is locked to the viewport
 *   the scrollbar      an OVERLAY, measured at 0px of layout width
 *   on navigation      resets to the top
 *
 * Two things to try here, both of which were bugs before they were rules:
 *
 * 1. Scroll to the bottom and watch the rail and the bar. They do not move. The
 *    scroller is ours rather than <main> precisely so the overlay bars can be a
 *    SIBLING of it — anchored to <main> instead, the thumb ran up over the
 *    sheet's top edge.
 *
 * 2. Scroll down, then click a different row. THE NEW PAGE STARTS AT THE TOP.
 *    Without that reset the offset simply persisted, and arriving 620px down a
 *    page you have never seen reads as a broken render rather than as a scroll
 *    position. Measured at exactly that before the fix.
 *
 * The bar costing nothing is what stops content shifting sideways by ~15px
 * every time a page starts or stops overflowing.
 */
export const Scrolling: Story = {
  render: () => (
    <ShellHarness navItems={FULL_NAV} initialId="finance" logo={<DemoLogo />}>
      <div style={card}>
        Scroll down, then pick another row in the rail — you will land at the top of it.
      </div>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} style={{ ...card, minHeight: 120 }}>
          Block {i + 1} of 12 — the chrome stays put while these move under it.
        </div>
      ))}
    </ShellHarness>
  ),
}

/**
 * The gap is a DEFAULT, not a law. One custom property changes it, and the rule
 * itself is not re-stated.
 */
export const DenserContentSpacing: Story = {
  render: () => (
    <div style={{ height: '100vh' }} className="sb-dense">
      <style>{`.sb-dense .app-main-scroll { --shell-content-gap: 4px; }`}</style>
      <ShellHarness navItems={ACCORDION_ROWS} logo={<DemoLogo />}>
        <div style={card}>--shell-content-gap: 4px</div>
        <div style={card}>Still 16px from the edges; only the gap changed.</div>
        <div style={card}>Third block.</div>
      </ShellHarness>
    </div>
  ),
}
