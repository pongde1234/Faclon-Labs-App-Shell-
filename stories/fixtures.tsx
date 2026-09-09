import type { ReactNode } from 'react'
import {
  Activity,
  Archive,
  Bot,
  CalendarClock,
  Database,
  FileText,
  Gauge,
  HardDrive,
  House,
  ListChecks,
  Play,
  Target,
  Wallet,
  Workflow,
} from 'lucide-react'

import { NAV_ICON_SIZE, type NavItem, type Profile } from '@faclon-labs/iosense-shell'

/**
 * Shared story fixtures.
 *
 * Small and hand-written: a story is meant to isolate ONE behaviour, and a
 * 22-row nav buries the row you are looking at.
 *
 * They are also invented rather than borrowed. The product nav, profile and
 * notifications live in demo/ and are not exported by the package — they are
 * our pages and a real person, and neither belongs in something a consumer
 * installs.
 */

export const icon = (Glyph: typeof House) => <Glyph size={NAV_ICON_SIZE} />

/** A brand mark that is obviously not iosense — the logo slot is the host's. */
export const DemoLogo = () => (
  <span
    aria-hidden
    style={{
      display: 'grid',
      placeItems: 'center',
      width: 24,
      height: 24,
      borderRadius: 6,
      background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
      color: '#fff',
    }}
  >
    <Activity size={14} />
  </span>
)

export const PLAIN_ROWS: NavItem[] = [
  { id: 'home', label: 'Home', icon: icon(House) },
  { id: 'devices', label: 'Devices', icon: icon(HardDrive) },
  { id: 'database', label: 'Database', icon: icon(Database) },
]

export const BADGED_ROWS: NavItem[] = [
  { id: 'home', label: 'Home', icon: icon(House) },
  // A quantity -> Counter. Neutral, because twelve accounts are furniture, not news.
  { id: 'finance', label: 'Finance', icon: icon(Wallet), badge: { kind: 'count', value: 12, tone: 'info' } },
  // Still `info`: three deals are the thing you WANT. Red would read as "3 problems".
  { id: 'opportunities', label: 'Opportunities', icon: icon(Target), badge: { kind: 'count', value: 3, tone: 'info' } },
  // A word -> Badge. `label` tone draws NO collapsed dot: "Beta" is not state.
  { id: 'agents-lab', label: 'Agents Lab', icon: icon(Bot), badge: { kind: 'word', label: 'Beta', tone: 'label' } },
  // The one `alert` in the set, so it still reads as a signal.
  { id: 'alerts', label: 'Alerts', icon: icon(Gauge), badge: { kind: 'count', value: 7, tone: 'alert' } },
  // Over the cap. Counter has no default max, so an uncapped count would stretch
  // the row; the rail pins it at 99.
  { id: 'queue', label: 'Queue', icon: icon(ListChecks), badge: { kind: 'count', value: 1284, tone: 'info' } },
  {
    id: 'a-deliberately-long-label',
    label: 'A deliberately long label that will not fit in 240px',
    icon: icon(FileText),
  },
]

export const ACCORDION_ROWS: NavItem[] = [
  { id: 'home', label: 'Home', icon: icon(House) },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: icon(Workflow),
    children: [
      { id: 'workflows-create', label: 'Create company when a deal closes', icon: icon(Play), isRecord: true },
      { id: 'workflows-all', label: 'All Workflows', icon: icon(ListChecks) },
      { id: 'workflows-runs', label: 'Workflow runs', icon: icon(Play) },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: icon(FileText),
    children: [
      { id: 'reports-scheduled', label: 'Scheduled reports', icon: icon(CalendarClock) },
      { id: 'reports-archive', label: 'Report archive', icon: icon(Archive) },
    ],
  },
]

export const SECTION_ROWS: NavItem[] = [
  { id: 'home', label: 'Home', icon: icon(House) },
  {
    kind: 'section',
    id: 'connect',
    label: 'Connect',
    items: [
      { id: 'devices', label: 'Devices', icon: icon(HardDrive) },
      { id: 'database', label: 'Database', icon: icon(Database) },
      { id: 'steamtrap', label: 'Steam Trap', icon: icon(Gauge) },
    ],
  },
]

/** Everything above, in one rail: badges, two accordions and a section. */
export const FULL_NAV: NavItem[] = [
  ...BADGED_ROWS.slice(0, 5),
  ...ACCORDION_ROWS.slice(1),
  ...SECTION_ROWS.slice(1),
]

/** Accordion parents are not pages, so an id landing on one is redirected. */
export const DEMO_SECTION_DEFAULT: Record<string, string> = {
  workflows: 'workflows-all',
  reports: 'reports-scheduled',
}

/** A record sits inside the list it belongs to — one level the rail does not draw. */
export const DEMO_RECORD_PARENT: Record<string, string> = {
  'workflows-create': 'workflows-all',
}

/** Invented too. Not a real person — that distinction is why it is invented. */
export const DEMO_PROFILE: Profile = {
  firstName: 'Ada',
  lastName: 'Byron',
  gender: 'Prefer not to say',
  org: 'Northwind Ltd',
  email: 'ada@example.com',
  phone: '',
  jobTitle: 'Operations Lead',
  location: 'London',
  bio: '',
  avatarUrl: '',
}

/**
 * A rail needs a height to fill — it is a flex column and collapses to nothing
 * in an auto-height canvas. Every rail-only story mounts inside this.
 */
export const RailFrame = ({ children, note }: { children: ReactNode; note?: ReactNode }) => (
  <div className="sb-rail-frame">
    {children}
    {note ? <p className="sb-note">{note}</p> : null}
  </div>
)
