import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { LayoutGrid } from 'lucide-react'
import { Popover } from '@faclon-labs/fds/popover'
import { ScrollArea } from '@faclon-labs/fds/scrollarea'
import { Button } from '@faclon-labs/fds/button'
import { DropdownMenuEmptyState } from '@faclon-labs/fds/dropdownmenu'

import { MaybeTooltip } from './MaybeTooltip'


/**
 * Watches a tile's label for clipping, so a tooltip can reveal the full name
 * ONLY when there is something hidden to reveal. A tooltip repeating a name
 * already on screen is noise, and this grid would otherwise fire one on every
 * tile — the rail follows the same rule, and `useLabelTruncated` in AppSideNav
 * is the same idea against the SDK's own markup.
 *
 * WIDTH IS THE TEST, because the label is a true `white-space: nowrap` line
 * and overflows sideways. (A one-line `-webkit-line-clamp` would look the same
 * and overflow DOWNWARD instead, which is why the label is not one.)
 *
 * A callback ref rather than an effect, so measuring starts the moment the
 * node lands — fds's Tooltip clones its child, and an effect reading a ref
 * object races that.
 */
function useLabelClipped() {
  const [isClipped, setIsClipped] = useState(false)
  const stop = useRef<(() => void) | null>(null)

  const ref = useCallback((node: HTMLElement | null) => {
    stop.current?.()
    stop.current = null
    if (!node) return

    const measure = () => setIsClipped(node.scrollWidth > node.clientWidth)
    measure()
    // The web font swapping in widens the TEXT without changing the box, and
    // ResizeObserver only reports box changes — so a first measure against
    // fallback metrics would never be corrected. The rail learned this too.
    document.fonts?.ready.then(measure).catch(() => {})

    const observer = new ResizeObserver(measure)
    observer.observe(node)
    stop.current = () => observer.disconnect()
  }, [])

  useEffect(() => () => stop.current?.(), [])

  return { ref, isClipped }
}

/**
 * ONE TILE, and a component rather than inline JSX because it owns a hook —
 * `useLabelClipped` has to run per tile, and hooks cannot be called inside a
 * `map` callback.
 *
 * A TOOLTIP, by ruling, and not the tile growing on hover. The tile had been
 * revealing the rest of the name by getting taller, which meant a hovered tile
 *covered the row beneath it; a tooltip floats instead, so nothing in the
 * grid moves or is obscured by its neighbour.
 *
 * Screen readers are unaffected either way: the clipping is visual and the
 * full string stays in the DOM, so the button's accessible name has always
 * been the whole name. This is a sighted-pointer affordance.
 */
function LauncherTile({ app, onPick }: { app: LauncherApp; onPick: (id: string) => void }) {
  const { ref, isClipped } = useLabelClipped()

  return (
    <MaybeTooltip show={isClipped} content={app.label} placement="bottom">
    <button
        type="button"
        className="app-launcher__tile"
        /* NO `aria-current`, AND NO SELECTED STATE AT ALL. These tiles are
           links out to other applications; a grid of links has a hover and
           nothing else to say.

           It used to mark the app you were in. That turned out to be a claim
           this component cannot honestly make — it is handed ids and has no
           idea whether the one you are looking at is an application or a page
           inside one. In the demo those namespaces actually collide
           (`steamtrap` is both an app and a nav route), so opening an app lit
           its tile permanently the next time you opened the panel. */
        onClick={() => onPick(app.id)}
      >
        {/* THE BOX that actually draws, and the reason it exists rather than
            the button drawing itself.

            The button holds the grid cell at a fixed 72px so the row can never
            reflow. This box is absolutely positioned inside it and is free to
            be TALLER than that — it carries the padding, the radius and the
            hover wash, and it sizes to its own content. So when a hovered
            label grows to a second line the wash grows with it, and when the
            label fits on one line nothing moves at all.

            A background on the button could not do this: it is clipped to the
            button's box. A `::before` could not either — a pseudo-element
            cannot size itself to a sibling's content. */}
        <span className="app-launcher__box">
        {/* The icon SLOT. Always rendered, with or without `icon`, so an app
            awaiting its artwork holds the same square as one that has it and
            the grid does not reflow when a logo arrives. Empty, it is styled as
            a visible placeholder — see `:empty` in theme-overrides.css. */}
        <span className="app-launcher__glyph" aria-hidden="true">
          {app.icon}
        </span>
        {/* ONE LINE FOR EVERY NAME, ellipsised when it does not fit, with the
            whole name one hover away.

            This replaced a two-line clamp that branched on whether the name
            contained a space — wrap at the space when there was one, ellipsise
            on one line when there was not. Two lines fit more names whole (14
            of 18 against 9), and it cost a tile taller than it was wide, which
            made the grid heavy. One line plus the hover reveal is the trade.

            One rule for every name is also far less to be wrong about. An
            earlier version branched on whether the name contained a space, and
            was at one point literally wrong: a shell heredoc ate the backslash
            out of `/\s/` and left `/s/`, which tests for the LETTER s and
            quietly put "Benchmarks", "Insights" and "Emissions" on the wrong
            side. There is now no side to be on.

            Regular, not Medium. The ink is PRIMARY and inherited from the
            tile's own `--text-neutral-normal` — no colour is declared here, so
            there is nothing to disagree with it. */}
        <span ref={ref} className="app-launcher__label BodySmallRegular">
          {app.label}
        </span>
        </span>
      </button>
    </MaybeTooltip>
  )
}

/** One application in the launcher grid. */
export interface LauncherApp {
  id: string
  label: string
  /**
   * The mark, drawn inside a 40px round plate. A slot, not a component — the
   * shell has no icon set, so this is whatever the host already uses, and each
   * product's own brand mark is welcome here.
   *
   * OPTIONAL, AND THE SLOT STILL DRAWS WITHOUT IT. Leave it out and the tile
   * renders an empty container at the mark's exact size — a visible placeholder
   * to drop a logo into later, rather than a tile that collapses or falls back
   * to a generic glyph. The grid keeps its shape either way, so adding the real
   * artwork later changes nothing but the artwork.
   */
  icon?: ReactNode
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
 * The launcher's props, named and exported so a host can type a wrapper around
 * it. They were an anonymous inline literal, which left no name to import.
 */
export interface AppLauncherProps {
  apps: LauncherApp[]
  onSelect: (id: string) => void
  /**
   * Opens the App Center — where applications are added to this launcher,
   * taken out of it, and reordered. The launcher closes first, then calls this.
   *
   * Given it, the APPS TILE sits after the last app. Omitted, there is no tile.
   * Nothing is hidden either way: THE GRID SHOWS EVERY APP IT IS GIVEN and the
   * panel scrolls once there are more than fit. It briefly capped at 8 with the
   * tile as a ninth cell, which bought a fixed 3×3 at the cost of putting your
   * ninth app two clicks away — and now that this list IS your chosen quick-access
   * set rather than a whole catalogue, there is nothing to protect the panel from.
   */
  onManage?: () => void
  /** Names the dialog for assistive tech. The header itself is visually hidden. */
  label?: string
  /** The trigger. Popover CLONES this, so it must be the button itself. */
  children: ReactElement<Record<string, unknown>>
}

export function AppLauncher({
  apps,
  onSelect,
  onManage,
  label = 'Applications',
  children,
}: AppLauncherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  /**
   * WHAT GETS FOCUS WHEN THE PANEL OPENS. Popover's default is its ✕, which
   * this panel hides — and floating-ui cannot focus a `display: none` node, so
   * focus would fall to the dialog itself and the first Tab would leave the
   * grid. Aim at the first tile instead.
   *
   * RESOLVED AT READ TIME, not cached at mount.
   *
   * This used to be a callback ref that queried the first tile once and stored
   * the node, which broke while the reveal was a conditionally-mounted
   * tooltip: flipping that condition changed the element type at the tile's
   * position, React remounted the button, and the stored node was left
   * detached — so floating-ui focused something no longer in the document. The
   * ordering made it certain rather than occasional, since callback refs run
   * in the commit phase and schedule their state update before the focus
   * manager's effect.
   *
   * The reveal is pure CSS now, so nothing remounts and the old approach would
   * work again. This stays anyway: it cannot go stale by construction, where
   * the cached version was only correct as long as no tile ever remounted.
   * AppSideNav hit the same hazard with flyout focus and re-finds the node
   * after the fact (`closeFlyout`); resolving on read is that without the
   * timing guess.
   */
  const gridRef = useMemo(
    () => ({
      get current() {
        return panelRef.current?.querySelector<HTMLElement>('.app-launcher__tile') ?? null
      },
      // Never written to — floating-ui only reads. Present because RefObject is
      // typed with a mutable `current` and a getter-only object will not satisfy it.
      set current(_node: HTMLElement | null) {},
    }),
    [],
  )

  /**
   * CLOSE URGENTLY, NAVIGATE AFTERWARDS — and the `startTransition` is the
   * whole point of this function.
   *
   * Both of these used to run in one tick, which React batches into a single
   * commit. So the page swap — unmounting whatever the old route rendered,
   * mounting the new one, rebuilding the breadcrumb — was rendered BEFORE the
   * browser ever painted `data-status="close"`. The panel sat frozen for the
   * length of that work and then the 200ms `ds-popover-out` animation started
   * late or was skipped outright, which is the glitch.
   *
   * Marking the navigation as a transition makes the close the urgent update:
   * React commits and paints it first, and the route change renders after, as
   * interruptible work. The animation is `opacity` and `transform`, so once it
   * has started the compositor can carry it while the main thread builds the
   * page.
   */
  const pick = (id: string) => {
    setIsOpen(false)
    startTransition(() => onSelect(id))
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
        <div className="app-launcher" ref={panelRef}>
          {/* THE PANEL SCROLLS rather than capping the list. The viewport
              carries its own max-height — which is what `.ds-scroll__viewport`
              asks of every consumer, since it sets no overflow and no height
              itself — so this needs no definite height handed down from the
              popover above it.

              Deliberately cut mid-row: the height is four and a half tiles, so
              a fifth row is visibly sliced when there is one. A clean edge at
              four rows would look like the end of the list.

              `grid` + `gridcell` roles are NOT set: these are buttons in a
              two-dimensional arrangement, not a data grid, and claiming the
              role would promise arrow-key navigation the browser does not give
              a plain grid. Tab order follows the visual order, which for a
              3-column grid reads row by row — the same way the eye does. */}
          <ScrollArea
            axis="y"
            className="app-launcher__scroll"
            viewportClassName="app-launcher__scroll-viewport"
          >
          {apps.length === 0 ? (
            /* NOTHING IN THE LAUNCHER YET.
   
               fds's `EmptyState` is the WRONG component here and its own guard
               says so twice: that one is drawn for a REGION — a 90px
               illustration on a 20px gap ladder — and "inside a dropdown panel
               it is enormous". This panel is 248px wide. The guard's answer to
               "where is it? in a popover" is the popover-sized one, which is
               this: a 24px glyph, a title, a line, 16px padding.
   
               The name says DropdownMenu and this is a Popover. The element is
               standalone markup with no menu context behind it, and the two
               panels are the same size class, which is what the rule is about.
   
               WORDS FOR "NOTHING YET", which the guard separates from "nothing
               matched": say what this will hold and how to add the first one.
               So no "No results" — that is the other case, and it would send
               someone looking for a filter that is not there. */
            <DropdownMenuEmptyState
              icon={LayoutGrid}
              title="No applications yet"
              description="Add the ones you use most and they will appear here."
            />
          ) : (
          <div className="app-launcher__grid">
            {apps.map((app) => (
              <LauncherTile key={app.id} app={app} onPick={pick} />
            ))}
          </div>
          )}
          </ScrollArea>

          {/* THE FOOTER, outside the scroller and therefore pinned: the grid
              above it is the only thing that moves. `position: sticky` would do
              the same job with more ways to go wrong — it needs a scroll
              container to stick inside, and this control belongs to the PANEL,
              not to the list.

              It replaces a tile that used to sit last in the grid. A tile said
              it was one of the apps; it is not, it is where you go to choose
              which apps are here, and a full-width control at the foot is the
              shape that says so. It also stops the grid's last row changing
              shape depending on how many apps you have.

              `ghost`, so a row of brand marks stays the loudest thing in the
              panel — the footer is a way out, not the point of it.

              THE LABEL FOLLOWS THE JOB. With apps here the work is curation —
              adding, removing, reordering — and "Manage applications" is the
              plain name for that. With NOTHING here there is only one thing to
              do and nothing yet to manage, so it says "Add applications": the
              empty state above it says what is missing, and this says how to
              fix it, which is the pairing the EmptyState guard asks for.

              It read "Navigation settings" first, which named the wrong thing
              twice over — this window has nothing to do with the nav rail, and
              "settings" suggests preferences rather than a list of products you
              pick from. */}
          {onManage && (
            <div className="app-launcher__footer">
              <Button
                /* GHOST — no border, no fill — so a grid of brand marks stays
                   the loudest thing in the panel and the footer reads as a way
                   out rather than a call to action.

                   It was briefly the outlined `secondary`, on the argument that
                   the one control in the panel needs an edge to read as a
                   button. The divider above it does that job instead, which is
                   why the two came back together: a ghost button with no rule
                   would run into the grid, and an outlined button under a rule
                   draws the same line twice. */
                variant="ghost"
                tone="neutral"
                size="sm"
                isFullWidth
                label={apps.length === 0 ? 'Add applications' : 'Manage applications'}
                onClick={() => {
                  // Closed FIRST. Popover and Modal each own a focus trap, and
                  // opening the App Center from inside the open panel would put
                  // both on screen at once — the same ordering ProfileMenu
                  // follows when it opens the appearance modal.
                  //
                  // And the open is a TRANSITION, for the reason `pick`
                  // documents: mounting the App Center is a portal, a focus
                  // trap and twenty rows, and doing that in the same commit as
                  // the close means the panel never gets painted on its way
                  // out.
                  setIsOpen(false)
                  startTransition(() => onManage())
                }}
              />
            </div>
          )}
        </div>
      }
    >
      {children}
    </Popover>
  )
}
