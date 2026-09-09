import type { Profile } from '@faclon-labs/iosense-shell'

/**
 * A PLACEHOLDER account, so the avatar has something to draw.
 *
 * The avatar is chrome — it is always in the top bar — but who it shows is the
 * host's. This stands in for whatever an account API would return.
 *
 * Invented on purpose. This file used to carry a real person: a name, a phone
 * number and a working email address, which is also what `useProfile()` used to
 * default to. Sample data that is a real human being ends up in every install
 * that forgets to pass its own, and in every repository the demo is copied into.
 *
 * There is no notification data here any more: the panel was removed from the
 * package, so the bell takes only a count and a click handler.
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
