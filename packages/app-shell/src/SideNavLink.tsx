import { useContext, useId, useState } from 'react'

import { ChevronIcon } from './icons'
import { MAX_NAV_DEPTH, NavContext, useShell } from './NavContext'
import { collectHrefs } from './navTree'
import type { NavItem } from './types'
import styles from './SideNavLink.module.css'

/**
 * Declared rather than imported from `@types/node`: this package takes no
 * dependencies, dev ones included, and it needs exactly one field off `process`.
 * The declaration is type-only, so nothing survives compilation.
 */
declare const process: { env: { NODE_ENV?: string } }

/**
 * `process.env.NODE_ENV` over `import.meta.env.DEV` because this is destined
 * for a package: every bundler statically replaces it — Vite, webpack, Rollup,
 * esbuild — and React itself uses the same idiom, so the dev-only branches
 * below are eliminated from consumers' production builds whatever they build
 * with.
 *
 * try/catch rather than `typeof process !== 'undefined'`, and that distinction
 * is load-bearing rather than stylistic. A bundler replaces the exact text
 * `process.env.NODE_ENV` and nothing else — it does NOT define a `process`
 * global — so a `typeof` guard is never substituted, evaluates to
 * `'undefined'` in the browser, and switches the guardrail off in precisely
 * the environment it exists to protect. That was the first version of this
 * line, and it silently disabled the depth cap.
 *
 * The catch covers being loaded with no replacement step at all, where the
 * reference would throw. It errs toward dev: a guardrail that is noisy when it
 * should be quiet is a far better failure than one that is quiet when it
 * should be noisy.
 */
function computeIsDev(): boolean {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return true
  }
}

const isDev = computeIsDev()

interface SideNavLinkProps {
  item: NavItem
}

/**
 * One nav row, and — when it has children — the list beneath it.
 *
 * DEPTH IS NOT A PROP. It comes from NavContext, so a caller cannot assert a
 * level the item does not occupy, and the cap below is therefore real rather
 * than advisory. See NavContext.
 */
export function SideNavLink({ item }: SideNavLinkProps) {
  const depth = useContext(NavContext).depth + 1
  const { currentPath, linkComponent: As, isCollapsed, onNavigate } = useShell('SideNavLink')
  const panelId = useId()

  const hrefs = collectHrefs(item)
  const isCurrent = item.href === currentPath
  /** True for an ancestor of the current page as well as for the page itself. */
  const isBranchActive = hrefs.includes(currentPath)
  const hasChildren = Boolean(item.children?.length)

  /**
   * Open on load when the current page is somewhere inside. Initialiser rather
   * than an effect: an effect would render the branch closed for one frame and
   * then snap it open, and on a cold load that reads as a glitch.
   *
   * Uncontrolled from then on, so a user who closes a branch containing the
   * current page keeps it closed. Re-deriving it would fight them.
   */
  const [isOpen, setIsOpen] = useState(isBranchActive)

  if (depth > MAX_NAV_DEPTH) {
    // Dev-only, and it throws rather than warns: a 4th level has nowhere to
    // indent to, so it renders as a visually broken duplicate of level 3 —
    // worse to diagnose than a stop with the item's name in it.
    if (isDev) {
      throw new Error(
        `[AppShell] Nav item "${item.id}" (${item.label}) is at depth ${depth}, ` +
          `but the sidebar supports ${MAX_NAV_DEPTH} levels. ` +
          `Flatten this branch or promote it to its own section.`,
      )
    }
    return null
  }

  /**
   * Only depth 2 and 3 may show a description. Depth 1 has to survive
   * collapsing to a 56px icon rail, where a second line has nowhere to go.
   */
  const showDescription = Boolean(item.description) && depth >= 2 && !isCollapsed
  if (isDev && item.description && depth === 1) {
    console.warn(
      `[AppShell] Nav item "${item.id}" sets a description at depth 1, where it ` +
        `is not rendered — depth 1 is icon + label only so it can collapse to a rail.`,
    )
  }

  /** Only while the rail is a 56px strip, where the label is not visible. */
  const title = isCollapsed ? (item.tooltip ?? item.label) : undefined

  const body = (
    <>
      {item.icon ? (
        <span className={styles.icon} aria-hidden="true">
          {item.icon}
        </span>
      ) : (
        // Keeps labels on one vertical line whether or not a sibling has an
        // icon. An icon-less row in an iconed list otherwise sits 24px left of
        // every other label in the group.
        <span className={styles.icon} aria-hidden="true" />
      )}
      <span className={styles.text}>
        <span className={styles.label}>{item.label}</span>
        {showDescription && <span className={styles.description}>{item.description}</span>}
      </span>
      {item.badge !== undefined && item.badge !== null && (
        <span className={styles.badge}>{item.badge}</span>
      )}
    </>
  )

  /**
   * Three shapes, and the element is chosen by what the row DOES:
   *
   *   href + children  →  <a> to navigate, plus a separate <button> to expand
   *   children only    →  <button>, because there is nowhere to navigate to
   *   href only        →  <a>
   *
   * Never a clickable <div>. A row that both navigates and expands gets two
   * real controls rather than one that guesses from the click coordinates.
   */
  const row = hasChildren ? (
    <div className={styles.parentRow}>
      {item.href ? (
        <As
          className={styles.link}
          href={item.href}
          aria-current={isCurrent ? 'page' : undefined}
          title={title}
          onClick={onNavigate}
          data-depth={depth}
          // `!isCurrent`, or the row you are actually on would carry both the
          // active fill and the ancestor weight — two states saying different
          // things about the same row.
          data-branch-active={(!isCurrent && isBranchActive) || undefined}
        >
          {body}
        </As>
      ) : (
        <button
          type="button"
          className={styles.link}
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          title={title}
          data-depth={depth}
          // A group with no page of its own is never the current page, but it
          // still has to read as the branch you are in.
          data-branch-active={isBranchActive || undefined}
        >
          {body}
          <ChevronIcon className={styles.chevron} />
        </button>
      )}
      {/* The separate trigger exists only when the row itself is a link — one
          control cannot both navigate and expand. */}
      {item.href && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`}
        >
          <ChevronIcon className={styles.chevron} />
        </button>
      )}
    </div>
  ) : (
    <As
      className={styles.link}
      href={item.href}
      aria-current={isCurrent ? 'page' : undefined}
      title={title}
      onClick={onNavigate}
      data-depth={depth}
    >
      {body}
    </As>
  )

  return (
    <li className={styles.item} data-depth={depth}>
      {row}
      {hasChildren && (
        /*
         * The wrapper exists ONLY to animate the rail collapse, and it is a
         * grid for one reason: `grid-template-rows: 1fr -> 0fr` animates a
         * content-sized height, which `height: auto -> 0` cannot. No measuring,
         * no ResizeObserver, no hardcoded row heights.
         *
         * Before this, the sub-tree was hidden the instant `isCollapsed` became
         * true and every row beneath it jumped 412px in a single frame — by far
         * the largest discontinuity in the collapse, and the reason it still
         * felt jumpy after the icon was nailed down.
         *
         * `hidden` on the <ul> is now ONLY the branch's own expand state, which
         * is a user action and should stay instant. The id stays on the <ul>, so
         * `aria-controls` still resolves.
         */
        <div className={styles.childrenWrap}>
          <ul id={panelId} className={styles.children} hidden={!isOpen}>
            <NavContext.Provider value={{ depth }}>
              {item.children?.map((child) => <SideNavLink key={child.id} item={child} />)}
            </NavContext.Provider>
          </ul>
        </div>
      )}
    </li>
  )
}
