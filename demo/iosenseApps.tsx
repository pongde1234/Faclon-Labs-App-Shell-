import {
  Activity,
  Bot,
  BrainCircuit,
  ClipboardList,
  Cpu,
  FileText,
  Gauge,
  Thermometer,
  Workflow,
  Wrench,
} from 'lucide-react'

import type { LauncherApp } from '@faclon-labs/iosense-shell'

import { DeepsenseLogo, ForgeLogo, FoundryLogo } from './appLogos'

/**
 * The applications in the launcher grid.
 *
 * THESE ARE OURS, like the nav rows. The package ships the panel and none of
 * the contents — which applications exist, and which of them a given user may
 * open, is something only the host can answer. A package that shipped this list
 * would put our product line into every install.
 *
 * `LauncherApp.icon` is a ReactNode, so each product hands over its own brand
 * mark rather than a line glyph from a shared icon set. The marks carry their
 * own plate and colour; the launcher draws a bordered box around whatever it is
 * given and does not re-shape it.
 *
 * ORDER IS THE PRIORITY SIGNAL. The grid shows the FIRST EIGHT and puts the
 * rest behind its "More" tile, so the three real products lead and the rest
 * follow. The launcher does not reorder, score or track recency — a host that
 * wants something promoted moves it up this array.
 *
 * Eleven, deliberately: enough to pass the cap, so the ninth tile is the one
 * that actually appears and three applications sit behind it. The last eight
 * are line glyphs standing in for products that have no mark yet.
 */
export const IOSENSE_APPS: LauncherApp[] = [
  { id: 'deepsense', label: 'Deepsense', icon: <DeepsenseLogo /> },
  { id: 'forge', label: 'Forge', icon: <ForgeLogo /> },
  { id: 'foundry', label: 'Foundry', icon: <FoundryLogo /> },
  { id: 'devices', label: 'Devices', icon: <Cpu size={24} /> },
  { id: 'workflows', label: 'Workflows', icon: <Workflow size={24} /> },
  { id: 'reports', label: 'Reports', icon: <FileText size={24} /> },
  { id: 'agents-lab', label: 'Agents Lab', icon: <Bot size={24} /> },
  { id: 'steamtrap', label: 'Steam Trap', icon: <Gauge size={24} /> },
  // ---- the cap falls here: everything below sits behind "More" ----
  { id: 'terminal', label: 'Terminal', icon: <Thermometer size={24} /> },
  { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={24} /> },
  { id: 'memory', label: 'Memory', icon: <BrainCircuit size={24} /> },
  { id: 'activity', label: 'Activity', icon: <Activity size={24} /> },
  { id: 'tools', label: 'Tools', icon: <ClipboardList size={24} /> },
]
