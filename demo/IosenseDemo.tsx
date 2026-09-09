import { useCallback, useMemo, useState } from 'react'
import { CircleQuestionMark } from 'lucide-react'

import {
  IosenseShell,
  NavFooterRow,
  buildTrail,
  resolveSection,
  useNotifications,
  useProfile,
  IOSENSE_NAV,
  IOSENSE_NOTIFICATIONS,
  IOSENSE_PROFILE,
  IOSENSE_RECORD_PARENT,
  IOSENSE_SECTION_DEFAULT,
  NAV_ICON_SIZE,
  navPageIds,
} from '@faclon-labs/iosense-shell'

/**
 * The demo, and the reason it exists.
 *
 * It imports the package BY ITS PUBLISHED NAME, so it is an ordinary consumer
 * with no privileged access to internals. If this file compiles, the exports
 * map is complete — a relative import into `../packages/...` would hide a
 * missing export until someone outside the repo hit it.
 *
 * It also shows what the package does NOT ship. Every piece of iosense content
 * here is passed IN: the nav, the profile, the notifications, the footer. The
 * package's own defaults are an empty rail, a blank profile and no
 * notifications. Delete the props and you get the shell; that is the point.
 */

/** Nav id to the title shown in the breadcrumb. The package has no titles. */
const PAGE_TITLES: Record<string, string> = {
  home: 'Overview Dashboard',
  finance: 'Finance Overview',
  opportunities: 'Opportunities',
  'agents-lab': 'Agents Lab',
  voice: 'Voice Agent',
  workflows: 'Workflows',
  'workflows-create': 'Create company when a deal closes',
  'workflows-all': 'All Workflows',
  'workflows-runs': 'Workflow runs',
  'workflows-versions': 'Workflow versions',
  reports: 'Reports',
  'reports-scheduled': 'Scheduled reports',
  'reports-templates': 'Report templates',
  'reports-archive': 'Report archive',
  devices: 'Devices',
  zomato: 'Zomato Dashboard',
  terminal: 'Terminal Temperature Monitoring',
  fleet: 'Fleet Tracking',
  warehouse: 'Warehouse Robotics',
  maintenance: 'Maintenance Dashboard',
  models: 'Models',
  steamtrap: 'Steam Trap Analytics',
  tools: 'Tools',
  memory: 'Store Level Dashboard',
  'memory-b': 'Store Level Dashboard — Variant B',
  connect: 'Connect',
  database: 'Database',
  notifications: 'Notifications',
}

const KNOWN = navPageIds(IOSENSE_NAV)

export function IosenseDemo() {
  const [activeId, setPage] = useState('memory')

  // Every id goes through resolveSection, so a parent row's id can never become
  // the active page — those rows have no content of their own.
  const navigate = useCallback((id: string) => setPage(resolveSection(id, IOSENSE_SECTION_DEFAULT)), [])

  // These two hooks are a convenience for hosts with no account or
  // notifications API. They default to a BLANK profile and an EMPTY list; the
  // iosense sample data is passed in explicitly.
  const { profile } = useProfile(IOSENSE_PROFILE)
  const notifications = useNotifications(IOSENSE_NOTIFICATIONS)

  const title = PAGE_TITLES[activeId] ?? activeId
  const trail = useMemo(
    () =>
      buildTrail(activeId, title, {
        items: IOSENSE_NAV,
        pageTitles: PAGE_TITLES,
        recordParent: IOSENSE_RECORD_PARENT,
      }),
    [activeId, title],
  )

  return (
    <IosenseShell
      navItems={IOSENSE_NAV}
      activeId={activeId}
      onNavigate={navigate}
      trail={trail}
      profile={profile}
      notifications={notifications.items}
      unreadCount={notifications.unreadCount}
      onOpenNotifications={() => navigate('notifications')}
      // Empty by default. Help is the product's choice, not the package's.
      sideNavFooter={<NavFooterRow icon={<CircleQuestionMark size={NAV_ICON_SIZE} />} label="Help" />}
    >
      <DemoPage id={activeId} title={title} />
    </IosenseShell>
  )
}

/**
 * A page written the way generated content will be: NOTHING here sets an outer
 * margin and no wrapper invents a gap.
 *
 * The container supplies the whole rhythm — 16px left, right and top, none at
 * the bottom, and 16px between these blocks. Delete a card, add another row,
 * nest a grid: the spacing does not change, because nothing here owns it.
 */
function DemoPage({ id, title }: { id: string; title: string }) {
  return (
    <>
      <header className="demo-head">
        <h1 className="demo-title">{title}</h1>
        <p className="demo-sub">
          Page id <code>{id}</code>
          {KNOWN.has(id) ? '' : ' — not in the nav, so no row is marked active'}
        </p>
      </header>

      <div className="demo-grid">
        <Metric label="Active devices" value="1,284" note="across 24 sites" />
        <Metric label="Energy today" value="84.2 MWh" note="+3.1% vs yesterday" />
        <Metric label="Open alerts" value="7" note="2 critical" />
        <Metric label="Uptime" value="99.4%" note="rolling 30 days" />
      </div>

      <section className="demo-card">
        <h2 className="demo-card-title">What you are looking at</h2>
        <p className="demo-text">
          Everything outside this content area is <code>@faclon-labs/iosense-shell</code>. The
          rail, the top bar, the breadcrumb rule, the menus and the container this text sits in
          all come from the package. Nothing on this page sets a margin — the 16px above, beside
          and between these blocks is the container's.
        </p>
        <p className="demo-text">
          The nav is data. These rows are <code>IOSENSE_NAV</code>, passed in as a prop; the
          package's own default is an empty rail. Same for the profile, the notifications and the
          footer.
        </p>
      </section>

      <section className="demo-card">
        <h2 className="demo-card-title">Things to try</h2>
        <ul className="demo-list">
          <li>Hover the collapsed rail — it peeks open without moving this content.</li>
          <li>Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>B</kbd>, or the toggle in the top bar.</li>
          <li>Open <strong>Workflows</strong>, then <strong>Create company when a deal closes</strong> — the trail becomes three crumbs, and the first one is inert text.</li>
          <li>Collapse the rail, then click <strong>Workflows</strong> — the children fly out beside the strip.</li>
          <li>Narrow the window past 768px — the rail becomes a drawer.</li>
        </ul>
      </section>

      <section className="demo-card demo-tall">
        <h2 className="demo-card-title">Scrolling</h2>
        <p className="demo-text">
          This block is deliberately tall. Scroll to the bottom: the content runs to the cut-off
          with no padding beneath it, because a scrolling column has no bottom — only an edge.
          The scrollbar is an overlay, so it costs no layout width and nothing shifts when a page
          starts or stops overflowing.
        </p>
      </section>
    </>
  )
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="demo-card">
      <p className="demo-metric-label">{label}</p>
      <p className="demo-metric-value">{value}</p>
      <p className="demo-metric-note">{note}</p>
    </div>
  )
}
