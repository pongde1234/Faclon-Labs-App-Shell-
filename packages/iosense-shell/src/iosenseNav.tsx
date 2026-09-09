import {
  Archive,
  Beaker,
  Bot,
  Boxes,
  Building2,
  CalendarClock,
  Cpu,
  Database,
  FileText,
  Gauge,
  GitBranch,
  HardDrive,
  House,
  LayoutTemplate,
  Link2,
  ListChecks,
  Mic,
  Play,
  Rocket,
  Target,
  Thermometer,
  Truck,
  Wallet,
  Warehouse,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react'

import type { NavItem } from './navItems'

/**
 * Rail glyph size. The SDK's icon slot stays 16px — this is the DRAWN size
 * inside it, so icons read lighter without moving the icon column.
 *
 * Exported because your own nav data has to use it: mixing 14 and 16 in one
 * rail makes the column look ragged.
 */
export const NAV_ICON_SIZE = 14

/**
 * The iosense product's rail, as an EXAMPLE — not a default.
 *
 * `AppSideNav` renders whatever `items` you give it and renders NOTHING if you
 * give it nothing. This constant exists so you can see a complete, realistic
 * nav: every row type, badges of both kinds, two accordions and a section.
 *
 * Copy it and edit it. Do not import it into a product that is not iosense —
 * these are our pages, and shipping them into someone else's app is the exact
 * mistake this file exists to make obvious.
 */
export const IOSENSE_NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: <House size={NAV_ICON_SIZE} /> },
  {
    id: 'finance',
    label: 'Finance',
    icon: <Wallet size={NAV_ICON_SIZE} />,
    badge: { kind: 'count', value: 12, tone: 'info' },
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    icon: <Target size={NAV_ICON_SIZE} />,
    // `info`, not `alert`: Opportunities is the sales pipeline, so three deals
    // are the thing you WANT. Red here reads as "3 problems".
    badge: { kind: 'count', value: 3, tone: 'info' },
  },
  {
    id: 'agents-lab',
    label: 'Agents Lab',
    icon: <Bot size={NAV_ICON_SIZE} />,
    badge: { kind: 'word', label: 'Beta', tone: 'label' },
  },
  { id: 'voice', label: 'Voice', icon: <Mic size={NAV_ICON_SIZE} /> },

  {
    id: 'workflows',
    label: 'Workflows',
    icon: <Workflow size={NAV_ICON_SIZE} />,
    children: [
      {
        // A specific workflow record, but it still takes an icon from the same
        // lucide outline family as every other rail row — never a letter. Zap
        // is the trigger glyph the app already uses for "when X happens".
        id: 'workflows-create',
        label: 'Create company when a deal closes',
        icon: <Zap size={NAV_ICON_SIZE} />,
        isRecord: true,
      },
      { id: 'workflows-all', label: 'All Workflows', icon: <ListChecks size={NAV_ICON_SIZE} /> },
      { id: 'workflows-runs', label: 'Workflow runs', icon: <Play size={NAV_ICON_SIZE} /> },
      { id: 'workflows-versions', label: 'Workflow versions', icon: <GitBranch size={NAV_ICON_SIZE} /> },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <FileText size={NAV_ICON_SIZE} />,
    children: [
      { id: 'reports-scheduled', label: 'Scheduled reports', icon: <CalendarClock size={NAV_ICON_SIZE} /> },
      { id: 'reports-templates', label: 'Report templates', icon: <LayoutTemplate size={NAV_ICON_SIZE} /> },
      { id: 'reports-archive', label: 'Report archive', icon: <Archive size={NAV_ICON_SIZE} /> },
    ],
  },

  {
    kind: 'section',
    id: 'connect',
    label: 'Connect',
    items: [
      { id: 'devices', label: 'Devices', icon: <HardDrive size={NAV_ICON_SIZE} /> },
      { id: 'zomato', label: 'Zomato', icon: <Building2 size={NAV_ICON_SIZE} /> },
      { id: 'terminal', label: 'Terminal', icon: <Thermometer size={NAV_ICON_SIZE} /> },
      { id: 'fleet', label: 'Fleet', icon: <Truck size={NAV_ICON_SIZE} /> },
      { id: 'warehouse', label: 'Warehouse', icon: <Warehouse size={NAV_ICON_SIZE} /> },
      { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={NAV_ICON_SIZE} /> },
      { id: 'models', label: 'Models', icon: <Boxes size={NAV_ICON_SIZE} /> },
      { id: 'steamtrap', label: 'Steam Trap', icon: <Gauge size={NAV_ICON_SIZE} /> },
      { id: 'tools', label: 'Tools', icon: <Rocket size={NAV_ICON_SIZE} /> },
      { id: 'memory', label: 'Memory', icon: <Cpu size={NAV_ICON_SIZE} /> },
      // A/B testbed: same page as Memory, forked so UI changes can be compared
      // side by side without touching the original.
      { id: 'memory-b', label: 'Memory B', icon: <Beaker size={NAV_ICON_SIZE} /> },
      { id: 'connect', label: 'Connect', icon: <Link2 size={NAV_ICON_SIZE} /> },
      { id: 'database', label: 'Database', icon: <Database size={NAV_ICON_SIZE} /> },
    ],
  },
]

/**
 * Where a section id actually goes, for the iosense nav.
 *
 * Workflows and Reports are accordions, not pages — they have no content of
 * their own — so landing on one showed an EmptyState.
 *
 * WRITTEN OUT, not `children[0]`. Workflows' first child is `workflows-create`
 * — a specific record, "Create company when a deal closes" — which is a nonsense
 * landing page. Reports' first child happens to be the right one, which is
 * exactly what would make an implicit first-child rule look correct right up
 * until Workflows proved it wrong.
 */
export const IOSENSE_SECTION_DEFAULT: Record<string, string> = {
  workflows: 'workflows-all',
  reports: 'reports-scheduled',
}

/**
 * A record page sits inside the list it belongs to, not directly under the
 * accordion — one level the rail does not draw. "Create company when a deal
 * closes" is one workflow, so its trail runs Workflows / All Workflows / it.
 */
export const IOSENSE_RECORD_PARENT: Record<string, string> = {
  'workflows-create': 'workflows-all',
}
