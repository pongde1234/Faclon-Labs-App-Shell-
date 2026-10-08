import type { AppCategory, ManagedApp } from '@faclon-labs/iosense-shell'

import { DeepsenseLogo, ForgeLogo, FoundryLogo } from './appLogos'

/**
 * The App Center's catalogue — the categories and every application
 * the organisation could add.
 *
 * OURS, like the nav rows and the launcher's apps. The package ships the
 * window, the filtering and the add/remove model; which products exist, what
 * they do and what happens when one is added are only answerable here.
 *
 * THE LAUNCHER IS DERIVED FROM THIS, and no longer a separate list. An app
 * with `isAdded` is IN THE LAUNCHER: it leads this window under "Your apps",
 * and it is what the launcher shows outside — in ARRAY ORDER, so
 * rearranging there reorders this array and there is no `order` field to keep
 * in step with it.
 */

export const IOSENSE_APP_CATEGORIES: AppCategory[] = [
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'automation', label: 'Automation' },
  { id: 'storage', label: 'Data & storage' },
  { id: 'comms', label: 'Communication' },
  { id: 'maintenance', label: 'Maintenance' },
]

export const IOSENSE_CATALOGUE: ManagedApp[] = [
  // ---- The three with real artwork. Added, so they lead the
  // list and the launcher shows them in this order. ----
  {
    id: 'deepsense',
    name: 'Deepsense',
    description: 'Anomaly detection across every connected site.',
    icon: <DeepsenseLogo />,
    categoryId: 'analytics',
    isAdded: true,
  },
  {
    id: 'forge',
    name: 'Forge',
    description: 'Build and version the workflows that run your plant.',
    icon: <ForgeLogo />,
    categoryId: 'automation',
    isAdded: true,
  },
  {
    id: 'foundry',
    name: 'Foundry',
    description: 'Model your assets once and reuse them everywhere.',
    icon: <FoundryLogo />,
    categoryId: 'storage',
    isAdded: true,
  },

  // ---- Monitoring ----
  { id: 'steamtrap', name: 'Steam Trap', description: 'Trap health and steam loss, trap by trap.', categoryId: 'monitoring', isAdded: true },
  { id: 'terminal', name: 'Terminal', description: 'Temperature and humidity across cold-chain terminals.', categoryId: 'monitoring', isAdded: true },
  { id: 'energy', name: 'Energy', description: 'Consumption, demand and power factor by meter.', categoryId: 'monitoring' },
  { id: 'emissions', name: 'Emissions', description: 'Scope 1 and 2 accounting from live meter data.', categoryId: 'monitoring' },

  // ---- Analytics ----
  { id: 'insights', name: 'Insights', description: 'Ask questions of your historian in plain language.', categoryId: 'analytics', isAdded: true },
  { id: 'benchmarks', name: 'Benchmarks', description: 'Compare sites against each other and the fleet.', categoryId: 'analytics' },

  // ---- Automation ----
  { id: 'triggers', name: 'Triggers', description: 'Fire an action when a reading crosses a threshold.', categoryId: 'automation', isAdded: true },
  { id: 'scheduler', name: 'Scheduler', description: 'Run reports and exports on a calendar.', categoryId: 'automation' },
  { id: 'agents-lab', name: 'Agents Lab', description: 'Build agents that watch and act on your data.', categoryId: 'automation' },

  // ---- Data & storage ----
  { id: 'historian', name: 'Historian', description: 'Long-term storage for every tag you collect.', categoryId: 'storage', isAdded: true },
  { id: 'warehouse', name: 'Warehouse', description: 'Sync readings into your own data warehouse.', categoryId: 'storage' },
  { id: 'exports', name: 'Exports', description: 'Scheduled CSV and Parquet drops to object storage.', categoryId: 'storage' },

  // ---- Communication ----
  { id: 'slack', name: 'Slack', description: 'Send alerts and daily summaries to a channel.', categoryId: 'comms', isAdded: true },
  { id: 'teams', name: 'Microsoft Teams', description: 'Post alerts and approvals into Teams.', categoryId: 'comms' },
  { id: 'email', name: 'Email digests', description: 'A morning summary for every site owner.', categoryId: 'comms', isAdded: true },

  // ---- Maintenance ----
  { id: 'workorders', name: 'Work Orders', description: 'Raise and track jobs against an asset.', categoryId: 'maintenance' },
  { id: 'spares', name: 'Spares', description: 'Stock levels and reorder points per site.', categoryId: 'maintenance' },
]
