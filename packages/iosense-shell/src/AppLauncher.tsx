import { useCallback, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Ellipsis } from 'lucide-react'
import { Popover } from '@faclon-labs/fds/popover'

/** One application in the launcher grid. */
export interface LauncherApp {
  id: string
  label: string
  /**
   * The mark, drawn inside a 40px round plate. A slot, not a component — the
   * shell has no icon set, so this is whatever the host already uses, and each
   * product's own brand mark is welcome here.
   */
  icon: ReactNode
}

/**
 * The application launcher: the grid that opens from the top bar's grip icon.
 *
 * WHAT IS HERE AND WHAT IS NOT. The panel, the grid, the tile, the current-app
 * marking and the focus handling are chrome and ship here. The APPS DO NOT —
 * only the host can enumerate which applications exist and which of them this
 * user may open, so `apps` is a prop and the package ships none.
 *
 * WHY Popover AND NOT DropdownMenu. The tiles are a 3-column grid, not a list:
 * ActionList and DropdownMenu both own their own row layout and arrow-key
 * model, and neither has a notion of moving left/right across a row. Popover
 * takes arbitrary `content`, which is what a grid needs. It is also the same
 * primitive `RailFlyout` uses, so the two panels behave identically — focus
 * trap, Escape, outside-press.
 *
 * CLICK, NOT HOVER, for the reason the rail flyout documents: fds's own guard
 * marks `openInteraction="hover"` as an accessibility `dont`, because it drops
 * the focus trap and cannot be opened from the keyboard.
 *
 * The styling is keyed off the `.app-launcher` marker div inside `content` —
 * Popover exposes no className of its own, and three panels now share the app.
 */
/**
 * How many applications the grid shows before it stops.
 *
 * Tied to the 3-column layout: eight apps plus the "More" tile is three full
 * rows, so the panel keeps one fixed, square shape whether the host has nine
 * applications or ninety. Raising this without changing the columns gives you a
 * ragged last row; raising both makes the panel taller than the bar it hangs
 * from.
 */
const MAX_TILES = 8

export function AppLauncher({
  apps,
  activeId,
  onSelect,
  onShowAll,
  label = 'Applications',
  children,
}: {
  apps: LauncherApp[]
  /** Which app is the one you are in. Marked, and not clickable to re-enter. */
  activeId?: string
  onSelect: (id: string) => void
  /**
   * Where the rest of the applications live — a page, your own modal, anything.
   * The launcher closes first, then calls this.
   *
   * WITHOUT IT THE GRID DOES NOT CAP. Hiding applications behind a tile that
   * leads nowhere would make them unreachable, which is worse than a long
   * panel, so the ninth slot only appears once there is somewhere for it to go.
   */
  onShowAll?: () => void
  /** Names the dialog for assistive tech. The header itself is visually hidden. */
  label?: string
  /** The trigger. Popover CLONES this, so it must be the button itself. */
  children: ReactElement<Record<string, unknown>>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const gridRef = useRef<HTMLElement | null>(null)

  /**
   * All derived, nothing stored: the moment the cap is state, it can disagree
   * with the array it was computed from.
   *
   * The cap is absolute past MAX_TILES — nine applications show eight and hide
   * one. A special case that showed all nine (they do fit) would mean the grid
   * sometimes holds nine and sometimes eight, and the rule stops being legible
   * the moment anyone has to predict which.
   */
  const isCapped = Boolean(onShowAll) && apps.length > MAX_TILES
  const shown = isCapped ? apps.slice(0, MAX_TILES) : apps
  const hiddenCount = apps.length - shown.length

  // Dev-only, and worth saying out loud: without `onShowAll` the host gets
  // every app in one long panel, which is a layout surprise rather than a bug.
  if (import.meta.env?.DEV && apps.length > MAX_TILES && !onShowAll) {
    console.warn(
      `[AppLauncher] ${apps.length} apps and no onShowAll, so all of them are ` +
        `rendered. Pass onShowAll to cap the grid at ${MAX_TILES} with a "More" tile.`,
    )
  }

  /**
   * Popover's default initial focus is its ✕, which this panel hides — and
   * floating-ui cannot focus a `display: none` node, so focus would fall to the
   * dialog itself and the first Tab would leave the grid. Aim at the first tile
   * instead. A callback ref rather than an effect, so it is set before
   * Popover's focus manager runs.
   */
  const mountGrid = useCallback((node: HTMLDivElement | null) => {
    gridRef.current = node?.querySelector<HTMLElement>('.app-launcher__tile') ?? null
  }, [])

  const pick = (id: string) => {
    setIsOpen(false)
    onSelect(id)
  }

  return (
    <Popover
      // Opens under the grip icon and hangs toward the page, since the trigger
      // sits at the bar's right edge and a centred panel would overflow.
      placement="bottom-end"
      // Passed and visually hidden (see theme-overrides.css): without a `title`
      // Popover sets no aria-labelledby and the dialog is announced unnamed.
      title={label}
      isOpen={isOpen}
      onOpenChange={({ isOpen: next }) => setIsOpen(next)}
      initialFocusRef={gridRef}
      content={
        <div className="app-launcher" ref={mountGrid}>
          {/* `grid` + `gridcell` roles are NOT set: these are buttons in a
              two-dimensional arrangement, not a data grid, and claiming the
              role would promise arrow-key navigation the browser does not give
              a plain grid. Tab order follows the visual order, which for a
              3-column grid reads row by row — the same way the eye does. */}
          <div className="app-launcher__grid">
            {shown.map((app) => {
              const isCurrent = app.id === activeId
              return (
                <button
                  key={app.id}
                  type="button"
                  className="app-launcher__tile"
                  // The source of truth for the current app. The wash is keyed
                  // off this attribute rather than a class, so the highlight
                  // cannot disagree with where you actually are.
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => pick(app.id)}
                >
                  <span className="app-launcher__glyph" aria-hidden="true">
                    {app.icon}
                  </span>
                  <span className="app-launcher__label">{app.label}</span>
                </button>
              )
            })}

            {/* The ninth tile. Same tile and glyph classes as the eight above
                it, so it sits in the grid rather than beside it — it is a way
                out of the panel, not a different kind of thing.

                No `aria-current`: it is not a destination. The count goes in
                the accessible name rather than the visible label, so the tile
                stays as narrow as its neighbours while a screen reader is still
                told how many applications are behind it. */}
            {isCapped && (
              <button
                type="button"
                className="app-launcher__tile"
                aria-label={`More applications (${hiddenCount})`}
                onClick={() => {
                  setIsOpen(false)
                  onShowAll?.()
                }}
              >
                <span className="app-launcher__glyph" aria-hidden="true">
                  {/* 20, not the 32 a brand mark gets: a line glyph carries far
                      less ink than a filled plate, so matching their box size
                      would make this tile the loudest in the grid. */}
                  <Ellipsis size={20} />
                </span>
                <span className="app-launcher__label">More</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  )
}
