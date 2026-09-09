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
