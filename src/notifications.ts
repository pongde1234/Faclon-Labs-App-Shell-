export type NotificationKind = 'activity' | 'alert' | 'trigger' | 'report' | 'system'

/** A note a user leaves on a notification — an audit trail, not a chat. */
export interface Remark {
  id: string
  text: string
  author: string
  at: string
}

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  source: string
  /** ISO timestamp — grouping and time display derive from this. */
  at: string
  isRead: boolean
  isPinned: boolean
  /** Primary action label, shown as the row's one button. */
  action: string
  /** Optional quoted block (a reply, an excerpt) shown under the title. */
  detail?: { subject: string; body: string }
  /** Optional single indented line under the title. */
  note?: string
  /** User-added remarks, oldest first. */
  remarks: Remark[]
}

export const KIND_LABEL: Record<NotificationKind, string> = {
  activity: 'Activity',
  alert: 'Alert',
  trigger: 'Trigger',
  report: 'Report',
  system: 'System',
}

export const KIND_COLOR: Record<NotificationKind, 'Information' | 'Negative' | 'Notice' | 'Positive' | 'Neutral'> = {
  activity: 'Information',
  alert: 'Negative',
  trigger: 'Notice',
  report: 'Positive',
  system: 'Neutral',
}

export const NOTIFICATIONS: AppNotification[] = [
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
export function greeting(now = new Date()): string {
  const h = now.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/** "Today" / "Yesterday" / "Friday, July 17, 2026" — heading per day bucket. */
export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = (day(now) - day(d)) / 86_400_000
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
