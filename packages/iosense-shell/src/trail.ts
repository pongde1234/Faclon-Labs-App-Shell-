import type { Crumb } from './AppTopBar'
import { navParents, type NavItem } from './navItems'

export interface BuildTrailOptions {
  /**
   * The SAME array you gave `AppSideNav`. The hierarchy is read from it, so the
   * trail and the rail cannot drift apart — there is only one definition of
   * what contains what.
   */
  items: NavItem[]
  /** Nav id to the label shown in the crumb. Yours — the package has no titles. */
  pageTitles: Record<string, string>
  /**
   * Record page to the list page it belongs to — one level the rail does not
   * draw. "Create company when a deal closes" is one workflow, so its trail
   * runs Workflows / All Workflows / it.
   *
   * An exception list rather than a full parent map on purpose: the rest of the
   * hierarchy comes from `items`, so only the levels the rail cannot express
   * are written out here.
   */
  recordParent?: Record<string, string>
}

/**
 * The trail shown in the top bar — where this page sits in the hierarchy.
 *
 * THE RULE, which is the whole reason this is not inlined at the call site:
 *
 *   one crumb     the page itself, marked aria-current
 *   two crumbs    the first is PLAIN TEXT, the second is the current page
 *   three crumbs  the first is plain text, the SECOND is a link, the third
 *                 is the current page
 *
 * The ancestor crumb is built with NO id, and that is what makes it plain text.
 * An accordion parent — Workflows, Reports — is not a page, so its crumb reports
 * position rather than offering a destination. Pointing it at the accordion's
 * default child was tried and was worse: a crumb whose job is to go UP instead
 * moved the reader SIDEWAYS into a sibling, and it forced the ancestor to be
 * dropped on that child, leaving the page with no sense of where it sat.
 *
 * `AppTopBar` renders an id-less non-current crumb as plain text. fds has no
 * such variant — every non-current BreadcrumbItem is a tabbable button — so
 * that is a `StaticCrumb` of ours composed into Breadcrumb's <ol>.
 *
 * A deeper ancestor that IS a real page keeps its id and stays a link.
 *
 * SECTIONS DO NOT APPEAR. A section groups rows visually; it is not an ancestor
 * of them. Devices sits under Connect in the rail and its trail is just
 * "Devices", which is correct — you cannot navigate to Connect.
 */
export function buildTrail(id: string, title: string, options: BuildTrailOptions): Crumb[] {
  const { items, pageTitles, recordParent = {} } = options

  const parent = navParents(items).get(id)

  // One crumb: the page is its own trail, and a lone crumb is the current page.
  if (!parent) return [{ label: title }]

  // Two crumbs: the accordion (no id, so plain text) then the page.
  const trail: Crumb[] = [{ label: pageTitles[parent.id] ?? parent.label }]

  // Three: the list page in between keeps its id, so it stays a link.
  const record = recordParent[id]
  if (record) trail.push({ label: pageTitles[record] ?? record, id: record })

  return [...trail, { label: title }]
}

/**
 * A section id is an alias for its default child — a parent row has no content
 * of its own, so nothing should ever land on one. Apply it wherever an id
 * enters your app: every navigation, and the initial route.
 *
 *     const go = useCallback((id: string) => setPage(resolveSection(id, DEFAULTS)), [])
 *
 * WRITE THE MAP OUT rather than reaching for `children[0]`. In the iosense nav,
 * Workflows' first child is `workflows-create` — a specific record, "Create
 * company when a deal closes" — which is a nonsense landing page. Reports' first
 * child happens to be the right one, which is exactly what would make an
 * implicit first-child rule look correct right up until Workflows proved it
 * wrong.
 */
export const resolveSection = (id: string, defaults: Record<string, string>) =>
  defaults[id] ?? id
