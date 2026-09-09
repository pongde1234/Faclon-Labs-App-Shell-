import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Archive,
  Bot,
  CalendarClock,
  ChevronDown,
  Database,
  Gauge,
  House,
  Link2,
  Mic,
  Cpu,
  Building2,
  GitBranch,
  FileText,
  HardDrive,
  LayoutTemplate,
  ListChecks,
  Play,
  Workflow,
  Rocket,
  Thermometer,
  Truck,
  Warehouse,
  Wallet,
  Wrench,
  Zap,
  Boxes,
  Beaker,
  CircleQuestionMark,
  Target,
} from 'lucide-react'
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

/* Rail glyph size. The SDK's icon slot stays 16px — this is the drawn size
   inside it, so the icons read lighter without moving the icon column. */
const ICON = 14

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
 * A rail annotation, in the two shapes fds actually splits it into: a QUANTITY
 * is a Counter ("how many?") and a WORD is a Badge ("what is this?"). They
 * share the same pill, the same six colours and the same sizes — the axis is
 * the answer type, not the look, and a Counter never holds a word.
 *
 * The union is explicit rather than sniffed from the string, so "12" can never
 * silently take the wrong branch.
 *
 * `tone` drives the pill's colour AND whether a collapsed dot is drawn: a count
 * or an alert is state worth surfacing in the 48px strip, a label like "Beta"
 * is not.
 */
type RailTone = 'info' | 'alert' | 'label'
type RailBadge =
  | { kind: 'count'; value: number; tone: RailTone }
  | { kind: 'word'; label: string; tone: RailTone }

/** What the annotation reads as — the collapsed tooltip quotes this. */
const badgeText = (badge: RailBadge) =>
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
function badgeSlot(badge: RailBadge) {
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

const PRIMARY_ITEMS: Array<{
  id: string
  label: string
  icon: React.ReactNode
  badge?: RailBadge
}> = [
  { id: 'home', label: 'Home', icon: <House size={ICON} /> },
  { id: 'finance', label: 'Finance', icon: <Wallet size={ICON} />, badge: { kind: 'count', value: 12, tone: 'info' } },
  {
    id: 'opportunities',
    label: 'Opportunities',
    icon: <Target size={ICON} />,
    // `info`, not `alert`: Opportunities is the sales pipeline, so three deals
    // are the thing you WANT. Red here reads as "3 problems".
    badge: { kind: 'count', value: 3, tone: 'info' },
  },
  { id: 'agents-lab', label: 'Agents Lab', icon: <Bot size={ICON} />, badge: { kind: 'word', label: 'Beta', tone: 'label' } },
  { id: 'voice', label: 'Voice', icon: <Mic size={ICON} /> },
]

/** A parent item with a nested sub-list (see NestedNavItem). */
const WORKFLOWS = {
  id: 'workflows',
  label: 'Workflows',
  icon: <Workflow size={ICON} />,
  children: [
    {
      // A specific workflow record, but it still takes an icon from the same
      // lucide outline family as every other rail row — never a letter. Zap is
      // the trigger glyph the app already uses for "when X happens" (see
      // Overview's Trigger Activity).
      id: 'workflows-create',
      label: 'Create company when a deal closes',
      icon: <Zap size={ICON} />,
      isRecord: true,
    },
    { id: 'workflows-all', label: 'All Workflows', icon: <ListChecks size={ICON} /> },
    { id: 'workflows-runs', label: 'Workflow runs', icon: <Play size={ICON} /> },
    { id: 'workflows-versions', label: 'Workflow versions', icon: <GitBranch size={ICON} /> },
  ],
}

const CONNECT_ITEMS = [
  { id: 'devices', label: 'Devices', icon: <HardDrive size={ICON} /> },
  { id: 'zomato', label: 'Zomato', icon: <Building2 size={ICON} /> },
  { id: 'terminal', label: 'Terminal', icon: <Thermometer size={ICON} /> },
  { id: 'fleet', label: 'Fleet', icon: <Truck size={ICON} /> },
  { id: 'warehouse', label: 'Warehouse', icon: <Warehouse size={ICON} /> },
  { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={ICON} /> },
  { id: 'models', label: 'Models', icon: <Boxes size={ICON} /> },
  { id: 'steamtrap', label: 'Steam Trap', icon: <Gauge size={ICON} /> },
  { id: 'tools', label: 'Tools', icon: <Rocket size={ICON} /> },
  { id: 'memory', label: 'Memory', icon: <Cpu size={ICON} /> },
  // A/B testbed: same page as Memory, forked so UI changes can be compared
  // side by side without touching the original.
  { id: 'memory-b', label: 'Memory B', icon: <Beaker size={ICON} /> },
  { id: 'connect', label: 'Connect', icon: <Link2 size={ICON} /> },
  { id: 'database', label: 'Database', icon: <Database size={ICON} /> },
]

/** A second nested group. Same shape as WORKFLOWS. */
const REPORTS = {
  id: 'reports',
  label: 'Reports',
  icon: <FileText size={ICON} />,
  children: [
    { id: 'reports-scheduled', label: 'Scheduled reports', icon: <CalendarClock size={ICON} /> },
    { id: 'reports-templates', label: 'Report templates', icon: <LayoutTemplate size={ICON} /> },
    { id: 'reports-archive', label: 'Report archive', icon: <Archive size={ICON} /> },
  ],
}

/** The nested groups' children — the top bar reads these to build its trail, so
    the trail and the rail can never disagree about the hierarchy. */
export const WORKFLOW_PAGE_IDS = new Set(WORKFLOWS.children.map((c) => c.id))
export const REPORT_PAGE_IDS = new Set(REPORTS.children.map((c) => c.id))

export interface AppSideNavProps {
  activeId: string
  onNavigate: (id: string) => void
  isPinned: boolean

  /** 'Light' is the SDK default (the Classic theme); 'Dark' is this app's default rail. */
  railTheme: 'Light' | 'Dark'
  /** Organisation row for the header (name, plan, switcher). Built by App. */
  workspace?: React.ReactNode
}

interface NestedNavItemProps {
  item: typeof WORKFLOWS | typeof REPORTS
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

/** Unfolded on a first visit — an accordion's `defaultValue`, for the rail. */
const DEFAULT_OPEN_GROUPS = ['workflows', 'connect']

/**
 * Which collapsible sections are unfolded, remembered across reloads.
 *
 * One Set rather than a boolean per section, because the answer is always "which
 * of these are open" and it serialises as-is. Sections are independent — opening
 * one never closes another, the accordion's `multiple` mode.
 */
function useOpenGroups() {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(OPEN_GROUPS_KEY)
      return new Set<string>(stored ? (JSON.parse(stored) as string[]) : DEFAULT_OPEN_GROUPS)
    } catch {
      // A hand-edited or stale entry must not take the whole rail down with it.
      return new Set(DEFAULT_OPEN_GROUPS)
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
  badge?: RailBadge
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
  activeId,
  onNavigate,
  isPinned,

  railTheme,
  workspace,
}: AppSideNavProps) {
  const setActiveId = onNavigate
  const { openGroups, toggle: toggleGroup, open: openGroup } = useOpenGroups()
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
            <SideNavBarMenu>
              {PRIMARY_ITEMS.map((item) => (
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
              <NestedNavItem
                item={WORKFLOWS}
                activeId={activeId}
                onNavigate={setActiveId}
                isCollapsed={!isOpen}
                isOpen={openGroups.has(WORKFLOWS.id)}
                onToggle={toggleGroup}
                onOpen={openGroup}
                isFlyoutOpen={openFlyout === WORKFLOWS.id}
                onFlyoutOpenChange={(next) => setOpenFlyout(next ? WORKFLOWS.id : null)}
              />
              <NestedNavItem
                item={REPORTS}
                activeId={activeId}
                onNavigate={setActiveId}
                isCollapsed={!isOpen}
                isOpen={openGroups.has(REPORTS.id)}
                onToggle={toggleGroup}
                onOpen={openGroup}
                isFlyoutOpen={openFlyout === REPORTS.id}
                onFlyoutOpenChange={(next) => setOpenFlyout(next ? REPORTS.id : null)}
              />
            </SideNavBarMenu>

            <NavGroup
              label="Connect"
              isOpen={openGroups.has('connect')}
              onToggle={() => toggleGroup('connect')}
              isRailCollapsed={!isPinned}
            >
              {CONNECT_ITEMS.map((item) => (
                <NavRow
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={activeId === item.id}
                  isCollapsed={!isOpen}
                  onClick={() => setActiveId(item.id)}
                />
              ))}
            </NavGroup>
          </ScrollArea>
        </SideNavBarContent>

        {/* Footer: help. Profile, notifications and the assistant moved to the
            top bar. Built as a NavRow like every other item rather than a bare
            IconButton, so the SDK fades the "Help" label in when the rail opens
            and drops back to the icon alone in the 48px strip — one mechanism
            for every labelled row in the rail. */}
        <SideNavBarFooter>
          <SideNavBarMenu>
            <NavRow
              icon={<CircleQuestionMark size={ICON} />}
              label="Help"
              isCollapsed={!isOpen}
            />
          </SideNavBarMenu>
        </SideNavBarFooter>
      </SideNavBar>
    </SideNavBarProvider>
  )
}
