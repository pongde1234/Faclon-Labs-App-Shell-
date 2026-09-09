import type { AppNotification, Profile } from '@faclon-labs/iosense-shell'

/**
 * The iosense product's own sample content.
 *
 * IT LIVES HERE, IN THE DEMO, and not in the package. The package ships the
 * chrome's behaviour; this is the product's data, and the two are separable
 * precisely because none of that behaviour depends on it.
 *
 * The profile below is a real person. That is the clearest reason this file is
 * not in a published package: `useProfile()` used to default to it, so every
 * install carried a name, a phone number and a working email address that had
 * nothing to do with that install.
 */

/**
 * The iosense product's own seed data — an EXAMPLE, the way IOSENSE_NAV is.
 * Stands in for whatever the account API would return.
 *
 * Do not pass this in a product that is not iosense: it is a real person.
 */
export const IOSENSE_PROFILE: Profile = {
  firstName: 'Siddharth',
  lastName: 'Jain',
  gender: 'Prefer not to say',
  org: 'Faclon Labs',
  email: 'siddharth.j@iosense.io',
  phone: '+91 98200 41122',
  jobTitle: 'Operations Lead',
  location: 'Mumbai, India',
  bio: 'Runs cold-chain monitoring across 240 retail sites. Watches door events and humidity more than anyone should.',
  avatarUrl: '',
}

/**
 * The iosense product sample data — an EXAMPLE, the way IOSENSE_NAV is.
 *
 * Real alerts about real floors in a real building. Look at it to see the
 * shape; do not ship it as anyone else's notifications.
 */
export const IOSENSE_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', kind: 'activity', title: 'Report FDAC_1 completed successfully', source: 'System Generated', at: '2026-07-17T15:57:00', isRead: false, isPinned: false, action: 'Open report', note: 'Generated from the Store Level Dashboard — 240 rows exported.', remarks: [] },
  { id: 'n2', kind: 'alert', title: 'High temperature in Zone A', source: 'Zomato · 5th Floor', at: '2026-07-17T15:50:00', isRead: false, isPinned: true, action: 'Acknowledge', note: 'Zone A hit 23.6 °C against a 22.0 °C threshold.', remarks: [{ id: 'r1', text: 'Raised with facilities — AHU damper stuck. Ticket FM-2291.', author: 'Siddharth', at: '2026-07-17T16:05:00' }] },
  { id: 'n3', kind: 'activity', title: 'Report FLDD_R1 completed successfully', source: 'System Generated', at: '2026-07-17T15:44:00', isRead: false, isPinned: false, action: 'Open report', remarks: [] },
  { id: 'n4', kind: 'trigger', title: 'Consumption trigger “mwh” fired', source: 'Trigger Engine', at: '2026-07-17T15:30:00', isRead: true, isPinned: false, action: 'View trigger', detail: { subject: 'Consumption Trigger | mwh', body: 'Threshold of 500 kWh exceeded on APRPLC_A7. Message: name' }, remarks: [] },
  { id: 'n5', kind: 'activity', title: 'Report FLCM_R1 completed successfully', source: 'System Generated', at: '2026-07-17T15:15:01', isRead: true, isPinned: false, action: 'Open report', remarks: [] },
  { id: 'n6', kind: 'system', title: 'Trigger quota reached (6 of 6)', source: 'Account', at: '2026-07-17T11:02:00', isRead: true, isPinned: true, action: 'Take action', note: 'New triggers cannot be created until one is removed or the plan is upgraded.', remarks: [{ id: 'r2', text: 'Asked ops to retire the unused mwh trigger.', author: 'Siddharth', at: '2026-07-17T11:30:00' }] },
  { id: 'n7', kind: 'activity', title: 'Report FLCM_R2 completed successfully', source: 'System Generated', at: '2026-07-16T11:35:00', isRead: true, isPinned: false, action: 'Open report', remarks: [] },
  { id: 'n8', kind: 'alert', title: 'VRV 2 communication failure', source: 'Zomato · 5th Floor', at: '2026-07-16T10:15:00', isRead: true, isPinned: false, action: 'Acknowledge', detail: { subject: 'VRV 2 | Communication Failure', body: 'No telemetry received since 10:02 AM. Last known state: OFF, N/A °C.' }, remarks: [] },
  { id: 'n9', kind: 'report', title: 'Weekly summary is ready', source: 'Reports', at: '2026-07-16T02:00:00', isRead: true, isPinned: false, action: 'Open report', remarks: [] },
  { id: 'n10', kind: 'activity', title: 'Report FLCM_R2 completed successfully', source: 'System Generated', at: '2026-07-15T02:00:00', isRead: true, isPinned: false, action: 'Open report', remarks: [] },
  { id: 'n11', kind: 'trigger', title: 'Alert trigger “hello test” fired', source: 'Trigger Engine', at: '2026-07-15T01:12:00', isRead: true, isPinned: false, action: 'View trigger', remarks: [] },
]

/** "Good morning" / "Good afternoon" / "Good evening" for the inbox greeting. */
