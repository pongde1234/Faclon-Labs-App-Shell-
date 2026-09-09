import { useState } from 'react'
import { Grid3x3, Sparkles } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  AppTopBar,
  IOSENSE_NOTIFICATIONS,
  buildTrail,
  type ThemePreference,
} from '@faclon-labs/iosense-shell'

import { ACCORDION_ROWS, DEMO_PROFILE } from './fixtures'

const PAGE_TITLES: Record<string, string> = {
  home: 'Home',
  workflows: 'Workflows',
  'workflows-all': 'All Workflows',
  'workflows-create': 'Create company when a deal closes',
  'workflows-runs': 'Workflow runs',
}

/**
 * STORY.md §2 — the top bar.
 *
 * Left: the rail's collapse control, which lives HERE and not in the rail,
 * because a control that hides a panel cannot sit inside that panel.
 * Middle: the breadcrumbs.
 * Right: the `actions` slot, then notifications, then the avatar — fixed order.
 */
const meta = {
  title: 'Top nav/Bar',
  component: AppTopBar,
  args: {
    trail: [{ label: 'Home' }],
    onNavigate: () => {},
    profile: DEMO_PROFILE,
    preference: 'light' as ThemePreference,
    onPreferenceChange: () => {},
    notifications: IOSENSE_NOTIFICATIONS,
    unreadCount: 3,
    onOpenNotifications: () => {},
    isPinned: true,
    onTogglePin: () => {},
  },
  // The toggle is a STATE toggle, not a command — its glyph and its label show
  // what pressing it will do. Wiring it up is the only way to see that.
  render: (args) => {
    const Bar = () => {
      const [isPinned, setIsPinned] = useState(args.isPinned)
      return <AppTopBar {...args} isPinned={isPinned} onTogglePin={() => setIsPinned((v) => !v)} />
    }
    return <Bar />
  },
} satisfies Meta<typeof AppTopBar>

export default meta
type Story = StoryObj<typeof meta>

/** One crumb: the page is its own trail, and a lone crumb is the current page. */
export const OneCrumb: Story = {}

/**
 * TWO crumbs. The first is PLAIN TEXT, not a link — "Workflows" is an accordion
 * parent, not a page, so its crumb reports position rather than offering a
 * destination.
 *
 * Try to tab to it: you cannot, and that is deliberate. fds has no inert
 * variant — every non-current BreadcrumbItem there is a tabbable button — so
 * this is a StaticCrumb of ours.
 */
export const TwoCrumbs: Story = {
  args: {
    trail: buildTrail('workflows-runs', 'Workflow runs', {
      items: ACCORDION_ROWS,
      pageTitles: PAGE_TITLES,
    }),
  },
}

/**
 * THREE crumbs. First inert text, SECOND a real link, third the current page.
 *
 * The middle one is a link because "All Workflows" IS a page. Pointing the
 * first at the accordion's default child was tried and was worse: a crumb whose
 * job is to go UP instead moved the reader SIDEWAYS into a sibling.
 */
export const ThreeCrumbs: Story = {
  args: {
    trail: buildTrail('workflows-create', 'Create company when a deal closes', {
      items: ACCORDION_ROWS,
      pageTitles: PAGE_TITLES,
      recordParent: { 'workflows-create': 'workflows-all' },
    }),
  },
}

/**
 * The `actions` slot — to the LEFT of the bell and the avatar.
 *
 * This is where an application launcher or an assistant button goes. Neither
 * ships: one lists applications only the host can enumerate, the other opens an
 * assistant the package knows nothing about.
 */
export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Sparkles size={18} aria-hidden />
        <Grid3x3 size={18} aria-hidden />
      </>
    ),
  },
}

/** No unread notifications — the counter pill disappears entirely. */
export const NoUnread: Story = {
  args: { unreadCount: 0 },
}

/** Over the cap. The pill stays one glyph wide instead of stretching the bar. */
export const ManyUnread: Story = {
  args: { unreadCount: 1284 },
}

/**
 * Below the breakpoint the same button opens the DRAWER instead of pinning —
 * there is no rail to pin. One control, two jobs, and the label follows:
 * "Open navigation" rather than "Open sidebar".
 */
export const Mobile: Story = {
  args: { isMobile: true, isNavDrawerOpen: false },
}

/** An avatar with no image falls back to initials from the profile. */
export const AvatarFallsBackToInitials: Story = {
  args: { profile: { ...DEMO_PROFILE, avatarUrl: '' } },
}
