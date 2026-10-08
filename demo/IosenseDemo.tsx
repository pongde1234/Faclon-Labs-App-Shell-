import { useCallback, useMemo, useState } from 'react'
import { CircleQuestionMark, Grip } from 'lucide-react'
import { Button, IconButton } from '@faclon-labs/fds/button'

import {
  AppCenter,
  AppLauncher,
  IosenseShell,
  NavFooterRow,
  buildTrail,
  resolveSection,
  useProfile,
  NAV_ICON_SIZE,
} from '@faclon-labs/iosense-shell'

// The product's own content. It lives HERE, in the demo, not in the package.
import { BruceAiLogo } from './BruceAiLogo'
import {
  IOSENSE_APP_CATEGORIES,
  IOSENSE_CATALOGUE,
} from './iosenseAppCatalogue'
import { IosenseLogo } from './IosenseLogo'
import { IOSENSE_NAV, IOSENSE_RECORD_PARENT, IOSENSE_SECTION_DEFAULT } from './iosenseNav'
import { OverviewPage, PlaceholderPage } from './OverviewPage'
import { DEMO_PROFILE } from './sampleData'

/**
 * The demo, and the reason it exists.
 *
 * It imports the package BY ITS PUBLISHED NAME, so it is an ordinary consumer
 * with no privileged access to internals. If this file compiles, the exports
 * map is complete — a relative import into `../packages/...` would hide a
 * missing export until someone outside the repo hit it.
 *
 * It also shows what the package does NOT ship. Every piece of iosense content
 * here is passed IN: the nav, the profile, the page titles, the footer, the two
 * top-bar buttons. The package's own defaults are an empty rail, a blank
 * profile and a bare bar. Delete the props and you get the shell; that is the
 * point.
 */

/** Nav id to the title shown in the breadcrumb. The package has no titles. */
const PAGE_TITLES: Record<string, string> = {
  home: 'Overview',
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
  apps: 'All applications',
}

/**
 * What the bell draws, and the whole of what the package knows about
 * notifications.
 *
 * A COUNT, not a list. The panel used to live in the package and no longer
 * does — a shell that typed your notifications would be claiming to know what
 * one is — so the bell takes a number and hands the click back. What opens is
 * the host's; this demo has no panel, so it navigates to a Notifications page
 * id instead. The rules the removed panel followed are in STORY.md §2.3.
 */
const UNREAD_COUNT = 3

export function IosenseDemo() {
  // Opens on Home, which is the page that actually has content in it.
  const [activeId, setPage] = useState('home')

  // The App Center's own state. Owned here rather than inside AppLauncher:
  // Modal is a sibling of the launcher, not its child, so the thing that opens
  // it and the thing that renders it both need to reach this.
  const [isAppCenterOpen, setIsAppCenterOpen] = useState(false)

  /**
   * The catalogue, in state rather than imported straight into the prop.
   *
   * THE HOST OWNS WHICH APPS ARE ADDED, and `AppCenter` is controlled: it never
   * touches the array it is given, it only reports the press through
   * `onAppAction`. That is the right split for a shell — adding an app is an
   * API call that can fail, and a component that flipped its own button
   * optimistically would end up disagreeing with the server.
   *
   * The cost is that the host must actually DO something with the press.
   * Passing the imported constant and logging the callback (which is what was
   * here) renders a button that never changes, which reads as broken rather
   * than as controlled.
   */
  const [catalogue, setCatalogue] = useState(IOSENSE_CATALOGUE)

  /**
   * THE LAUNCHER IS DERIVED, not a second hand-written list. Its set is
   * whatever is added, in catalogue order — which is what the App Center's
   * "Your apps" section lists. Adding an app there makes it appear here, and
   * dragging it up there moves it here too.
   *
   * This replaces `IOSENSE_APPS`, which was a parallel array of 13 apps kept
   * deliberately apart from the catalogue's 20. That separation was readable
   * while nothing could be added; once it could, two lists meant adding an app
   * visibly did nothing to the launcher.
   */
  const launcherApps = useMemo(
    () =>
      catalogue
        .filter((app) => app.isAdded)
        .map((app) => ({ id: app.id, label: app.name, icon: app.icon })),
    [catalogue],
  )

  // Every id goes through resolveSection, so a parent row's id can never become
  // the active page — those rows have no content of their own.
  const navigate = useCallback((id: string) => setPage(resolveSection(id, IOSENSE_SECTION_DEFAULT)), [])

  // A convenience for a host with no account API. It defaults to a BLANK
  // profile; the placeholder is passed in explicitly.
  const { profile } = useProfile(DEMO_PROFILE)

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
    <>
    <IosenseShell
      /* The brand mark, in the rail header where it belongs. The prop's own
         doc says to set it: left unset, design-sdk draws its built-in iosense
         mark, so an unbranded install silently ships our identity. It moved
         here when the App Center's header dropped its own copy — one mark in
         the chrome, none competing with the product marks in the launcher. */
      logo={<IosenseLogo />}
      navItems={IOSENSE_NAV}
      activeId={activeId}
      onNavigate={navigate}
      trail={trail}
      profile={profile}
      unreadCount={UNREAD_COUNT}
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
      /* THE SECOND CONTAINER. A LABELLED button, not an icon-only one: the mark
         alone said nothing about what pressing it does, and the assistant is
         the one control up here worth naming.

         `ghost` keeps it quiet beside the plain icons: no fill and no border at
         rest, so it reads as chrome rather than as a call to action, while
         still being wider than its neighbours. `leadingIcon` takes an ELEMENT
         (unlike IconButton, which takes a component), so the mark is sized
         here. */
      assistant={
        <Button
          variant="ghost"
          tone="neutral"
          size="sm"
          label="Bruce"
          leadingIcon={<BruceAiLogo size={16} />}
          onClick={() => {}}
        />
      }
      /* THE THIRD CONTAINER takes only icons. The launcher is the host's — the
         shell cannot enumerate applications — and it lands in the same row as
         the bell and the avatar the shell mounts itself, on the same 6px. */
      actions={
        /* The grip icon IS the launcher's trigger — Popover clones the child it
           is given, so the button must be handed to it directly rather than
           wrapped in anything.

           The empty `onClick` is required by IconButton's own types, not by us:
           opening is Popover's job and it supplies its own handler to the
           clone. Leaving this out is a type error, not a behaviour change. */
        <AppLauncher
          apps={launcherApps}
          onSelect={navigate}
          /* Draws the Apps tile after the last app and opens the App Center.
             Only the open happens here — the launcher has already closed itself
             by the time this runs, so the two panels are never both on screen. */
          onManage={() => setIsAppCenterOpen(true)}
        >
          <IconButton
            icon={Grip}
            size="Medium"
            isHighlighted
            accessibilityLabel="Applications"
            onClick={() => {}}
          />
        </AppLauncher>
      }
    >
      {/* The page. `children` is rendered verbatim — the shell owns the
          container and its 16px rhythm, and has no opinion about what goes in
          it. Every block below is this demo's, not the package's. */}
      {activeId === 'home' ? (
        <OverviewPage />
      ) : (
        <PlaceholderPage id={activeId} title={title} />
      )}
    </IosenseShell>

      {/* A SIBLING of the shell, not a child of the launcher that opens it.
          Modal unmounts entirely while closed, and nesting it inside the
          Popover would tie its lifetime to the panel that closes on the very
          click that opens this — the same rule ProfileMenu follows for the
          appearance modal. */}
      <AppCenter
        isOpen={isAppCenterOpen}
        onDismiss={() => setIsAppCenterOpen(false)}
        apps={catalogue}
        categories={IOSENSE_APP_CATEGORIES}
        /* What a real host would do asynchronously, the demo does synchronously:
           write the new value and let the row redraw from it. There is no
           account behind this, so the change lives as long as the page does.

           `action === 'add'` rather than `!app.isAdded`. The two agree today,
           but the point of being handed the action is to set the state the user
           ASKED FOR instead of inverting whatever the flag happens to say by
           the time the handler runs — which, once a real host puts a network
           round trip in here, is not necessarily what they saw. */
        onAppAction={(id, action) =>
          setCatalogue((prev) =>
            prev.map((app) => (app.id === id ? { ...app, isAdded: action === 'add' } : app)),
          )
        }
        /* The launcher set rearranged. The callback hands over the COMPLETE new
           order of the added ids, so applying it is a reindex rather than a
           splice: pull those apps out in the given order and put them back at
           the front, leaving everything not added where it was. The array's
           order IS the order — the launcher reads the same one. */
        onReorder={(orderedIds) =>
          setCatalogue((prev) => {
            const byId = new Map(prev.map((app) => [app.id, app]))
            const moved = orderedIds
              .map((id) => byId.get(id))
              .filter((app): app is (typeof prev)[number] => Boolean(app))
            const rest = prev.filter((app) => !orderedIds.includes(app.id))
            return [...moved, ...rest]
          })
        }
      />
    </>
  )
}
