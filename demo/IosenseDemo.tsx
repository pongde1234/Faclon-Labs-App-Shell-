import { useState } from 'react'

import { IosenseShell, useProfile } from '@faclon-labs/iosense-shell'

import { DEMO_PROFILE } from './sampleData'

/**
 * The demo: the chrome, and nothing else in it.
 *
 * It imports the package BY ITS PUBLISHED NAME, so it is an ordinary consumer
 * with no privileged access to internals. If this file compiles, the exports map
 * is complete — a relative import into `../packages/...` would hide a missing
 * export until someone outside the repo hit it.
 *
 * EVERY SLOT IS EMPTY, and that is the whole point of it:
 *
 *   navItems         no rows. The rail is a bare column
 *   children         no page. The content container is yours
 *   sideNavFooter    nothing, so no footer row and no divider above it
 *   actions          nothing, so the bar shows the bell and the avatar only
 *   logo             unset, so design-sdk falls through to its own mark
 *
 * The only things passed in are the profile and the notifications, because the
 * avatar and the bell are chrome — they are always in the bar — and they need
 * something to draw. Both are placeholders.
 *
 * WHERE THE BEHAVIOUR LIVES, since it is not visible here. Adding rows gives you
 * accordions that unfold and remember, sections that hide and unhide, the
 * collapse to 48px, the hover peek, the flyout and the badge-to-dot swap — none
 * of which this file demonstrates, on purpose. It is specified in STORY.md §1.2
 * and §1.4, contracted in guards/NavItems.guard.json, and exercised story by
 * story in stories/SideNav.stories.tsx and stories/Rules.stories.tsx against
 * fixtures that live with the stories rather than here.
 */
export function IosenseDemo() {
  // Nothing to navigate to. Kept as state so the shell is wired the way a real
  // host wires it, rather than being handed a constant it can never change.
  const [activeId, setActiveId] = useState('')

  // A convenience for a host with no account API. It defaults to a BLANK
  // profile; the placeholder is passed in explicitly.
  const { profile } = useProfile(DEMO_PROFILE)

  return (
    <IosenseShell
      activeId={activeId}
      onNavigate={setActiveId}
      // No rows, so no trail. A breadcrumb with nothing in it renders nothing,
      // which is correct: there is no page to describe the position of.
      trail={[]}
      profile={profile}
      // The bell takes a COUNT and a click. The panel is not in the package —
      // what opens is the host's, and this demo opens nothing.
      unreadCount={2}
      onOpenNotifications={() => {}}
    />
  )
}
