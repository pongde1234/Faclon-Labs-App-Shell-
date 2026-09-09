import { useState } from 'react'
import { Grid3x3, Search, Sparkles } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { AppTopBar, buildTrail, type ThemePreference } from '@faclon-labs/iosense-shell'

import { ACCORDION_ROWS, DEMO_NOTIFICATIONS, DEMO_PROFILE } from './fixtures'

const PAGE_TITLES: Record<string, string> = {
  home: 'Home',
  workflows: 'Workflows',
  'workflows-all': 'All Workflows',
  'workflows-create': 'Create company when a deal closes',
  'workflows-runs': 'Workflow runs',
}

/**
 * STORY.md §2 — the top bar. Three regions, and nothing else is in it.
 *
 *   LEFT    the toggle that opens and closes the rail, then the breadcrumbs
 *   RIGHT   the `actions` slot, then notifications, then the avatar
 *
 * That is the whole bar. No search, no title, no tabs — anything else a product
 * wants goes through `actions`, which is why the slot exists.
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
    notifications: DEMO_NOTIFICATIONS,
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

// ── the toggle, on the left ────────────────────────────────────────────────

/**
 * THE COLLAPSE CONTROL LIVES HERE, NOT IN THE RAIL.
 *
 * A control that hides a panel cannot sit inside that panel. Collapsed, the
 * rail is 48px — which is why this used to exist twice, as a close button in
 * the rail header AND a duplicate "Open sidebar" row in the list, so it stayed
 * reachable. One button in fixed chrome replaces both, and it does not move
 * when the thing it operates on does.
 *
 * Rail open: `PanelLeftClose`, labelled "Close sidebar (Ctrl+B)". Click it.
 */
export const ToggleWhenOpen: Story = {
  args: { isPinned: true },
}

/**
 * Rail collapsed: the glyph flips to `PanelLeftOpen` and the label becomes
 * "Open sidebar". The button shows what pressing it will DO, not what the
 * current state is — that is the difference between a toggle and a status light.
 */
export const ToggleWhenCollapsed: Story = {
  args: { isPinned: false },
}

/**
 * Below the breakpoint the SAME button opens the drawer instead of pinning —
 * there is no rail to pin — and the label follows: "Open navigation" rather
 * than "Open sidebar".
 *
 * One control, two jobs. A hamburger here would be a third idiom for the one
 * control; `PanelLeft*` already says "the panel on the left", which is true in
 * both modes.
 */
export const ToggleOnMobile: Story = {
  args: { isMobile: true, isNavDrawerOpen: false },
}

/** Mobile, drawer open — the glyph and label flip the same way. */
export const ToggleOnMobileOpen: Story = {
  args: { isMobile: true, isNavDrawerOpen: true },
}

// ── the breadcrumbs, beside it ─────────────────────────────────────────────
//
// THREE RENDERS, ONE RULE:
//   the last crumb   the current page, aria-current, not a link
//   has an `id`      a link — clicking navigates
//   has neither      plain, inert text, NOT tabbable
//
// The third case is ours. fds has no such variant — every non-current
// BreadcrumbItem there is a tabbable button — so it is a StaticCrumb composed
// into Breadcrumb's <ol>.

/**
 * ONE crumb. The page is its own trail, and a lone crumb is the current page.
 * Every top-level row lands here.
 */
export const OneCrumb: Story = {
  args: { trail: [{ label: 'Home' }] },
}

/**
 * TWO crumbs. The first is PLAIN TEXT, not a link.
 *
 * "Workflows" is an accordion parent — a position, not a page — so its crumb
 * reports where you are rather than offering somewhere to go. Try to tab to it:
 * you cannot, and that is deliberate.
 *
 * Pointing it at the accordion's default child was tried and was worse: a crumb
 * whose job is to go UP instead moved the reader SIDEWAYS into a sibling.
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
 * THREE crumbs — first inert text, SECOND a real link, third the current page.
 *
 * The middle one is a link because "All Workflows" IS a page. This is the only
 * shape in which a middle crumb appears, and it exists because a record sits
 * inside the list it belongs to: one level the rail does not draw.
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
 * A long current page. The trail keeps its shape rather than wrapping the bar
 * onto a second line — the bar is 48px and stays 48px.
 */
export const LongCrumb: Story = {
  args: {
    trail: buildTrail('workflows-create', 'Create company when a deal closes and notify the account team', {
      items: ACCORDION_ROWS,
      pageTitles: PAGE_TITLES,
      recordParent: { 'workflows-create': 'workflows-all' },
    }),
  },
}

// ── the right edge ─────────────────────────────────────────────────────────

/**
 * The right edge, in its FIXED order: `actions`, then the bell, then the avatar.
 *
 * The two on the right are chrome and always in that order, so a user learns
 * one place for "my account" and one for "what happened". Anything a product
 * adds goes to their LEFT, where it cannot displace them.
 *
 * Open either one: `Top nav/Profile menu` has them with their panels showing.
 */
export const RightEdge: Story = {}

/**
 * The `actions` slot filled.
 *
 * This is where an application launcher or an assistant button goes. NEITHER
 * SHIPS: one lists applications only the host can enumerate, the other opens an
 * assistant this package knows nothing about. They were removed from the export
 * on purpose, and this slot is what replaced them.
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

/**
 * FOUR things in the slot, to show it is a CONTAINER and not two fixed buttons.
 *
 * It takes any node, so it takes any number of them: icon buttons, a badge, a
 * menu trigger, an environment marker. The shell spaces them and puts them in
 * the row; it does not care what they are.
 *
 * They stay to the LEFT of the bell and the avatar however many there are.
 * Those two are chrome and always in the same place, so a user learns one spot
 * for "my account" and one for "what happened" — a slot that could displace
 * them would take that away.
 */
export const ActionsIsAContainer: Story = {
  args: {
    actions: (
      <>
        <Sparkles size={18} aria-hidden />
        <Grid3x3 size={18} aria-hidden />
        <Search size={18} aria-hidden />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 999,
            background: 'var(--background-warning-subtle, #fef0c7)',
            color: 'var(--text-warning-default, #93370d)',
          }}
        >
          Staging
        </span>
      </>
    ),
  },
}

/** Empty — the default. The bar shows the bell and the avatar and nothing else. */
export const NoActions: Story = {
  args: { actions: undefined },
}

/** No unread — the pill disappears rather than rendering a zero. */
export const NoUnread: Story = {
  args: { unreadCount: 0 },
}

/** Over the cap. The pill stays one glyph wide instead of stretching the bar. */
export const ManyUnread: Story = {
  args: { unreadCount: 1284 },
}

/** No avatar image: the trigger falls back to initials from the profile. */
export const AvatarFallsBackToInitials: Story = {
  args: { profile: { ...DEMO_PROFILE, avatarUrl: '' } },
}
