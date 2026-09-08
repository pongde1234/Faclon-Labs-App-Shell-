import type { Crumb, NavSection, ShellNotification, ShellUser } from '@faclon-labs/app-shell'
/**
 * The demo's nav tree, as data.
 *
 * This file lives under `demo/` and NOTHING in the shell imports it — that is
 * the point. The shell renders no entities of its own; every row on screen
 * comes from this object being passed in as `navItems`. A consumer replaces
 * this wholesale.
 *
 * It exercises all three depths, both parent shapes (a link that also expands,
 * and a pure group with no page of its own), descriptions at depth 2 and 3,
 * badges, tooltips and icon-less rows.
 */
export const NAV: NavSection[] = [
  {
    id: 'payments',
    label: 'Payments',
    items: [
      { id: 'home', label: 'Home', href: '/', icon: '◧' },
      {
        // Depth 1 with a page of its own AND children: renders an <a> plus a
        // separate expand <button>, because one control cannot do both.
        id: 'txns',
        label: 'Transactions',
        href: '/txns',
        icon: '⇄',
        badge: 12,
        children: [
          {
            id: 'txns-payments',
            label: 'Payments',
            href: '/txns/payments',
            description: 'Captured and pending',
          },
          {
            id: 'txns-refunds',
            label: 'Refunds',
            href: '/txns/refunds',
            description: 'Issued in the last 30 days',
            badge: 3,
            // Depth 3 — the deepest the sidebar allows.
            children: [
              {
                id: 'txns-refunds-open',
                label: 'Open',
                href: '/txns/refunds/open',
                description: 'Awaiting approval',
              },
              {
                id: 'txns-refunds-done',
                label: 'Completed',
                href: '/txns/refunds/done',
              },
            ],
          },
          {
            id: 'txns-settlements',
            label: 'Settlements',
            href: '/txns/settlements',
            description: 'Daily payouts to your bank',
          },
        ],
      },
      { id: 'orders', label: 'Orders', href: '/orders', icon: '▦' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      {
        // No href: a pure group. Renders as a <button> that only expands —
        // there is nowhere for it to navigate to, so it is not a link.
        id: 'workspace',
        label: 'Workspace',
        icon: '⚙',
        children: [
          { id: 'team', label: 'Team', href: '/team', description: 'People and roles' },
          { id: 'billing', label: 'Billing', href: '/billing', description: 'Plan and invoices' },
        ],
      },
      { id: 'api-keys', label: 'API Keys', href: '/api-keys', icon: '⚿' },
      {
        id: 'webhooks',
        label: 'Webhooks',
        href: '/webhooks',
        icon: '⇗',
        badge: 'New',
        tooltip: 'Webhooks — endpoint delivery',
      },
    ],
  },
]

/**
 * The trail for a path.
 *
 * DELIBERATELY THE CONSUMER'S JOB, not the shell's. The shell owns how a crumb
 * is drawn; deciding what belongs in the trail — which ancestors are real pages,
 * which are just labels — is application knowledge.
 *
 * Note the "Settings" and "Workspace" crumbs carry no `href`. They are not
 * pages, so they render as inert text rather than as links that would either go
 * nowhere or shunt the user sideways into a sibling.
 */
export function trailFor(path: string): Crumb[] {
  const map: Record<string, Crumb[]> = {
    '/': [{ label: 'Home' }],
    '/txns': [{ label: 'Transactions' }],
    '/txns/payments': [{ label: 'Transactions', href: '/txns' }, { label: 'Payments' }],
    '/txns/refunds': [{ label: 'Transactions', href: '/txns' }, { label: 'Refunds' }],
    '/txns/refunds/open': [
      { label: 'Transactions', href: '/txns' },
      { label: 'Refunds', href: '/txns/refunds' },
      { label: 'Open' },
    ],
    '/txns/refunds/done': [
      { label: 'Transactions', href: '/txns' },
      { label: 'Refunds', href: '/txns/refunds' },
      { label: 'Completed' },
    ],
    '/txns/settlements': [{ label: 'Transactions', href: '/txns' }, { label: 'Settlements' }],
    '/orders': [{ label: 'Orders' }],
    // No href on "Settings" or "Workspace" — neither is a page.
    '/team': [{ label: 'Settings' }, { label: 'Workspace' }, { label: 'Team' }],
    '/billing': [{ label: 'Settings' }, { label: 'Workspace' }, { label: 'Billing' }],
    '/api-keys': [{ label: 'Settings' }, { label: 'API Keys' }],
    '/webhooks': [{ label: 'Settings' }, { label: 'Webhooks' }],
  }
  return map[path] ?? [{ label: 'Not found' }]
}

export const USER: ShellUser = {
  name: 'Siddharth Jain',
  email: 'siddharth.j@iosense.io',
}

export const NOTIFICATIONS: ShellNotification[] = [
  {
    id: 'n1',
    title: 'Settlement completed',
    detail: '₹1,24,500 paid out to HDFC ••4471',
    timestamp: '12 minutes ago',
    isUnread: true,
  },
  {
    id: 'n2',
    title: 'Refund requires approval',
    detail: 'Order #40219 · ₹2,300',
    timestamp: '1 hour ago',
    isUnread: true,
  },
  {
    id: 'n3',
    title: 'API key rotated',
    detail: 'Production key regenerated by you',
    timestamp: 'Yesterday',
  },
]
