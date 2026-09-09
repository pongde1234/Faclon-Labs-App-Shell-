import type { Crumb, NavSection, ShellNotification, ShellUser } from '@faclon-labs/app-shell'

/**
 * The demo's nav tree, as data.
 *
 * NOTHING in the package imports this file — that is the point. The shell
 * renders no rows of its own; every row on screen comes from this object being
 * passed in as `navItems`, and a consumer replaces it wholesale.
 *
 * This mirrors the iosense rail so the demo shows the shell doing the real job
 * rather than a toy one: two nested groups, a record row, badges, and a long
 * flat section that has to survive collapsing to a 48px strip.
 */
export const NAV: NavSection[] = [
  {
    id: 'primary',
    items: [
      { id: 'home', label: 'Home', href: '/', icon: '⌂' },
      { id: 'finance', label: 'Finance', href: '/finance', icon: '◫', badge: 12 },
      { id: 'opportunities', label: 'Opportunities', href: '/opportunities', icon: '◎', badge: 3 },
      { id: 'agents-lab', label: 'Agents Lab', href: '/agents-lab', icon: '◇', badge: 'Beta' },
      { id: 'voice', label: 'Voice', href: '/voice', icon: '◐' },
      {
        // A group with a page of its own AND children: renders a link plus a
        // separate expand button, because one control cannot do both.
        id: 'workflows',
        label: 'Workflows',
        icon: '⚙',
        children: [
          {
            // A specific record rather than a list — it sits under the list it
            // belongs to, which is the one place this tree goes three deep.
            id: 'workflows-create',
            label: 'Create company when a deal closes',
            href: '/workflows/create',
            description: 'Runs when a new opportunity has no matching company',
          },
          { id: 'workflows-all', label: 'All Workflows', href: '/workflows', description: 'Active and paused' },
          { id: 'workflows-runs', label: 'Workflow runs', href: '/workflows/runs', description: 'Trigger, duration, outcome' },
          { id: 'workflows-versions', label: 'Workflow versions', href: '/workflows/versions' },
        ],
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: '▤',
        children: [
          { id: 'reports-scheduled', label: 'Scheduled reports', href: '/reports', description: 'Daily and weekly' },
          { id: 'reports-templates', label: 'Report templates', href: '/reports/templates' },
          { id: 'reports-archive', label: 'Report archive', href: '/reports/archive' },
        ],
      },
    ],
  },
  {
    id: 'connect',
    label: 'Connect',
    items: [
      { id: 'devices', label: 'Devices', href: '/devices', icon: '▢' },
      { id: 'zomato', label: 'Zomato', href: '/zomato', icon: '◨' },
      { id: 'terminal', label: 'Terminal', href: '/terminal', icon: '◑' },
      { id: 'fleet', label: 'Fleet', href: '/fleet', icon: '⬓' },
      { id: 'warehouse', label: 'Warehouse', href: '/warehouse', icon: '▦' },
      { id: 'maintenance', label: 'Maintenance', href: '/maintenance', icon: '✶' },
      { id: 'models', label: 'Models', href: '/models', icon: '◈' },
      { id: 'steamtrap', label: 'Steam Trap', href: '/steamtrap', icon: '◔' },
      { id: 'tools', label: 'Tools', href: '/tools', icon: '✦' },
      { id: 'memory', label: 'Memory', href: '/memory', icon: '▣' },
      { id: 'database', label: 'Database', href: '/database', icon: '☰' },
    ],
  },
]

/**
 * The trail for a path.
 *
 * DELIBERATELY THE CONSUMER'S JOB. The shell owns how a crumb is drawn;
 * deciding what belongs in the trail — which ancestors are real pages and which
 * are only labels — is application knowledge.
 *
 * Note the crumbs with no `href`. Those are sections with no page of their own,
 * and an absent href is what makes them inert text rather than a link that
 * would either go nowhere or shunt the reader sideways into a sibling.
 */
const TRAILS: Record<string, Crumb[]> = {
  '/': [{ label: 'Home' }],
  '/finance': [{ label: 'Finance' }],
  '/opportunities': [{ label: 'Opportunities' }],
  '/agents-lab': [{ label: 'Agents Lab' }],
  '/voice': [{ label: 'Voice' }],

  '/workflows': [{ label: 'Workflows' }, { label: 'All Workflows' }],
  '/workflows/create': [
    { label: 'Workflows' },
    { label: 'All Workflows', href: '/workflows' },
    { label: 'Create company when a deal closes' },
  ],
  '/workflows/runs': [{ label: 'Workflows' }, { label: 'Workflow runs' }],
  '/workflows/versions': [{ label: 'Workflows' }, { label: 'Workflow versions' }],

  '/reports': [{ label: 'Reports' }, { label: 'Scheduled reports' }],
  '/reports/templates': [{ label: 'Reports' }, { label: 'Report templates' }],
  '/reports/archive': [{ label: 'Reports' }, { label: 'Report archive' }],

  '/devices': [{ label: 'Connect' }, { label: 'Devices' }],
  '/zomato': [{ label: 'Connect' }, { label: 'Zomato' }],
  '/terminal': [{ label: 'Connect' }, { label: 'Terminal' }],
  '/fleet': [{ label: 'Connect' }, { label: 'Fleet' }],
  '/warehouse': [{ label: 'Connect' }, { label: 'Warehouse' }],
  '/maintenance': [{ label: 'Connect' }, { label: 'Maintenance' }],
  '/models': [{ label: 'Connect' }, { label: 'Models' }],
  '/steamtrap': [{ label: 'Connect' }, { label: 'Steam Trap' }],
  '/tools': [{ label: 'Connect' }, { label: 'Tools' }],
  '/memory': [{ label: 'Connect' }, { label: 'Memory' }],
  '/database': [{ label: 'Connect' }, { label: 'Database' }],
}

export function trailFor(path: string): Crumb[] {
  return TRAILS[path] ?? [{ label: 'Not found' }]
}

export const USER: ShellUser = {
  name: 'Siddharth Jain',
  email: 'siddharth.j@iosense.io',
}

export const NOTIFICATIONS: ShellNotification[] = [
  {
    id: 'n1',
    title: 'Steam trap 14 exceeded threshold',
    detail: 'Pune plant · 132°C for 8 minutes',
    timestamp: '12 minutes ago',
    isUnread: true,
  },
  {
    id: 'n2',
    title: 'Scheduled report ready',
    detail: 'Weekly energy summary · 24 sites',
    timestamp: '1 hour ago',
    isUnread: true,
  },
  {
    id: 'n3',
    title: 'Device back online',
    detail: 'Warehouse gateway WH-07',
    timestamp: 'Yesterday',
  },
]
