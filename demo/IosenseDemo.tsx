import { useCallback, useMemo, useState } from 'react'

import {
  IosenseShell,
  buildTrail,
  resolveSection,
  useNotifications,
  useProfile,
} from '@faclon-labs/iosense-shell'

import {
  PLACEHOLDER_NAV,
  PLACEHOLDER_RECORD_PARENT,
  PLACEHOLDER_SECTION_DEFAULT,
} from './placeholderNav'
import { DEMO_NOTIFICATIONS, DEMO_PROFILE } from './sampleData'

/**
 * The demo: the chrome, and nothing else.
 *
 * It imports the package BY ITS PUBLISHED NAME, so it is an ordinary consumer
 * with no privileged access to internals. If this file compiles, the exports map
 * is complete — a relative import into `../packages/...` would hide a missing
 * export until someone outside the repo hit it.
 *
 * WHAT IS NOT HERE, and every one of them is a PROP the host fills:
 *
 *   the content container   EMPTY
 *   the top bar's actions   EMPTY — the assistant and the application launcher
 *                           are added by the host, in their own app shell
 *   the rail's footer       EMPTY, so no Help row and no divider above it. The
 *                           SLOT is still there and the footer component still
 *                           ships; nothing is put in it here
 *   the nav rows            a placeholder, see below
 *   profile, notifications  placeholders
 *
 * The package's own defaults are the same: an empty rail, an empty footer, no
 * actions, a blank profile and no notifications.
 *
 * WHAT IS HERE, AND WHY. The rail's BEHAVIOUR — the accordion, the section that
 * hides and unhides, the collapse to 48px, the hover peek, the flyout, the badge
 * that becomes a dot — is the product of this package, and none of it is visible
 * against an empty rail. `PLACEHOLDER_NAV` is six rows that exist purely to make
 * those behaviours clickable in a real shell. Replace the file; do not extend it.
 */

/**
 * Nav id to the title in the breadcrumb. The package has no titles — a shell
 * cannot know what your pages are called.
 */
const PAGE_TITLES: Record<string, string> = {
  first: 'A plain row',
  'with-count': 'A row with a count',
  'with-word': 'A row with a word',
  group: 'An accordion',
  'group-one': 'First child',
  'group-two': 'Second child',
  'group-record': 'A record with a long name that will not fit',
  section: 'A section',
  'section-one': 'Inside the section',
  'section-two': 'Also inside it',
  notifications: 'Notifications',
}

export function IosenseDemo() {
  const [activeId, setPage] = useState('first')

  // Every id goes through resolveSection, so an accordion parent's id can never
  // become the active page — those rows have no content of their own.
  const navigate = useCallback(
    (id: string) => setPage(resolveSection(id, PLACEHOLDER_SECTION_DEFAULT)),
    [],
  )

  // A convenience for hosts with no account or notifications API. They default
  // to a BLANK profile and an EMPTY list; the placeholders are passed in.
  const { profile } = useProfile(DEMO_PROFILE)
  const notifications = useNotifications(DEMO_NOTIFICATIONS)

  const title = PAGE_TITLES[activeId] ?? activeId
  const trail = useMemo(
    () =>
      buildTrail(activeId, title, {
        items: PLACEHOLDER_NAV,
        pageTitles: PAGE_TITLES,
        recordParent: PLACEHOLDER_RECORD_PARENT,
      }),
    [activeId, title],
  )

  return (
    <IosenseShell
      navItems={PLACEHOLDER_NAV}
      activeId={activeId}
      onNavigate={navigate}
      trail={trail}
      profile={profile}
      notifications={notifications.items}
      unreadCount={notifications.unreadCount}
      onOpenNotifications={() => navigate('notifications')}
    />
  )
}
