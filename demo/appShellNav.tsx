import {
  Activity,
  Bell,
  Boxes,
  Building2,
  CalendarClock,
  Database,
  FileText,
  Gauge,
  HardDrive,
  House,
  KeyRound,
  LayoutTemplate,
  ListChecks,
  Plug,
  Receipt,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Users,
  Wallet,
  Workflow,
} from 'lucide-react'

import type { NavSection } from '@faclon-labs/app-shell'

/**
 * The nav for the app-shell demo — a FILLED-IN tree, so every row shape the
 * package supports is on screen at once.
 *
 * THE ICONS ARE LUCIDE, and that is the contract rather than a dependency:
 * `NavItem.icon` is a `ReactNode` and the package ships no icon library, so the
 * glyph is whatever the host already uses. app-shell itself still imports
 * nothing but React — lucide is in this demo's tree, not in the package's.
 *
 * What each part is here to show:
 *
 *   unlabelled section    one leading group with no heading above it
 *   labelled sections     Operate / Workspace / Account
 *   depth 1               icon + label only. NO `description` — depth 1 has to
 *                         survive collapsing to a 56px rail, and setting one
 *                         there is ignored AND warns in dev
 *   depth 2 and 3         `description` renders, so the deeper rows carry one
 *   THREE LEVELS          Workflows > Runs > Failed, which is the cap. A 4th
 *                         throws a named error rather than rendering broken
 *   a pure toggle         "Integrations" has children and NO href, so the row
 *                         is an expand button and not a link — the only honest
 *                         render for a group with no page of its own
 *   badges                a number, and a custom node (the "Beta" pill)
 *   tooltip               "Steam Trap Analytics" is the hover label while the
 *                         rail is collapsed, where the label itself is gone
 */

const glyph = (Icon: typeof House) => <Icon size={16} />

/** A badge that is not a count. `badge` is a ReactNode, so this is allowed. */
const BetaPill = () => (
  <span
    style={{
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      padding: '2px 6px',
      borderRadius: 999,
      background: 'color-mix(in srgb, var(--shell-accent) 14%, transparent)',
      color: 'var(--shell-accent)',
    }}
  >
    Beta
  </span>
)

export const APP_SHELL_NAV: NavSection[] = [
  // No `label`, so the rows render with no heading above them.
  {
    id: 'top',
    items: [
      { id: 'home', label: 'Overview', href: '/', icon: glyph(House) },
      { id: 'activity', label: 'Activity', href: '/activity', icon: glyph(Activity), badge: 4 },
    ],
  },

  {
    id: 'operate',
    label: 'Operate',
    items: [
      {
        id: 'workflows',
        label: 'Workflows',
        href: '/workflows',
        icon: glyph(Workflow),
        children: [
          {
            id: 'workflows-all',
            label: 'All workflows',
            href: '/workflows/all',
            icon: glyph(ListChecks),
            description: '18 active, 3 paused',
          },
          {
            id: 'workflows-runs',
            label: 'Runs',
            href: '/workflows/runs',
            icon: glyph(CalendarClock),
            description: 'Last 24 hours',
            badge: 12,
            // DEPTH 3 — the cap. A fourth level throws in development.
            children: [
              {
                id: 'workflows-runs-failed',
                label: 'Failed',
                href: '/workflows/runs/failed',
                description: 'Needs attention',
                badge: 2,
              },
              {
                id: 'workflows-runs-queued',
                label: 'Queued',
                href: '/workflows/runs/queued',
                description: 'Waiting on a worker',
              },
            ],
          },
          {
            id: 'workflows-templates',
            label: 'Templates',
            href: '/workflows/templates',
            icon: glyph(LayoutTemplate),
          },
        ],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/reports',
        icon: glyph(FileText),
        children: [
          {
            id: 'reports-scheduled',
            label: 'Scheduled',
            href: '/reports/scheduled',
            description: 'Weekly and monthly',
          },
          { id: 'reports-archive', label: 'Archive', href: '/reports/archive' },
        ],
      },
      {
        id: 'steamtrap',
        label: 'Steam Trap',
        href: '/steam-trap',
        icon: glyph(Gauge),
        // The collapsed rail has no label to read, so it reads this instead.
        tooltip: 'Steam Trap Analytics',
      },
    ],
  },

  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'devices', label: 'Devices', href: '/devices', icon: glyph(HardDrive), badge: 240 },
      { id: 'sites', label: 'Sites', href: '/sites', icon: glyph(Building2) },
      { id: 'models', label: 'Models', href: '/models', icon: glyph(Boxes), badge: <BetaPill /> },
      { id: 'database', label: 'Database', href: '/database', icon: glyph(Database) },
      {
        // NO href, WITH children: a pure expand toggle, rendered as a <button>
        // rather than an <a>, because this group has no page of its own.
        id: 'integrations',
        label: 'Integrations',
        icon: glyph(Plug),
        children: [
          {
            id: 'integrations-installed',
            label: 'Installed',
            href: '/integrations/installed',
            description: '6 connected',
          },
          {
            id: 'integrations-keys',
            label: 'API keys',
            href: '/integrations/keys',
            icon: glyph(KeyRound),
            description: 'Rotate every 90 days',
          },
        ],
      },
    ],
  },

  {
    id: 'account',
    label: 'Account',
    items: [
      { id: 'finance', label: 'Finance', href: '/finance', icon: glyph(Wallet), badge: 12 },
      { id: 'billing', label: 'Billing', href: '/billing', icon: glyph(Receipt) },
      { id: 'opportunities', label: 'Opportunities', href: '/opportunities', icon: glyph(Target), badge: 3 },
      { id: 'team', label: 'Team', href: '/team', icon: glyph(Users) },
      { id: 'permissions', label: 'Permissions', href: '/permissions', icon: glyph(ShieldCheck) },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: glyph(Settings),
        children: [
          {
            id: 'settings-general',
            label: 'General',
            href: '/settings/general',
            icon: glyph(SlidersHorizontal),
          },
          {
            id: 'settings-alerts',
            label: 'Alerts',
            href: '/settings/alerts',
            icon: glyph(Bell),
            description: 'Thresholds and recipients',
          },
        ],
      },
    ],
  },
]

/** href to the title the breadcrumb and the page heading show. */
export const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/activity': 'Activity',
  '/workflows': 'Workflows',
  '/workflows/all': 'All workflows',
  '/workflows/runs': 'Runs',
  '/workflows/runs/failed': 'Failed runs',
  '/workflows/runs/queued': 'Queued runs',
  '/workflows/templates': 'Workflow templates',
  '/reports': 'Reports',
  '/reports/scheduled': 'Scheduled reports',
  '/reports/archive': 'Report archive',
  '/steam-trap': 'Steam Trap Analytics',
  '/devices': 'Devices',
  '/sites': 'Sites',
  '/models': 'Models',
  '/database': 'Database',
  '/integrations/installed': 'Installed integrations',
  '/integrations/keys': 'API keys',
  '/finance': 'Finance',
  '/billing': 'Billing',
  '/opportunities': 'Opportunities',
  '/team': 'Team',
  '/permissions': 'Permissions',
  '/settings': 'Settings',
  '/settings/general': 'General settings',
  '/settings/alerts': 'Alert settings',
  '/notifications': 'Notifications',
}

/**
 * The breadcrumb trail for a path.
 *
 * A crumb only gets an `href` IF THAT PATH IS A REAL PAGE — an `href`-less
 * crumb is what `Breadcrumb` draws as inert text. So "/integrations/installed"
 * yields `Integrations` as plain text, because that group has no page of its
 * own, followed by the current crumb. That is the case the rule exists for.
 */
export function trailFor(path: string) {
  if (path === '/') return [{ label: PAGE_TITLES['/'] }]

  const segments = path.split('/').filter(Boolean)
  return segments.map((segment, i) => {
    const sub = '/' + segments.slice(0, i + 1).join('/')
    const isLast = i === segments.length - 1
    const label =
      PAGE_TITLES[sub] ??
      // No page at this level: title-case the segment and leave it href-less.
      segment.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())
    // The current page is never a link, and neither is a segment with no page.
    return isLast || !PAGE_TITLES[sub] ? { label } : { label, href: sub }
  })
}
