import { useCallback, useMemo, useState } from 'react'
import { CircleQuestionMark, Grid3x3, Sparkles } from 'lucide-react'
import { IconButton } from '@faclon-labs/fds/button'
// EVERY SURFACE ON THE PAGE COMES FROM THE SDK. See DemoPage below — this demo
// obeys the rule it documents, or it would not be worth much as a reference.
import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderBadge,
  CardHeaderLeading,
} from '@faclon-labs/design-sdk/Card'

import {
  IosenseShell,
  NavFooterRow,
  buildTrail,
  resolveSection,
  useNotifications,
  useProfile,
  NAV_ICON_SIZE,
  navPageIds,
} from '@faclon-labs/iosense-shell'

// The product's own content. It lives HERE, in the demo, not in the package.
import { IOSENSE_NAV, IOSENSE_RECORD_PARENT, IOSENSE_SECTION_DEFAULT } from './iosenseNav'
import { IOSENSE_NOTIFICATIONS, IOSENSE_PROFILE } from './sampleData'

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

/**
 * fds's IconButton takes a COMPONENT, not an element, so anything the glyph
 * needs beyond `size` has to be baked into a wrapper rather than passed at the
 * call site. `.ai-icon` points the stroke at the gradient defined in
 * <AiGradientDefs /> below.
 */
const AssistantIcon = (props: { size?: number | string }) => (
  <Sparkles {...props} className="ai-icon" />
)

/**
 * The gradient the assistant glyph strokes itself with.
 *
 * An SVG stroke can only reference a paint server that EXISTS IN THE DOCUMENT,
 * so these defs have to be rendered once somewhere. They live here rather than
 * in the package because the button they serve is not part of the package —
 * and a package shipping CSS that points at an id it never defines is exactly
 * the dangling reference this move fixed.
 */
const AiGradientDefs = () => (
  <svg width="0" height="0" aria-hidden="true" focusable="false" className="svg-defs">
    <defs>
      <linearGradient id="ai-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--global-brand-500)" />
        <stop offset="100%" stopColor="var(--global-sapphire-500)" />
      </linearGradient>
    </defs>
  </svg>
)

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
      /* THE ASSISTANT AND THE APPLICATION LAUNCHER, through the slot.
         Both are in the product's top bar and NEITHER is in the package: one
         opens an assistant the shell knows nothing about, the other lists
         applications only the host can enumerate. They go here, to the left of
         the bell and the avatar, which is where the product has them — so this
         demo reproduces the real chrome exactly while the package stays free of
         both. */
      actions={
        <>
          <IconButton
            icon={AssistantIcon}
            size="Medium"
            isHighlighted
            accessibilityLabel="Assistant"
            onClick={() => {}}
          />
          <IconButton
            icon={Grid3x3}
            size="Medium"
            isHighlighted
            accessibilityLabel="Applications"
            onClick={() => {}}
          />
        </>
      }
    >
      <AiGradientDefs />
      <DemoPage id={activeId} title={title} />
    </IosenseShell>
  )
}

/**
 * A page written the way generated content is supposed to be written.
 *
 * TWO RULES, both visible here:
 *
 * 1. NOTHING SETS AN OUTER MARGIN. The container supplies the rhythm — 16px
 *    left, right and top, none at the bottom, 16px between these blocks. Delete
 *    a card, add another row, nest a grid: the spacing does not change, because
 *    nothing on this page owns it.
 *
 * 2. EVERY SURFACE COMES FROM THE SDK. Card, CardHeader, CardBody, Badge,
 *    Divider — not a hand-rolled <div> with a border and a radius. A div styled
 *    to look like a card is a card that will not follow the theme, will not
 *    match the next page, and will drift the moment the SDK's own card changes.
 *
 * The one exception is LAYOUT: the grid below is a plain div, because arranging
 * cards is not a component the SDK ships. Layout is structure; surfaces,
 * type and colour are not.
 */
function DemoPage({ id, title }: { id: string; title: string }) {
  return (
    <>
      <Card padding="spacing.5">
        <CardHeader>
          <CardHeaderLeading
            title={title}
            subtitle={
              KNOWN.has(id) ? `Page id: ${id}` : `Page id: ${id} — not in the nav, so no row is active`
            }
          />
        </CardHeader>
      </Card>

      {/* Layout is ours; every surface inside it is the SDK's. */}
      <div className="demo-grid">
        <Metric label="Active devices" value="1,284" note="across 24 sites" />
        <Metric label="Energy today" value="84.2 MWh" note="+3.1% vs yesterday" />
        <Metric label="Open alerts" value="7" note="2 critical" />
        <Metric label="Uptime" value="99.4%" note="rolling 30 days" />
      </div>

      <Card padding="spacing.5">
        <CardHeader showDivider>
          <CardHeaderLeading
            title="What you are looking at"
            suffix={<CardHeaderBadge label="Chrome" color="Information" />}
          />
        </CardHeader>
        <CardBody>
          <p className="demo-text">
            Everything outside this content area is <code>@faclon-labs/iosense-shell</code>. The
            rail, the top bar, the breadcrumb rule, the menus and the container this text sits in
            all come from the package. Nothing on this page sets a margin — the 16px above, beside
            and between these blocks is the container&apos;s.
          </p>
          <p className="demo-text">
            The nav is data, passed in as a prop; the package&apos;s own default is an empty rail.
            Same for the profile, the notifications and the footer.
          </p>
          <p className="demo-text">
            These cards are the SDK&apos;s <code>Card</code>, not divs dressed up as cards. That is
            the rule for anything rendered in here: surfaces, type and colour come from the SDK, so
            a page inherits the theme instead of guessing at it.
          </p>
        </CardBody>
      </Card>

      <Card padding="spacing.5">
        <CardHeader>
          <CardHeaderLeading title="Things to try" />
        </CardHeader>
        <CardBody>
          <ul className="demo-list">
            <li>Hover the collapsed rail — it peeks open without moving this content.</li>
            <li>
              Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>B</kbd>, or the toggle in the top bar.
            </li>
            <li>
              Open <strong>Workflows</strong>, then <strong>Create company when a deal closes</strong>{' '}
              — the trail becomes three crumbs, and the first one is inert text.
            </li>
            <li>Collapse the rail, then click <strong>Workflows</strong> — the children fly out.</li>
            <li>Scroll down, then pick another row — the new page starts at the top.</li>
            <li>Narrow the window past 768px — the rail becomes a drawer.</li>
          </ul>
        </CardBody>
      </Card>

      <Card padding="spacing.5">
        <CardHeader>
          <CardHeaderLeading title="Scrolling" subtitle="This block is deliberately tall" />
        </CardHeader>
        <CardBody>
          <p className="demo-text">
            Scroll to the bottom: the content runs to the cut-off with no padding beneath it,
            because a scrolling column has no bottom — only an edge. The scrollbar is an overlay,
            so it costs no layout width and nothing shifts when a page starts or stops overflowing.
          </p>
          <div className="demo-tall-filler" />
        </CardBody>
      </Card>
    </>
  )
}

/** A metric tile — again a real Card, with the SDK's own type scale. */
function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Card padding="spacing.5">
      <CardBody>
        <p className="demo-metric-label">{label}</p>
        <p className="demo-metric-value">{value}</p>
        <p className="demo-metric-note">{note}</p>
      </CardBody>
    </Card>
  )
}
