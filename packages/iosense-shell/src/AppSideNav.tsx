import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@faclon-labs/fds/badge'
import { Counter } from '@faclon-labs/fds/counter'
import { MaybeTooltip } from './MaybeTooltip'
import { RailFlyout } from './RailFlyout'
import { ScrollArea } from '@faclon-labs/fds/scrollarea'
import { Tooltip } from '@faclon-labs/fds/tooltip'
import {
  SideNavBar,
  SideNavBarContent,
  SideNavBarFooter,
  SideNavBarGroup,
  SideNavBarGroupLabel,
  SideNavBarHeader,
  SideNavBarMenu,
  SideNavBarMenuBadge,
  SideNavBarMenuButton,
  SideNavBarMenuItem,
  SideNavBarProvider,
} from '@faclon-labs/design-sdk/SideNavBar'

import {
  isAccordion,
  isSection,
  type NavAccordion,
  type NavBadge,
  type NavEntity,
  type NavItem,
  type NavSection,
} from './navItems'

/**
 * Attribute overrides spread onto <SideNavBar> AFTER its own props (see usage
 * note below).
 *
 * BOTH states strip the SDK's own `data-hovered`, and a PEEK is expressed by
 * sending OPEN_STATE instead. That indirection is the whole design:
 *
 *  - The SDK sets `data-hovered` itself, inside its own DOM, on pointer enter.
 *    React never sees it — so during an SDK-driven peek this component still
 *    believed it was a 48px strip while the user looked at a 240px panel. Every
 *    behaviour keyed on `isPinned` was wrong: tooltips fired on rows whose
 *    labels were plainly readable, nested groups opened flyouts beside an
 *    already-wide panel, and the organisation name stayed hidden.
 *  - Reporting the peek as `data-state="expanded"` instead means every rule
 *    already written for the expanded rail applies unchanged, with no CSS edits
 *    at all.
 *  - It still does not move the page. The footprint is widened by
 *    `[data-sidenav-pinned]` in theme-overrides.css, which only the top bar's
 *    toggle sets — so a peek expands `.fds-sidenav__inner` as an absolute
 *    overlay over a 48px footprint, and pinning stays the only thing that
 *    reflows the content column.
 *
 * Stripping `data-hovered` in both states is what makes the delays below real:
 * left in, the SDK would keep opening the rail instantly and our timing would be
 * decorative.
 */
const OPEN_STATE = { 'data-state': 'expanded', 'data-hovered': undefined } as Record<
  string,
  string | undefined
>
const CLOSED_STATE = { 'data-state': 'collapsed', 'data-hovered': undefined } as Record<
  string,
  string | undefined
>

/**
 * Hover intent for the peek. Opening waits so that crossing the rail on the way
 * somewhere else does nothing; closing is quick, because a panel that lingers
 * after you have left feels stuck rather than forgiving.
 */
const PEEK_OPEN_MS = 150
const PEEK_CLOSE_MS = 100

/**
 * A run of rows that share one <menu>, or a single section.
 *
 * The SDK's menu owns row-to-row spacing, so consecutive rows have to be
 * batched into one — a menu per row would put a gap between every pair.
 */
type NavBlock =
  | { kind: 'menu'; key: string; items: Array<NavEntity | NavAccordion> }
  | { kind: 'section'; section: NavSection }

function groupIntoBlocks(items: NavItem[]): NavBlock[] {
  const blocks: NavBlock[] = []
  for (const item of items) {
    if (isSection(item)) {
      blocks.push({ kind: 'section', section: item })
      continue
    }
    const last = blocks[blocks.length - 1]
    if (last?.kind === 'menu') last.items.push(item)
    // Keyed by the first row in the run: stable as long as the data is, and
    // an index would re-key every later block when one row moves.
    else blocks.push({ kind: 'menu', key: item.id, items: [item] })
  }
  return blocks
}

/**
 * Whether the rail is currently a 48px strip, for footer content.
 *
 * A context rather than a prop because the footer is a NODE the host passes in
 * — the rail cannot reach into it to tell each row what state to draw, and
 * making the host thread `isCollapsed` down by hand would leak an internal.
 */
const FooterCollapseContext = createContext(false)

/**
 * A footer row that behaves like every other labelled row in the rail: the
 * label fades in when the rail opens, drops to the icon alone in the 48px
 * strip, and takes a tooltip there.
 *
 *     footer={<NavFooterRow icon={<HelpIcon size={14} />} label="Help" onClick={openHelp} />}
 *
 * Nothing forces you to use it — the footer takes any node — but a bare
 * IconButton will not fade its label with the rail, and the row will look
 * wrong next to the rest of the nav.
 */
export function NavFooterRow(props: {
  icon: ReactNode
  label: string
  onClick?: () => void
}) {
  const isCollapsed = useContext(FooterCollapseContext)
  return (
    <SideNavBarMenu>
      <NavRow {...props} isCollapsed={isCollapsed} />
    </SideNavBarMenu>
  )
}

/** What the annotation reads as — the collapsed tooltip quotes this. */
const badgeText = (badge: NavBadge) =>
  badge.kind === 'count' ? String(badge.value) : badge.label

/**
 * `info` is Neutral, not Information, and that is the point: a plain quantity
 * carries no meaning, and the guard is explicit that most counts are Neutral —
 * reach for a colour only when the number ITSELF is the bad news. Twelve
 * accounts and three deals are not news, they are furniture.
 *
 * `alert` keeps Negative + Intense for a count that genuinely is failures, and
 * is currently unused — deliberately. It is the vocabulary for when something
 * really is wrong, and it only works as a signal while nothing else borrows it.
 */
const BADGE_COLOR = { info: 'Neutral', alert: 'Negative', label: 'Notice' } as const
const BADGE_EMPHASIS = { info: 'Subtle', alert: 'Intense', label: 'Subtle' } as const

/**
 * The SDK's trailing slot for a nav row — documented as "Badge, Action, etc."
 * and auto-hidden when the rail collapses, so nothing here is conditional.
 *
 * Neither may be a Chip: Chip renders a <button> and the nav row is already a
 * <button>, so nesting them is invalid HTML.
 *
 * `max` is set on every Counter because it has NO default — an uncapped count
 * renders in full and stretches the row it sits in.
 */
function badgeSlot(badge: NavBadge) {
  return (
    <SideNavBarMenuBadge>
      {badge.kind === 'count' ? (
        <Counter
          value={badge.value}
          max={99}
          color={BADGE_COLOR[badge.tone]}
          emphasis={BADGE_EMPHASIS[badge.tone]}
          size="Small"
        />
      ) : (
        <Badge
          label={badge.label}
          color={BADGE_COLOR[badge.tone]}
          emphasis={BADGE_EMPHASIS[badge.tone]}
          size="Small"
        />
      )}
    </SideNavBarMenuBadge>
  )
}

export interface AppSideNavProps {
  /**
   * The rows. **Empty by default** — this package ships the rail's behaviour,
   * not its contents.
   *
   * Three shapes, all in `navItems.ts`: a plain entity, an accordion (a row
   * with `children`), and a section (`kind: 'section'`, a labelled group that
   * folds).
   *
   * NOTHING IN THIS REPO RENDERS ROWS — not the package, not the demo. What the
   * rail does with them is specified in STORY.md §1.2 and §1.4, contracted in
   * guards/NavItems.guard.json, and exercised in stories/SideNav.stories.tsx
   * and stories/Rules.stories.tsx against fixtures that live with the stories.
   *
   * Build rows with `NAV_ICON_SIZE` for the glyph. The rail clamps anything
   * else back to it, so a stray `size={32}` cannot widen the icon column.
   */
  items?: NavItem[]
  activeId: string
  onNavigate: (id: string) => void
  isPinned: boolean

  /** 'Light' is the SDK default (the Classic theme); 'Dark' is this app's default rail. */
  railTheme: 'Light' | 'Dark'

  /**
   * The brand mark in the header. It stays put in the 48px header, collapsed
   * AND expanded — it never shifts.
   *
   * **Set this.** Left unset, design-sdk renders its own built-in iosense mark,
   * so an unbranded install silently ships someone else's logo.
   */
  logo?: ReactNode

  /** Organisation row in the header — a name, a plan, a workspace switcher. */
  workspace?: ReactNode

  /**
   * The footer. **Empty by default**, deliberately: Help is what the iosense
   * product puts here, not something every host wants. A promotional banner, a
   * plan row or nothing at all are equally valid.
   *
   * Build rows with `NavFooterRow` so the label fades in and out with the rail
   * the same way every other labelled row does.
   */
  footer?: ReactNode

  /**
   * Which accordions and sections are unfolded on a FIRST visit, before the
   * user has expressed a preference. Afterwards their choice is remembered and
   * this is ignored.
   *
   * Defaults to every **section** id and no accordion. A folded section in a
   * fresh install is a hairline label with no affordance to unfold it and it
   * strands every row inside it; a folded accordion still shows its parent row,
   * so it costs nothing.
   */
  defaultOpenGroups?: string[]
}

interface NestedNavItemProps {
  item: NavAccordion
  activeId: string
  onNavigate: (id: string) => void
  isCollapsed: boolean
  isOpen: boolean
  onToggle: (id: string) => void
  onOpen: (id: string) => void
  /**
   * Owned by the rail, not the row: two Popovers do not share a floating tree,
   * so neither dismisses the other and opening a second flyout would leave both
   * panels on screen.
   */
  isFlyoutOpen: boolean
  onFlyoutOpenChange: (isOpen: boolean) => void
}

const OPEN_GROUPS_KEY = 'iosense:sidenav-open-groups'

/**
 * Unfolded on a first visit — an accordion's `defaultValue`, for the rail.
 *
 * Every SECTION and no accordion, unless the host says otherwise. A folded
 * section in a fresh install is a hairline with no affordance to unfold it and
 * it strands every row inside; a folded accordion still shows its parent row.
 */
const defaultOpenFor = (items: NavItem[]) =>
  items.filter(isSection).map((section) => section.id)

/**
 * Which collapsible sections are unfolded, remembered across reloads.
 *
 * One Set rather than a boolean per section, because the answer is always "which
 * of these are open" and it serialises as-is. Sections are independent — opening
 * one never closes another, the accordion's `multiple` mode.
 */
function useOpenGroups(fallback: string[]) {
  // Read once, on mount. `fallback` is only the FIRST-VISIT answer, so it is
  // deliberately not a dependency — recomputing it when the items array
  // identity changes would re-open sections the user had just folded.
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(OPEN_GROUPS_KEY)
      return new Set<string>(stored ? (JSON.parse(stored) as string[]) : fallback)
    } catch {
      // A hand-edited or stale entry must not take the whole rail down with it.
      return new Set(fallback)
    }
  })

  useEffect(() => {
    localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify([...openGroups]))
  }, [openGroups])

  const toggle = useCallback((id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }, [])

  // Returns the same Set when the id is already open, so navigating inside a
  // section that is already unfolded doesn't re-render the rail.
  const open = useCallback((id: string) => {
    setOpenGroups((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])

  return { openGroups, toggle, open }
}

/**
 * A nav sub-list that animates open and closed instead of mounting and
 * unmounting.
 *
 * The grid `0fr -> 1fr` track measures nothing: it resolves to the list's own
 * height, so the transition holds for any number of children and survives a font
 * swap or a rewrapped label — no scrollHeight bookkeeping, unlike the SDK
 * Accordion's own body. `inert` keeps a closed list out of the tab order and the
 * accessibility tree, which the previous conditional render gave for free.
 */
function CollapsibleMenu({
  isOpen,
  menuClassName,
  children,
}: {
  isOpen: boolean
  menuClassName: string
  children: React.ReactNode
}) {
  return (
    <div className="app-sidenav__collapsible" data-open={isOpen} inert={!isOpen}>
      {/* The clipping box is what the grid track squeezes — see the CSS. The
          list keeps its own margins and geometry either way. */}
      <div className="app-sidenav__collapsible-inner">
        <SideNavBarMenu className={menuClassName}>{children}</SideNavBarMenu>
      </div>
    </div>
  )
}

/**
 * Supplies the label a collapsed row cannot show. The SDK hides MenuButton's
 * label in the 48px strip and offers nothing in its place (its own answer is
 * hover-to-expand, which this app replaced with an explicit toggle), and
 * MenuButton's props deliberately Omit `title`, so a native tooltip is out too.
 *
 * fds's Tooltip has no `isDisabled`, so the suppression is a branch instead:
 * an expanded row whose label is fully visible renders the trigger ALONE — no
 * wrapper to disturb the row's layout, and no tooltip repeating a label that is
 * already on screen.
 */
function RailTooltip({
  label,
  isCollapsed,
  isTruncated = false,
  children,
}: {
  label: string
  isCollapsed: boolean
  /** Expanded rows show their label already — unless it is clipped. */
  isTruncated?: boolean
  /** fds types Tooltip’s child as a single element carrying props, not any node. */
  children: React.ReactElement<Record<string, unknown>>
}) {
  if (!isCollapsed && !isTruncated) return children
  // The trigger is a span, not the MenuButton itself: fds's Tooltip clones its
  // child to attach hover handlers and a ref, and design-sdk's MenuButton does
  // not forward them — wrapping it directly rendered no tooltip at all.
  return (
    <Tooltip content={label} placement="right">
      <span className="app-sidenav__tip">{children}</span>
    </Tooltip>
  )
}

/**
 * Watches a menu button's label for ellipsis clipping, so a tooltip can reveal
 * the full text. Nested rows sit inside a tree indent, so a long record name
 * ("Create company when a deal closes") runs out of width even in the 240px rail.
 *
 * The label is the SDK's own element inside MenuButton, hence the query off the
 * button's root rather than a ref of our own.
 */
function useLabelTruncated() {
  const [isTruncated, setIsTruncated] = useState(false)
  const stop = useRef<(() => void) | null>(null)

  // A callback ref, so measuring starts the moment the node lands — an effect
  // reading a ref object races Tooltip, which clones its child.
  const ref = useCallback((node: HTMLElement | null) => {
    stop.current?.()
    stop.current = null
    if (!node) return

    const label = node.querySelector<HTMLElement>('.fds-sidenav-menu-button__label')
    if (!label) return

    const measure = () => setIsTruncated(label.scrollWidth > label.clientWidth)
    measure()
    // The web font swapping in widens the TEXT without changing the label's
    // box, and ResizeObserver only reports box changes — so the first measure
    // can run against fallback metrics and never be corrected. Re-measure once
    // the real font is in.
    document.fonts?.ready.then(measure).catch(() => {})

    // The box does change when the rail opens/closes; that's what RO catches.
    const observer = new ResizeObserver(measure)
    observer.observe(label)
    stop.current = () => observer.disconnect()
  }, [])

  useEffect(() => () => stop.current?.(), [])

  return { ref, isTruncated }
}

/** One nav row: icon + label, tooltip when collapsed or clipped. */
function NavRow({
  icon,
  label,
  isActive,
  isCollapsed,
  onClick,
  trailing,
  badge,
  // Anything else lands on the <li> — SideNavBarMenuItem extends
  // LiHTMLAttributes, so `data-*` and `inert` pass straight through.
  ...liProps
}: {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  isCollapsed: boolean
  onClick?: () => void
  /** Badge / counter. The SDK hides this whenever the rail collapses. */
  trailing?: React.ReactNode
  /** Draws a dot on the icon while collapsed, since the badge is hidden then. */
  badge?: NavBadge
} & React.LiHTMLAttributes<HTMLLIElement>) {
  const { ref, isTruncated } = useLabelTruncated()
  // Collapsed, the dot says THAT there is something but not what — so the
  // tooltip carries the number the badge would have shown.
  const showDot = badge && badge.tone !== 'label'
  const tooltip = isCollapsed && showDot ? `${label} · ${badgeText(badge)}` : label

  return (
    <SideNavBarMenuItem data-indicator={showDot ? badge.tone : undefined} {...liProps}>
      <RailTooltip label={tooltip} isCollapsed={isCollapsed} isTruncated={isTruncated}>
        <SideNavBarMenuButton
          ref={ref}
          icon={icon}
          label={label}
          isActive={isActive}
          onClick={onClick}
          trailing={trailing}
        />
      </RailTooltip>
    </SideNavBarMenuItem>
  )
}

/**
 * Parent row + collapsible child list. The SDK rail has no sub-menu primitive,
 * so this composes one: the parent MenuButton is the disclosure control —
 * clicking anywhere on it toggles the group — with a chevron MenuAction in its
 * trailing slot as the visual cue (it toggles too; the SDK stops its click from
 * bubbling, so no double-toggle). A nested SideNavBarMenu renders below.
 *
 * The group opens itself whenever a child becomes active (deep link, in-app
 * navigation) so nothing lands hidden, but the user can fold it afterwards.
 *
 * `app-sidenav__group` is a STABLE class on the <li>: the parent-row styling
 * (20px tile, label offset, column layout) keys on it so the row does not
 * change shape when the sub-list mounts or unmounts.
 */
function NestedNavItem({
  item,
  activeId,
  onNavigate,
  isCollapsed,
  isOpen,
  onToggle,
  onOpen,
  isFlyoutOpen,
  onFlyoutOpenChange,
}: NestedNavItemProps) {

  /**
   * Popover restores focus itself, but it cannot here: closing flips
   * MaybeTooltip`s `show`, which changes the element type at that position, so
   * React remounts the row and the node floating-ui saved is detached by the
   * time it tries. Focus the current button instead, after the remount.
   */
  const closeFlyout = (next: boolean) => {
    onFlyoutOpenChange(next)
    if (!next) {
      // Addressed by attribute rather than by ref, and that is NOT a style
      // choice. fds's Tooltip clones its child as
      //   cloneElement(children, getReferenceProps({ ref: mergedRef, ...children.props }))
      // — `children.props` lands AFTER `ref`, so a child carrying its own ref
      // overwrites the merged one and `refs.setReference` never runs. The
      // tooltip then has no reference element and can never open. Putting a ref
      // on the tip span silently killed the hover label on exactly these rows,
      // while every other rail row (whose span has no ref) kept working.
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLButtonElement>(`[data-flyout-id="${item.id}"] .fds-sidenav-menu-button`)
          ?.focus()
      })
    }
  }
  const childActive = item.children.some((c) => c.id === activeId)
  useEffect(() => {
    if (childActive) onOpen(item.id)
  }, [childActive, item.id, onOpen])
  const expanded = isOpen

  /**
   * One button, wired two ways.
   *
   * Collapsed it carries NO onClick and NO aria-expanded of ours: Popover's
   * `useClick` supplies the click and `useRole` supplies aria-haspopup /
   * aria-expanded / aria-controls, and those must have a single source. Because
   * SideNavBarMenuButton forwards its ref and rest props, Popover clones
   * straight onto the real <button> — so those attributes land on an
   * interactive element rather than on a wrapper span.
   */
  const button = (
    <SideNavBarMenuButton
      icon={item.icon}
      label={item.label}
      // Collapsed, the child rows are display:none, so the parent stands in for
      // whichever of them is current — otherwise the strip marks NOTHING while
      // you sit on a child page. Expanded, the tree shows the real child and
      // containment is already legible, so the parent stays unmarked.
      isActive={isCollapsed && childActive}
      {...(isCollapsed
        ? {}
        : { 'aria-expanded': expanded, onClick: () => onToggle(item.id) })}
      // Visual cue only — the row itself is the control. (A MenuAction here
      // would be a <button> inside the row's <button>, which is invalid HTML.)
      trailing={
        <span className="app-sidenav__toggle" data-open={expanded} aria-hidden="true">
          <ChevronDown size={14} />
        </span>
      }
    />
  )

  return (
    <SideNavBarMenuItem
      className="app-sidenav__group"
      data-has-flyout="true"
      data-flyout-id={item.id}
    >
      {isCollapsed ? (
        // MaybeTooltip outermost, Popover innermost: each clones a different
        // node, and the tooltip must go quiet while the dialog is open (fds's
        // Tooltip has no isDisabled — that is what MaybeTooltip is for). The
        // span is ours rather than RailTooltip's so it is always present, and
        // the row does not shift when the tooltip switches off.
        <MaybeTooltip show={!isFlyoutOpen} content={item.label} placement="right">
          <span className="app-sidenav__tip">
            <RailFlyout
              label={item.label}
              destinations={item.children.map((c) => ({
                id: c.id,
                label: c.label,
                icon: c.icon,
              }))}
              activeId={activeId}
              onNavigate={onNavigate}
              isOpen={isFlyoutOpen}
              onOpenChange={closeFlyout}
            >
              {button}
            </RailFlyout>
          </span>
        </MaybeTooltip>
      ) : (
        button
      )}
      <CollapsibleMenu
        isOpen={expanded}
        menuClassName="app-sidenav__sub"
      >
        {item.children.map((child) => (
          <NavRow
            key={child.id}
            className={'isRecord' in child && child.isRecord ? 'app-sidenav__sub-item--record' : undefined}
            icon={child.icon}
            label={child.label}
            isActive={activeId === child.id}
            // Never collapsed in practice — the sub-list is hidden in the icon
            // strip — so their tooltip is purely the clipped-label case.
            isCollapsed={false}
            onClick={() => onNavigate(child.id)}
          />
        ))}
      </CollapsibleMenu>
    </SideNavBarMenuItem>
  )
}

/**
 * A labelled section whose label is also its disclosure control — clicking
 * "Connect" folds the section away, like the nested Workflows group.
 *
 * The SDK's GroupLabel renders a <div> (so a <button> inside is valid) whose
 * text span is `pointer-events: none` while the rail is collapsed, so the
 * control is only live once the rail is open.
 *
 * Folding only applies to the open rail: in the 48px strip the section is forced
 * back open, because the label there is just a hairline with no affordance to
 * unfold it again, and a folded section would strand every icon inside it.
 */
function NavGroup({
  label,
  children,
  isOpen,
  onToggle,
  isRailCollapsed,
}: {
  label: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  isRailCollapsed: boolean
}) {
  const expanded = isOpen || isRailCollapsed

  return (
    <SideNavBarGroup>
      <SideNavBarGroupLabel>
        <button
          type="button"
          className="app-sidenav__group-label"
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          {label}
          <ChevronDown size={14} className="app-sidenav__group-chevron" aria-hidden="true" />
        </button>
      </SideNavBarGroupLabel>
      <CollapsibleMenu isOpen={expanded} menuClassName="app-sidenav__group-body">
        {children}
      </CollapsibleMenu>
    </SideNavBarGroup>
  )
}

export function AppSideNav({
  items = [],
  activeId,
  onNavigate,
  isPinned,

  railTheme,
  logo,
  workspace,
  footer,
  defaultOpenGroups,
}: AppSideNavProps) {
  const setActiveId = onNavigate
  const { openGroups, toggle: toggleGroup, open: openGroup } = useOpenGroups(
    defaultOpenGroups ?? defaultOpenFor(items),
  )

  // Group the flat item list into render blocks: runs of plain rows and
  // accordions share one <menu>, and each section stands alone. Done here
  // rather than inline so the JSX below reads as "for each block", and so the
  // batching rule lives in one place.
  const blocks = groupIntoBlocks(items)
  // Which nested group's flyout is showing, if any. One at a time: fds's
  // Popovers do not join a floating tree, so nothing would close the previous
  // panel when a second opens.
  const [openFlyout, setOpenFlyout] = useState<string | null>(null)

  /**
   * The hover preview, owned here rather than by the SDK — see the note on
   * CLOSED_STATE for why that ownership is the point.
   *
   * A pinned rail has nothing to preview, and the mobile drawer renders this
   * component with `isPinned`, so that one condition disables the peek in both
   * places it should be off.
   */
  const [isPeeking, setIsPeeking] = useState(false)
  const peekTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(peekTimer.current), [])

  const schedulePeek = useCallback((next: boolean) => {
    clearTimeout(peekTimer.current)
    peekTimer.current = setTimeout(
      () => setIsPeeking(next),
      next ? PEEK_OPEN_MS : PEEK_CLOSE_MS,
    )
  }, [])

  // Pinning mid-peek would otherwise leave the flag set, and un-pinning would
  // then show a peeked rail nobody is hovering.
  useEffect(() => {
    if (isPinned) {
      clearTimeout(peekTimer.current)
      setIsPeeking(false)
    }
  }, [isPinned])

  /** Expanded to the eye: pinned open, or peeked open. */
  const isOpen = isPinned || isPeeking
  // The flyout only exists in the icon strip.
  useEffect(() => {
    if (isPinned) setOpenFlyout(null)
  }, [isPinned])

  return (
    // Nested provider so `data-theme` scopes to the rail subtree only. Passing
    // the theme to <AppShell> instead would put the attribute on the shell-wide
    // provider, which redefines --text-gray-primary to white for the page
    // content as well.
    <SideNavBarProvider
      theme={railTheme}
      /* "Never mobile". Left at its 768 default, the SideNavBar inside this
         provider renders its own MobileNav below that width — which draws
         nothing while closed, so the rail vanished entirely on a phone. Nothing
         could open it either: that drawer's openMobile state lives in THIS
         provider and has no controlled prop, so the top bar (outside) cannot
         reach it. Disabled here so the rail always renders its <aside>, and
         AppNavDrawer owns the responsive behaviour — one place, not two
         disagreeing. */
      mobileBreakpoint={0}
      className="app-sidenav-theme"
    >
      {/* SideNavBar spreads rest props AFTER its own `data-state`, so passing
          the attribute overrides the hover-derived state. That reuses every SDK
          `[data-state=expanded]` rule — inner width, header text, menu labels,
          group labels, trailing slots — instead of re-implementing each in CSS.
          Only the reserved footprint still needs an override (theme-overrides.css). */}
      <SideNavBar
        {...(isOpen ? OPEN_STATE : CLOSED_STATE)}
        // `pointerType` rather than a hover media query: on touch,
        // pointerenter arrives with the tap meant to follow a link and no
        // leave ever comes, so the rail would stay peeked open.
        onPointerEnter={(e) => {
          if (!isPinned && e.pointerType === 'mouse') schedulePeek(true)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') schedulePeek(false)
        }}
        // Keyboard parity. Without it someone tabbing into a collapsed rail
        // gets sixteen unlabelled glyphs. Capture phase, because focus lands
        // on a descendant and never on the panel itself.
        onFocusCapture={() => { if (!isPinned) schedulePeek(true) }}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) schedulePeek(false)
        }}
      >
        {/* Header. Open: [logo] [org]. Collapsed: the logo alone — the SDK
            guard requires it stay put ("always visible in the 48px header,
            collapsed AND expanded, it never shifts").

            The collapse control is NOT here. It lives in the top bar, because
            the rail is the thing being collapsed and a control cannot live
            inside the panel it hides — collapsed, the rail has 48px and the
            button had to be duplicated as a row in the list to stay reachable.
            One control in fixed chrome replaces both. */}
        <SideNavBarHeader
          // Undefined falls through to design-sdk's built-in mark, which is the
          // iosense logo — fine here, wrong in anyone else's product. The prop
          // doc says to set it; this is the line that makes not setting it
          // silently ship our identity.
          brand={logo}
          trailing={
            /* Always mounted and faded, the way the SDK treats its own
               `__text` slot — mounting it on toggle made the org name blink in
               after the rail had already finished moving. `inert` while
               collapsed keeps it untabbable. */
            <div className="app-sidenav__workspace" inert={!isOpen}>
              {workspace}
            </div>
          }
        />

        <SideNavBarContent>
          {/* The rail scrolls through fds's overlay bars — the same ScrollArea
              the Table and the menus use — rather than a native gutter. */}
          <ScrollArea
            axis="y"
            className="app-sidenav__scroll"
            viewportClassName="app-sidenav__viewport"
          >
            {/* Consecutive rows share one <menu>; each section gets its own
                group. Batched rather than one <menu> per row because the SDK's
                menu owns the row-to-row spacing — a menu per item would put a
                gap between every pair of rows. */}
            {blocks.map((block) =>
              block.kind === 'section' ? (
                <NavGroup
                  key={block.section.id}
                  label={block.section.label}
                  isOpen={openGroups.has(block.section.id)}
                  onToggle={() => toggleGroup(block.section.id)}
                  isRailCollapsed={!isPinned}
                >
                  {block.section.items.map((item) => (
                    <NavRow
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      isActive={activeId === item.id}
                      isCollapsed={!isOpen}
                      trailing={item.badge ? badgeSlot(item.badge) : undefined}
                      badge={item.badge}
                      onClick={() => setActiveId(item.id)}
                    />
                  ))}
                </NavGroup>
              ) : (
                <SideNavBarMenu key={block.key}>
                  {block.items.map((item) =>
                    isAccordion(item) ? (
                      <NestedNavItem
                        key={item.id}
                        item={item}
                        activeId={activeId}
                        onNavigate={setActiveId}
                        isCollapsed={!isOpen}
                        isOpen={openGroups.has(item.id)}
                        onToggle={toggleGroup}
                        onOpen={openGroup}
                        isFlyoutOpen={openFlyout === item.id}
                        onFlyoutOpenChange={(next) => setOpenFlyout(next ? item.id : null)}
                      />
                    ) : (
                      <NavRow
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeId === item.id}
                        isCollapsed={!isOpen}
                        trailing={item.badge ? badgeSlot(item.badge) : undefined}
                        badge={item.badge}
                        onClick={() => setActiveId(item.id)}
                      />
                    ),
                  )}
                </SideNavBarMenu>
              ),
            )}
          </ScrollArea>
        </SideNavBarContent>

        {/* Footer: the host's, and EMPTY by default. Help is what the iosense
            product puts here; it is not chrome. Profile, notifications and the
            assistant are not here either — they moved to the top bar.

            Not rendered at all when there is nothing to put in it, so an unused
            footer costs no height. Use NavFooterRow to build rows that fade
            their label in and out with the rail like every other labelled row. */}
        {footer && (
          <SideNavBarFooter>
            <FooterCollapseContext.Provider value={!isOpen}>
              {footer}
            </FooterCollapseContext.Provider>
          </SideNavBarFooter>
        )}
      </SideNavBar>
    </SideNavBarProvider>
  )
}
