import type { AppNotification, Profile } from '@faclon-labs/iosense-shell'

/**
 * PLACEHOLDER account data, so the avatar and the bell have something to draw.
 *
 * Both are chrome — they are always in the top bar — but what they show is the
 * host's. These stand in for whatever an account API would return.
 *
 * Invented on purpose. This file used to carry a real person: a name, a phone
 * number and a working email address, which is also what `useProfile()` used to
 * default to. Sample data that is a real human being ends up in every install
 * that forgets to pass its own, and in every repository the demo is copied into.
 */
export const DEMO_PROFILE: Profile = {
  firstName: 'Ada',
  lastName: 'Byron',
  gender: 'Prefer not to say',
  org: 'Your Organisation',
  email: 'ada@example.com',
  phone: '',
  jobTitle: 'Operations Lead',
  location: 'London',
  bio: '',
  avatarUrl: '',
}

/**
 * Three notifications, one of each shape the menu draws differently: an unread
 * alert, an unread report, and one already read. Enough to show the Indicator's
 * emphasis change and the unread count; not enough to pretend to be a feed.
 */
export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    kind: 'alert',
    title: 'A threshold was crossed',
    source: 'Some source',
    at: '2026-07-17T15:50:00',
    isRead: false,
    isPinned: false,
    action: '',
    remarks: [],
  },
  {
    id: 'n2',
    kind: 'report',
    title: 'A scheduled report is ready',
    source: 'Some source',
    at: '2026-07-17T09:00:00',
    isRead: false,
    isPinned: false,
    action: '',
    remarks: [],
  },
  {
    id: 'n3',
    kind: 'system',
    title: 'A background job finished',
    source: 'Some source',
    at: '2026-07-16T18:20:00',
    isRead: true,
    isPinned: false,
    action: '',
    remarks: [],
  },
]
