import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  NotificationMenu,
  ProfileMenu,
  type AppNotification,
  type ThemePreference,
} from '@faclon-labs/iosense-shell'

import { DEMO_NOTIFICATIONS, DEMO_PROFILE } from './fixtures'

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

// ── the notification menu ──────────────────────────────────────────────────

type BellStory = StoryObj<typeof NotificationMenu>

const bell = (items: AppNotification[], unreadCount: number): BellStory => ({
  render: () => (
    <NotificationMenu items={items} unreadCount={unreadCount} onOpenAll={() => {}} />
  ),
  play: openOnMount(/notification/i),
})

/**
 * The bell, OPEN. A titled panel, a preview of the five most recent, and a
 * "View more" footer that hands off to your notifications page.
 *
 * Five is a preview, not a list. A panel that scrolls is a page in a popover,
 * and the honest version of that is a page.
 *
 * Each row is title + `kind · source · when`, with an Indicator whose emphasis
 * carries read state — Intense unread, Subtle read. The whole row navigates;
 * there is no per-row action, because most of the time the title is the whole
 * answer.
 */
export const NotificationsOpen: BellStory = bell(DEMO_NOTIFICATIONS, 2)

/**
 * The empty state — an fds EmptyState reading "You're all caught up", not a
 * blank panel. A popover that opens onto nothing reads as broken.
 */
export const NotificationsEmpty: BellStory = bell([], 0)

/**
 * More than the preview holds. Nine items, five shown; "View more" is the
 * route to the rest.
 */
export const NotificationsOverflowing: BellStory = bell(
  Array.from({ length: 9 }, (_, i) => ({
    ...DEMO_NOTIFICATIONS[i % DEMO_NOTIFICATIONS.length],
    id: `n${i}`,
    title: `Notification ${i + 1}`,
    isRead: i > 2,
  })),
  3,
)

/**
 * The unread pill is a Counter positioned in the bell's corner, with a 2px ring
 * cut out against the bar so it separates from the glyph underneath.
 *
 * Placement is all that is ours: Counter owns its box, radius, fill, ink and
 * type, and has no anchor mode by design ("it renders inline exactly where you
 * place it"), so the corner is the caller's job and that is the whole of it.
 */
export const NotificationsManyUnread: BellStory = bell(DEMO_NOTIFICATIONS, 1284)

/** No unread — the pill disappears rather than rendering a zero. */
export const NotificationsNoUnread: BellStory = bell(DEMO_NOTIFICATIONS, 0)
