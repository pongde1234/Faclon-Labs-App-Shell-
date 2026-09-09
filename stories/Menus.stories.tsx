import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { NotificationBell, ProfileMenu, type ThemePreference } from '@faclon-labs/iosense-shell'

import { DEMO_PROFILE } from './fixtures'

/**
 * STORY.md §2.3 — the two controls at the right edge of the top bar, OPEN.
 *
 * Every other story in this repo shows them closed, which shows you a bell and
 * an avatar and nothing about what they do. These open on mount so the panel
 * itself is the story: what is in the profile menu, what a notification preview
 * looks like, and what happens when there is nothing to preview.
 *
 * Both are portalled, so the panel is not inside the canvas element — the play
 * functions query `document.body` rather than the canvas for that reason.
 */

const openOnMount = (label: string | RegExp) => async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement)
  await userEvent.click(canvas.getByRole('button', { name: label }))
}

// ── the profile menu ───────────────────────────────────────────────────────

const meta = {
  title: 'Top nav/Profile menu',
  component: ProfileMenu,
  parameters: { layout: 'centered' },
  args: {
    profile: DEMO_PROFILE,
    onOpenProfile: () => {},
    preference: 'light' as ThemePreference,
    onPreferenceChange: () => {},
  },
  // The theme row shows the CURRENT theme in its trailing slot, so the menu has
  // to actually hold that state or the row would always read "Light".
  render: (args) => {
    const Menu = () => {
      const [preference, setPreference] = useState(args.preference)
      return <ProfileMenu {...args} preference={preference} onPreferenceChange={setPreference} />
    }
    return <Menu />
  },
} satisfies Meta<typeof ProfileMenu>

export default meta
type Story = StoryObj<typeof meta>

/** Closed — the avatar button on its own, which is all the top bar shows. */
export const Trigger: Story = {}

/**
 * OPEN, with every option.
 *
 *   header    avatar (or initials), full name, and the organisation as a Badge
 *   Settings  goes to the account page — `onOpenProfile`
 *   Theme     opens the appearance picker. Its trailing slot names the CURRENT
 *             theme, so the answer is visible without opening anything, and a
 *             screen reader says "Theme, Light" rather than announcing nothing
 *   Log Out   drawn `intent="negative"`
 *
 * The Log Out colour is a deliberate departure from the fds guard, which
 * reserves negative for rows that DESTROY something. Signing out destroys
 * nothing — it is the most reversible action here — but the product decision is
 * that ending a session should read as weighty. The cost, written down so it is
 * not rediscovered: negative is now spent on a row that appears in every
 * session, so a genuinely destructive row added later will not stand out, and
 * this one should go neutral to make room.
 */
export const Open: Story = {
  play: openOnMount(/account menu/i),
}

/**
 * The avatar falls back to INITIALS when the profile carries no image, in the
 * trigger and in the menu header both.
 */
export const OpenWithInitials: Story = {
  args: { profile: { ...DEMO_PROFILE, avatarUrl: '' } },
  play: openOnMount(/account menu/i),
}

/**
 * THE DEFAULT, and the rule: `light`, always — never `system`, and never seeded
 * from the operating system.
 *
 * There are four choices: light, dark, brand (a light page with a navy rail) and
 * system. A first run gets LIGHT even on a machine set to dark.
 *
 * `system` would hand the product's appearance to a setting the product cannot
 * see and nobody involved chose — the same install then looks different on two
 * machines, and a screenshot in a bug report may not match what anyone else
 * sees. Light is also what every surface is designed and reviewed against.
 *
 * Measured with `prefers-color-scheme` forced to dark and localStorage empty:
 * stored `light`, `data-theme` `light`, main background `rgb(247,247,247)`.
 *
 * It stays changeable — a default that cannot be overridden is a constraint, not
 * a default. `system` is right there in the picker for anyone who wants it.
 */
export const ThemeDefaultsToLight: Story = {
  args: { preference: 'light' as ThemePreference },
  play: openOnMount(/account menu/i),
}

/**
 * The theme row reflects a non-default choice. Click it and the appearance
 * modal opens — a sibling of the menu, not a child of it.
 *
 * That nesting matters: Modal unmounts entirely while closed, and mounting it
 * inside the overlay would tie its lifetime to the menu that opened it — which
 * closes on the very click that opens the modal. The menu also closes FIRST,
 * because DropdownMenu and Modal each own a focus trap and two on screen at
 * once fight over focus.
 */
export const OpenOnDarkTheme: Story = {
  args: { preference: 'dark' as ThemePreference },
  play: openOnMount(/account menu/i),
}

/** The appearance picker itself, reached through the Theme row. */
export const AppearancePicker: Story = {
  play: async (context) => {
    await openOnMount(/account menu/i)(context)
    const theme = await within(document.body).findByText('Theme')
    await userEvent.click(theme)
    await expect(within(document.body).getByRole('dialog')).toBeInTheDocument()
  },
}

// ── the notification bell ──────────────────────────────────────────────────

type BellStory = StoryObj<typeof NotificationBell>

const bell = (unreadCount: number): BellStory => ({
  render: () => <NotificationBell unreadCount={unreadCount} onOpen={() => {}} />,
})

/**
 * THE BELL, AND ONLY THE BELL. There is no panel to open — that is the point.
 *
 * The package ships the TRIGGER: a control that is always in the same corner of
 * the bar, carrying a count, handing the click back to you. What opens is
 * yours — a popover of your own, a drawer, a route to a page.
 *
 * The panel was removed because a preview panel is PRODUCT, not chrome: it
 * decides how many rows to show, what a row says, what "view more" does, and
 * what the empty state reads. A shell that guessed at those would be wrong for
 * most hosts.
 *
 * IF YOU BUILD ONE, the rules the removed panel followed are in STORY.md §2.3 —
 * five is a preview and not a list, the row is `title` over
 * `kind · source · when`, read state is an Indicator's *emphasis* rather than a
 * second colour, and an empty panel needs an EmptyState because a popover that
 * opens onto nothing reads as broken.
 */
export const Bell: BellStory = bell(2)

/** No unread — the pill disappears rather than rendering a zero. */
export const BellNoUnread: BellStory = bell(0)

/**
 * Over the cap. `max={99}` is set explicitly because Counter has no default, and
 * an uncapped count stretches the bar it sits in.
 *
 * The pill is a Counter — a quantity, which is Counter's job rather than
 * Badge's (a word) or Indicator's (a state). Negative Intense by product
 * decision: the guard reserves Negative for counts OF failures, but an unread
 * badge should read as "attend to me" and red is the convention people arrive
 * with. It clears AA at 5.42:1. The cost is that red now appears here and on a
 * genuine alert, so it stays off everything else.
 */
export const BellManyUnread: BellStory = bell(1284)
