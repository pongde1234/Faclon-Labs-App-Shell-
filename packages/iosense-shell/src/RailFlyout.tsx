import { useCallback, useRef, type ReactElement, type ReactNode } from 'react'
import { Popover } from '@faclon-labs/fds/popover'
import { ActionList, ActionListItem, ActionListSection } from '@faclon-labs/fds/actionlist'

/** A page under the entity — All Workflows, Workflow runs, … */
export interface RailDestination {
  id: string
  label: string
  /** A slot, not a component: it is handed straight to the item's `leading`.
     ReactNode rather than ReactElement so the public NavEntity model (which
     also allows a string or nothing) flows through without a cast. */
  icon: ReactNode
}

/**
 * The collapsed rail's flyout: click a parent icon in the 48px strip and its
 * sub-entities appear beside it, without expanding the rail.
 *
 * This is what makes collapsing safe. The nested sub-list is `display: none` in
 * the strip, so before this the only way to reach a child was to expand the
 * whole rail — which undid the user's density choice, and was wired to a TOGGLE,
 * so a second click closed the rail instead.
 *
 * WHY Popover AND NOT DropdownMenuSub. fds's submenu is the shape this wants,
 * but it throws unless it is inside an already-open DropdownMenu, so it can only
 * ever be a second-level flyout — and its own source documents the keyboard path
 * as known-broken (the SubTrigger renders through a wrapper the ActionList
 * registry never indexes, so arrows skip the row). DropdownMenuOverlay is
 * hardcoded to `bottom-start` with no placement prop. Popover is the only
 * primitive that anchors `right-start` off an arbitrary trigger.
 *
 * CLICK, NOT HOVER. The rail is used on touch panels — the "Open sidebar" row
 * exists for exactly that reason — and fds's own guard marks
 * `openInteraction="hover"` as an accessibility `dont`: it drops the focus trap
 * and cannot be opened from the keyboard. Click mode keeps the trap, Escape and
 * outside-press dismissal.
 */
export function RailFlyout({
  label,
  destinations,
  activeId,
  onNavigate,
  isOpen,
  onOpenChange,
  children,
}: {
  label: string
  destinations: RailDestination[]
  activeId: string
  onNavigate: (id: string) => void
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  /** The rail row. Popover CLONES this, so it must be the button itself. */
  children: ReactElement<Record<string, unknown>>
}) {
  const listRef = useRef<HTMLElement | null>(null)

  /**
   * ActionList is not a forwardRef — it sets its own `ref` on the rendered div,
   * which overwrites anything passed in — so the node is found by query off a
   * wrapper instead. A callback ref, not an effect, so it is set before
   * Popover's focus manager runs.
   */
  const mountList = useCallback((node: HTMLDivElement | null) => {
    listRef.current = node?.querySelector<HTMLElement>('.ds-action-list') ?? null
  }, [])

  const pick = (id: string) => {
    onOpenChange(false)
    onNavigate(id)
  }

  return (
    <Popover
      placement="right-start"
      // Passed and visually hidden (see theme-overrides): without a `title`
      // Popover sets no aria-labelledby and the dialog is announced unnamed.
      title={label}
      isOpen={isOpen}
      onOpenChange={({ isOpen: next }) => onOpenChange(next)}
      // Popover's default initialFocus is its ✕ button, which this flyout
      // hides — floating-ui cannot focus a display:none node. Aim at the list,
      // which is also the element that owns arrow-key navigation.
      initialFocusRef={listRef}
      content={
        <div className="app-rail-flyout" ref={mountList}>
          <ActionList
            accessibilityLabel={label}
            // Controlled single-select marks the current page: ActionListItem
            // ignores its own isSelected inside a list, and under the default
            // 'action' type nothing is ever selected. No onChange, so this
            // cannot drift from the route.
            selectionType="single"
            value={[activeId]}
          >
            <ActionListSection title={label}>
              {destinations.map((destination) => (
                <ActionListItem
                  key={destination.id}
                  value={destination.id}
                  title={destination.label}
                  leading={destination.icon}
                  onClick={() => pick(destination.id)}
                />
              ))}
            </ActionListSection>
          </ActionList>
        </div>
      }
    >
      {children}
    </Popover>
  )
}
