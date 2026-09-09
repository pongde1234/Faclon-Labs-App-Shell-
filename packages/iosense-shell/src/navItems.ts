import type { ReactNode } from 'react'

/**
 * THE FIXED SIZES. These are not suggestions and not defaults — they are the
 * shape of a nav row, and the rail enforces them in CSS so a wrong value
 * cannot break the column.
 *
 *   icon slot   16px, the SDK's
 *   glyph       14px, drawn inside it — clamped, see theme-overrides.css
 *   label       14px / 400 / --line-height-200, one step above the SDK default
 *   group label 12px, one step below the base, so the hierarchy reads
 *
 * The glyph is 14 rather than 16 so icons read lighter WITHOUT moving the icon
 * column: the slot stays 16, so every label starts at the same x whatever the
 * glyph does.
 *
 * Use this constant in your nav data. Mixing 14 and 16 across rows makes the
 * icon column look ragged — and if you pass something else entirely, the CSS
 * clamps it back rather than letting one row set the rail's width.
 */
export const NAV_ICON_SIZE = 14

/**
 * The rail's data model.
 *
 * THE POINT OF THIS FILE: the rail is a set of behaviours — hover peek, the
 * tooltip that only fires on an unreadable label, the accordion that opens
 * itself on a deep link, the flyout in the 48px strip, the badge that becomes a
 * dot when collapsed. None of that depends on WHICH rows are in it. So the rows
 * are data the host supplies, and the package ships the behaviour.
 *
 * No sample nav is exported, deliberately. A shell has no opinion about what a
 * product's pages are. The demo has a six-row placeholder in
 * `demo/placeholderNav.tsx` — copy that.
 */

/**
 * What an annotation means, which drives its colour AND whether a dot is drawn
 * on the icon while the rail is collapsed.
 *
 *   info   a plain quantity. Neutral — twelve accounts are not news, they are
 *          furniture. Reach for a colour only when the NUMBER is the bad news.
 *   alert  a count that genuinely is failures. Negative + Intense. Works as a
 *          signal only while nothing else borrows it.
 *   label  a word like "Beta". No dot: it is not state worth surfacing in 48px.
 */
export type NavTone = 'info' | 'alert' | 'label'

/**
 * An annotation, in the two shapes fds splits it into: a QUANTITY is a Counter
 * ("how many?") and a WORD is a Badge ("what is this?"). They share the same
 * pill, the same six colours and the same sizes — the axis is the answer type,
 * not the look, and a Counter never holds a word.
 *
 * The union is explicit rather than sniffed from the string, so "12" can never
 * silently take the wrong branch.
 */
export type NavBadge =
  | { kind: 'count'; value: number; tone: NavTone }
  | { kind: 'word'; label: string; tone: NavTone }

/** A plain nav row: icon + label, with an optional annotation at the end. */
export interface NavEntity {
  id: string
  label: string
  icon: ReactNode
  /**
   * The trailing slot. A Counter or a Badge — never a Chip: Chip renders a
   * <button> and the row is already a <button>, so nesting them is invalid HTML.
   * The SDK hides this slot when the rail collapses; a dot on the icon takes
   * over for `info` and `alert`.
   */
  badge?: NavBadge
  /**
   * Marks a row as ONE RECORD rather than a page — "Create company when a deal
   * closes" is a single workflow. Only meaningful inside an accordion, where it
   * draws the record's tree branch differently.
   */
  isRecord?: boolean
}

/**
 * A row that unfolds a sub-list beneath it.
 *
 * The parent row IS the disclosure control — clicking anywhere on it toggles.
 * Open state is persisted, and the group opens itself whenever one of its
 * children becomes active, so a deep link never lands on a hidden row.
 *
 * Collapsed, there is nowhere to unfold into, so the parent opens a FLYOUT
 * beside the 48px strip instead.
 *
 * Only accordions produce a breadcrumb ancestor (see buildTrail) — the parent
 * is a position, not a destination, so its crumb is inert text.
 */
export interface NavAccordion {
  id: string
  label: string
  icon: ReactNode
  children: NavEntity[]
}

/**
 * A labelled section that folds its rows away — the label is the control.
 *
 * Forced open while the rail is collapsed: a folded section in the 48px strip
 * is a hairline with no affordance to unfold it, and it would strand every icon
 * inside it.
 *
 * A section does NOT appear in the breadcrumb trail. It groups rows visually;
 * it is not an ancestor of them.
 */
export interface NavSection {
  kind: 'section'
  id: string
  label: string
  items: NavEntity[]
}

export type NavItem = NavEntity | NavAccordion | NavSection

export const isSection = (item: NavItem): item is NavSection =>
  'kind' in item && item.kind === 'section'

export const isAccordion = (item: NavItem): item is NavAccordion =>
  !isSection(item) && 'children' in item && Array.isArray(item.children)

/** Every id that can be navigated to, at any depth. Sections are not pages. */
export function navPageIds(items: NavItem[]): Set<string> {
  const ids = new Set<string>()
  for (const item of items) {
    if (isSection(item)) for (const child of item.items) ids.add(child.id)
    else if (isAccordion(item)) for (const child of item.children) ids.add(child.id)
    else ids.add(item.id)
  }
  return ids
}

/**
 * Page id to the accordion that contains it. Used to build the breadcrumb trail,
 * which is why it reads the SAME data the rail renders — the trail and the rail
 * cannot drift apart, because there is only one hierarchy.
 */
export function navParents(items: NavItem[]): Map<string, NavAccordion> {
  const parents = new Map<string, NavAccordion>()
  for (const item of items) {
    if (!isAccordion(item)) continue
    for (const child of item.children) parents.set(child.id, item)
  }
  return parents
}
