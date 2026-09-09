import { useCallback, useMemo, useState } from 'react'
import { CircleQuestionMark, Grid3x3, Sparkles } from 'lucide-react'
import { IconButton } from '@faclon-labs/fds/button'

import {
  IosenseShell,
  NavFooterRow,
  buildTrail,
  resolveSection,
  useNotifications,
  useProfile,
  NAV_ICON_SIZE,
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

/**
 * fds's IconButton takes a COMPONENT, not an element, so anything the glyph
 * needs beyond `size` has to be baked into a wrapper rather than passed at the
 * call site. `.ai-icon` points the stroke at the gradient defined in
 * <AiGradientDefs /> below.
 */
const AssistantIcon = (props: { size?: number | string }) => (
  <Sparkles {...props} className="ai-icon" />
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
    />
  )
}
