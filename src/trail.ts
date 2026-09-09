import type { Crumb } from './AppTopBar'
import { REPORT_PAGE_IDS, WORKFLOW_PAGE_IDS } from './AppSideNav'

/**
 * A record page sits inside the list it belongs to, not directly under the
 * section — one level the rail does not draw. "Create company when a deal
 * closes" is one workflow, so its trail runs Workflows / All Workflows / it.
 *
 * An exception list rather than a full parent map on purpose: the hierarchy
 * still comes from WORKFLOW_PAGE_IDS / REPORT_PAGE_IDS, which the rail builds
 * from its own definitions, so the trail and the rail cannot drift apart.
 */
export const RECORD_PARENT: Record<string, string> = {
  'workflows-create': 'workflows-all',
}

/**
 * Where a section id actually goes. Workflows and Reports are sections, not
 * pages — they have no content of their own — so landing on one shows an
 * EmptyState.
 *
 * WRITTEN OUT, not `children[0]`. Workflows' first child is `workflows-create`
 * — a specific record, "Create company when a deal closes" — which is a nonsense
 * landing page. Reports' first child happens to be the right one, which is
 * exactly what would make an implicit first-child rule look correct right up
 * until Workflows proved it wrong.
 */
export const SECTION_DEFAULT: Record<string, string> = {
  workflows: 'workflows-all',
  reports: 'reports-scheduled',
}

/**
 * A section id is an alias for its default child — sections have no content of
 * their own, so nothing should ever land on one. Apply it wherever an id enters
 * your app: every navigation, and the initial route.
 *
 *     const setActiveId = useCallback((id: string) => setPage(resolveSection(id)), [])
 */
export const resolveSection = (id: string) => SECTION_DEFAULT[id] ?? id

export interface BuildTrailOptions {
  /** Nav id to the label shown in the crumb. Yours — the package has no titles. */
  pageTitles: Record<string, string>
  /** Record page to the list page it belongs to. Defaults to `RECORD_PARENT`. */
  recordParent?: Record<string, string>
}

/**
 * The trail shown in the top bar — where this page sits in the hierarchy.
 *
 * THE RULE, which is the whole reason this is not inlined at the call site:
 *
 *   two crumbs    the first is PLAIN TEXT, the second is the current page
 *   three crumbs  the first is plain text, the SECOND is a link, the third
 *                 is the current page
 *
 * The SECTION crumb is built with NO id, and that is what makes it plain text.
 * Workflows and Reports are not pages, so their crumbs report position rather
 * than offer a destination. Pointing them at the section's default child was
 * tried and was worse — a crumb that should go UP instead moved you SIDEWAYS
 * into a sibling, and it forced the ancestor to be dropped on that child,
 * leaving the page with no sense of where it sat.
 *
 * `AppTopBar` renders an id-less non-current crumb as plain text. fds has no
 * such variant — every non-current BreadcrumbItem is a tabbable button — so
 * that is a `StaticCrumb` of ours composed into Breadcrumb's <ol>.
 *
 * A deeper ancestor that IS a real page keeps its id and stays a link.
 */
export function buildTrail(id: string, title: string, options: BuildTrailOptions): Crumb[] {
  const { pageTitles, recordParent = RECORD_PARENT } = options

  const section = WORKFLOW_PAGE_IDS.has(id)
    ? 'workflows'
    : REPORT_PAGE_IDS.has(id)
      ? 'reports'
      : null

  // One crumb: the page is its own trail, and a lone crumb is the current page.
  if (!section) return [{ label: title }]

  // Two crumbs: section (no id, so plain text) then the page.
  const trail: Crumb[] = [{ label: pageTitles[section] ?? section }]

  // Three: the list page in between keeps its id, so it stays a link.
  const parent = recordParent[id]
  if (parent) trail.push({ label: pageTitles[parent] ?? parent, id: parent })

  return [...trail, { label: title }]
}
