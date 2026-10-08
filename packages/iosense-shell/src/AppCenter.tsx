import { useMemo, useState, type ReactNode } from 'react'
import { GripVertical } from 'lucide-react'
import { Button } from '@faclon-labs/fds/button'
import { EmptyState, NoSearchResultIllustration } from '@faclon-labs/fds/emptystate'
import { Modal, ModalBody, ModalHeader } from '@faclon-labs/fds/modal'
import { ScrollArea } from '@faclon-labs/fds/scrollarea'
import { SearchInput } from '@faclon-labs/design-sdk/SearchInput'

/**
 * What an app's button does, and the whole of the model.
 *
 * TWO ACTIONS, NOT THREE STATES. An earlier version carried
 * `available | connected | needs-reconnect`, a Connected/Disconnected tab pair
 * and a status badge per row. All of it is gone by decision: the shell has no
 * connection to lose, so a "disconnected" state was chrome describing a
 * condition nothing here can observe or repair. An app is in your list or it is
 * not, and the only two things you can do are put it in and take it out.
 */
export type ManagedAppAction = 'add' | 'remove'

/** One application in the catalogue. */
export interface ManagedApp {
  id: string
  name: string
  /** One line. The row clamps it rather than wrapping the card out of shape. */
  description: string
  /**
   * The mark. Optional, and the slot still draws without it — the same
   * contract `LauncherApp.icon` has, so a product without artwork yet shows a
   * placeholder of the right size instead of a hole.
   */
  icon?: ReactNode
  categoryId: string
  /**
   * Added, which here means IN THE LAUNCHER. One flag with two consequences:
   * the app moves into the "Your apps" section at the top of this window, and
   * it appears in the launcher outside. There is no separate "featured"
   * concept — there was, as a static `isFeatured`, and two ways to be promoted
   * meant an app could be one and not the other with nothing to say which won.
   *
   * Omitted means not added, so a host offering a catalogue of things nobody
   * has taken yet writes no flag on any of them.
   */
  isAdded?: boolean
}

export interface AppCategory {
  id: string
  label: string
}

export interface AppCenterProps {
  isOpen: boolean
  onDismiss: () => void
  /**
   * The whole catalogue, IN ORDER. Array order is the launcher's order — the
   * added ones appear at the top of this window, and in the launcher outside,
   * in the order they sit here. There is no `order` field to keep in step.
   */
  apps: ManagedApp[]
  /** Groups the not-yet-added apps into sections. No longer a filter control. */
  categories: AppCategory[]
  /**
   * Fired by an app's action button.
   *
   * `action` is what the press MEANT — `'add'` from a row that was not in the
   * list, `'remove'` from one that was — so the host acts on what the user saw
   * rather than re-reading a flag that may have changed underneath it.
   */
  onAppAction: (id: string, action: ManagedAppAction) => void
  /**
   * Fired when the launcher set is rearranged, with the COMPLETE new order of the
   * added apps' ids — not a from/to pair. The host applies it verbatim, so it
   * never has to reconstruct an index against a list it may have changed.
   *
   * OMIT IT AND NOTHING IS DRAGGABLE: no handles, no drop targets, no keyboard
   * move. A host that cannot persist an order should not offer one, because a
   * rearrangement that silently snaps back is worse than a fixed list.
   */
  onReorder?: (orderedIds: string[]) => void
  title?: string
  /**
   * The line under the title. Says what the window is FOR, which the title
   * alone does not — "App Center" names it without explaining it.
   *
   * There is no `logo` prop any more. The brand mark sat beside the title and
   * was removed by ruling: in a window whose whole content is other products'
   * marks, one more at the top competed with them rather than framing them,
   * and the dialog already says whose it is by being inside the product.
   */
  subtitle?: string
}

/**
 * The App Center: the window where applications are added to the launcher,
 * taken out of it, and put in the order you want them. Opened from the
 * launcher's footer.
 *
 * THE TOP SECTION IS THE POINT OF THE WINDOW. It is not a curated "featured"
 * shelf chosen by whoever wrote the catalogue — it is YOUR set ("Your apps"),
 * it is exactly what the launcher shows outside, and it is the thing you
 * reorder. Everything below it is the catalogue you draw from, grouped by
 * category.
 *
 * WHAT SHIPS AND WHAT DOES NOT. The window, the search, the row and the
 * rearranging are chrome and live here. WHICH applications exist, what they do,
 * and what adding or reordering one actually persists are the host's — `apps`
 * is a prop and both callbacks hand the press straight back. Nothing here
 * mutates the array it is given; a row redraws when the host sends a new one.
 *
 * ONE FILTER, DOWN FROM FOUR. The search box. A Connected/Disconnected tab
 * pair went with the status model, a "Works with" capability chip row went
 * after it, and the category rail went last — it filtered a list of twenty that
 * the search already reaches, while costing a permanent column of the window.
 * The categories remain as the HEADINGS they always were.
 *
 * STATE DIES WITH THE DIALOG, deliberately. Modal unmounts while closed, so the
 * query resets every time it opens. The ORDER does not — that lives in `apps`,
 * with the host, which is the whole point of it being a prop.
 */
export function AppCenter({
  isOpen,
  onDismiss,
  apps,
  categories,
  onAppAction,
  onReorder,
  title = 'App Center',
  subtitle = 'Add the tools your team already uses.',
}: AppCenterProps) {
  const [query, setQuery] = useState('')

  /** The row being carried. Pointer only; the keyboard route never sets it. */
  const [dragId, setDragId] = useState<string | null>(null)

  /**
   * THE ORDER AS IT WOULD BE IF YOU LET GO NOW — live, while a drag is in
   * flight, and `null` the rest of the time.
   *
   * This is what makes a drag read as MOVING rather than REPLACING. Marking
   * the row under the pointer, however it is drawn, says "this one is the
   * target" — the vocabulary of dropping a file onto a folder. What a reorder
   * has to show is the consequence: the other apps stepping up or down to open
   * the place this one will take. So the list re-renders in the would-be order
   * on every `dragover`, and the drop merely commits what you can already see.
   *
   * Local, not a call to `onReorder` per `dragover`: the host would get dozens
   * of writes per drag, each one a round trip in a real app.
   */
  const [previewIds, setPreviewIds] = useState<string[] | null>(null)

  /**
   * Moves `id` to sit at `targetId`'s index. A MOVE, not a swap: the ids
   * between the two close up behind it and shift by one, which is exactly the
   * behaviour the live preview exists to make visible.
   */
  const reorderIds = (ids: string[], id: string, targetId: string) => {
    const from = ids.indexOf(id)
    const to = ids.indexOf(targetId)
    if (from < 0 || to < 0 || from === to) return ids
    const next = [...ids]
    next.splice(to, 0, next.splice(from, 1)[0])
    return next
  }

  const q = query.trim().toLowerCase()
  const isSearching = q.length > 0

  const hits = (app: ManagedApp) =>
    !q || app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)

  const quick = useMemo(() => apps.filter((a) => a.isAdded), [apps])

  /**
   * What the rows actually render from: the preview while dragging, the real
   * order otherwise. Filtered last, though reordering is off while searching,
   * so in practice the two never overlap.
   */
  const quickShown = useMemo(() => {
    if (!previewIds) return quick.filter(hits)
    const byId = new Map(quick.map((a) => [a.id, a]))
    return previewIds.map((id) => byId.get(id)).filter((a): a is ManagedApp => Boolean(a))
  }, [quick, q, previewIds])

  /**
   * Everything not in the launcher, by category — and only categories with a
   * match, so filtering never leaves a run of empty headings. An added app
   * appears ONLY at the top: listing it twice would give one app two buttons.
   */
  const sections = useMemo(
    () =>
      categories
        .map((c) => ({
          id: c.id,
          label: c.label,
          apps: apps.filter((a) => !a.isAdded && a.categoryId === c.id && hits(a)),
        }))
        .filter((s) => s.apps.length > 0),
    [apps, categories, q],
  )

  const hasResults = quickShown.length > 0 || sections.length > 0

  /**
   * REARRANGING IS OFF WHILE SEARCHING, and this is the one rule worth stating
   * out loud. A filtered list hides rows; dropping an item "after the second
   * one you can see" has no single honest meaning when there are three you
   * cannot. Rather than guess, the handles disappear until the query is clear.
   */
  const canReorder = Boolean(onReorder) && !isSearching

  /** Ends the drag, committing the preview if there is one. */
  const endDrag = (commit: boolean) => {
    if (commit && previewIds && onReorder) {
      const before = quick.map((a) => a.id).join()
      // Only when something actually moved — a drag that returns where it
      // started should not write, and should not mark the host dirty.
      if (previewIds.join() !== before) onReorder(previewIds)
    }
    setDragId(null)
    setPreviewIds(null)
  }

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      /**
       * ESCAPE IS SHARED, and this is the guard fds's own Modal rules ask for.
       * The dialog checks Escape on its panel, so a press meant for the search
       * field would close the whole window — losing a half-typed query to a key
       * the user pressed to clear it. First Escape clears, second dismisses.
       */
      onDismiss={() => {
        if (query) {
          setQuery('')
          return
        }
        onDismiss()
      }}
    >
      {/* TITLE AND SUBTITLE, NO MARK. The brand mark sat in `leading` and is
          gone by ruling — in a window whose whole content is other products'
          marks, one more at the top competed with them rather than framing
          them, and the dialog already says whose it is by being inside the
          product.

          The `logo` prop went with it rather than being left unpassed — a
          prop nothing reads is worse than no prop. */}
      <ModalHeader title={title} subtitle={subtitle} />

      {/* `isPadded={false}` because the pane owns its own padding AND its own
          scrolling. ModalBody scrolls its whole content as one, which would
          carry the search bar away with the list. */}
      <ModalBody isPadded={false}>
        {/* A single column now that the category rail is gone. It was a grid of
            [rail | list]; one pane needs no grid, and the rail's fixed column
            was costing a quarter of the window to filter twenty apps the search
            already reaches. */}
        <div className="app-center">
          <div className="app-center__search">
            <SearchInput
              accessibilityLabel="Search applications"
              placeholder="Search applications…"
              inputValue={query}
              onInputChange={setQuery}
              /* It filters the list below it, so there is no suggestions
                 popover to open — the field's own docs name this exact case,
                 and a dropdown over the results would cover the answer. */
              showDropdown={false}
              showClearButton
              onClearButtonClicked={() => setQuery('')}
              size="Medium"
            />
          </div>

          <ScrollArea axis="y" className="app-center__list" viewportClassName="app-center__list-scroll">
            {!hasResults ? (
              /* THE EMPTY STATE, and it is fds's own component rather than a
                 line of grey text.

                 `NoSearchResultIllustration` because the guard ties the picture
                 to the REASON the region is empty, and a filter that matched
                 nothing is the one case it names at High confidence. Never a
                 "no data" drawing here: the two say opposite things, and that
                 one would claim the catalogue is empty when the truth is the
                 query is too narrow.

                 `Medium` (the default, a 90px drawing) because this is a region
                 inside a dialog, not a whole page. `Large` is reserved for a
                 page — and a size passed to the illustration itself would be
                 ignored anyway, since inside `asset` the tier owns the box. */
              <div className="app-center__empty">
                <EmptyState
                  asset={<NoSearchResultIllustration />}
                  title="No applications found"
                  description={
                    isSearching
                      ? 'Nothing matches what you typed. Try another word, or clear the search to see the whole catalogue.'
                      : 'There are no applications to show here yet.'
                  }
                >
                  {/* No margins on the action: the actions slot is a 16px
                      column that spaces its own children, and the guard records
                      that hand-written margins here are how spacing drifts. */}
                  {isSearching && (
                    <Button
                      variant="primary"
                      tone="neutral"
                      size="sm"
                      label="Clear search"
                      onClick={() => setQuery('')}
                    />
                  )}
                </EmptyState>
              </div>
            ) : (
              <>
                {/* THE LAUNCHER SET. Always rendered when not searching, even with
                    nothing in it — an empty section with a line of explanation
                    is what tells you the launcher is fed from here. Hidden
                    while searching only if nothing in it matches, because then
                    it is just a heading over nothing. */}
                {(!isSearching || quickShown.length > 0) && (
                  <section className="app-center__section">
                    {/* THE THIRD NAME THIS SECTION HAS HAD, and the plainest.
                        "Quick access" named a category of thing rather than
                        saying anything about these apps. "In your launcher"
                        said where they go but leaned on a word THE READER HAS
                        NEVER SEEN — nothing in the interface is labelled
                        "launcher"; that is our word for it in the code.

                        "Your apps" is two common words, and the possessive does
                        the separating: everything below is headed by a category
                        name, so there is no second list of "apps" to confuse it
                        with. The WHERE moved into the note, which is what a
                        note is for. */}
                    <h3 className="app-center__section-title BodyLargeMedium">Your apps</h3>
                    <p className="app-center__section-note BodySmallRegular">
                      {/* Says where, in words from the interface rather than
                          from us: the top-bar button that opens the grid is
                          labelled "Applications", so that is what it is called
                          here too. Keeping this sentence is also what stops
                          "Remove" reading as delete or uninstall.

                          The fallback drops the verb as well as the
                          instruction: with no `onReorder`, or while a search
                          is narrowing the list, you cannot SET anything, so
                          promising that you can would be a lie in the one
                          sentence meant to explain the section. */}
                      {canReorder
                        ? 'Set the order apps appear in the Applications menu. Drag and drop to rearrange.'
                        : 'The order apps appear in the Applications menu.'}
                    </p>

                    {quickShown.length === 0 ? (
                      <p className="app-center__section-note BodySmallRegular">
                        Nothing here yet — add an application from the list below and it
                        will show in the Applications menu.
                      </p>
                    ) : (
                      <div className="app-center__rows">
                        {quickShown.map((app) => (
                          <div
                            key={app.id}
                            className="app-center__row app-center__row--quick"
                            /* The ROW is the drag source and the drop target,
                               not the handle: a 16px handle is a cruel thing to
                               aim at, and HTML5 drag needs `draggable` on the
                               element that moves. The handle below is the
                               AFFORDANCE — it says the row moves — and the
                               keyboard route. */
                            draggable={canReorder}
                            data-dragging={dragId === app.id ? 'true' : undefined}
                            onDragStart={(e) => {
                              if (!canReorder) return
                              setDragId(app.id)
                              // The preview starts as the order you can see, so
                              // the first dragover has something to move within.
                              setPreviewIds(quick.map((a) => a.id))
                              e.dataTransfer.effectAllowed = 'move'
                              // Firefox starts no drag at all without payload.
                              e.dataTransfer.setData('text/plain', app.id)
                            }}
                            onDragOver={(e) => {
                              if (!canReorder || !dragId) return
                              // Without preventDefault the browser refuses the
                              // drop — the default for most elements is "not a
                              // drop target", and there is no onDrop at all.
                              e.preventDefault()
                              e.dataTransfer.dropEffect = 'move'
                              if (app.id === dragId) return
                              // THE LIST SHIFTS UNDER THE POINTER. Rebuilt from
                              // the previous preview rather than from `quick`,
                              // so a drag across several rows accumulates
                              // instead of each move starting over.
                              setPreviewIds((prev) =>
                                prev ? reorderIds(prev, dragId, app.id) : prev,
                              )
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              endDrag(true)
                            }}
                            /* Fires after drop, and ALSO on a cancelled drag —
                               Escape, or a release outside the list. Committing
                               here too is what makes a drop anywhere safe:
                               `endDrag` writes only if the order actually
                               changed, so the second call is a no-op. */
                            onDragEnd={() => endDrag(true)}
                          >
                            {canReorder && (
                              /* BESIDE THE MARK, in its own cell — user ruling
                                 2026-10-08, after a version that stacked the
                                 two in one box. Stacking saved 28px of row
                                 width but swapped the app's identity for a grey
                                 grip the moment you hovered, which is a poor
                                 trade on the one surface where the marks are
                                 how you find anything.

                                 A SPAN, NOT A BUTTON, and `aria-hidden`. It was
                                 a real button carrying the keyboard route —
                                 arrow keys moved the row one place. That route
                                 was removed by ruling, and a focusable button
                                 with nothing behind it is worse than no button:
                                 a tab stop that answers no key and no click,
                                 announced to a screen reader as an action you
                                 cannot take. With the behaviour gone the
                                 element is pure affordance, so it is marked as
                                 decoration and taken out of both the tab order
                                 and the accessibility tree.

                                 REORDERING IS NOW POINTER-ONLY — the row's
                                 `draggable` is the only route there is. */
                              <span className="app-center__drag" aria-hidden="true">
                                <GripVertical size={16} />
                              </span>
                            )}
                            <span className="app-center__row-glyph" aria-hidden="true">
                              {app.icon}
                            </span>
                            <span className="app-center__row-text">
                              <span className="app-center__row-name BodyMediumRegular">
                                {app.name}
                              </span>
                              <span className="app-center__row-description BodySmallRegular">
                                {app.description}
                              </span>
                            </span>
                            <Button
                              variant="secondary"
                              tone="neutral"
                              size="sm"
                              label="Remove"
                              aria-label={`Remove ${app.name}`}
                              onClick={() => onAppAction(app.id, 'remove')}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* THE CATALOGUE, by category. Headings only — the rail that
                    used to filter by these is gone. */}
                {sections.map((section) => (
                  <section key={section.id} className="app-center__section">
                    <h3 className="app-center__section-title BodyLargeMedium">{section.label}</h3>
                    <div className="app-center__rows">
                      {section.apps.map((app) => (
                        <div key={app.id} className="app-center__row">
                          <span className="app-center__row-glyph" aria-hidden="true">
                            {app.icon}
                          </span>
                          <span className="app-center__row-text">
                            <span className="app-center__row-name BodyMediumMedium">
                              {app.name}
                            </span>
                            <span className="app-center__row-description BodySmallRegular">
                              {app.description}
                            </span>
                          </span>
                          {/* NEUTRAL, like Remove. Button's own guard resolves
                              this collision outright: a REPEATED ROW ACTION
                              defaults to neutral, and a tone is for meaning,
                              not for marking every row in a list. */}
                          <Button
                            variant="secondary"
                            tone="neutral"
                            size="sm"
                            label="Add"
                            aria-label={`Add ${app.name}`}
                            onClick={() => onAppAction(app.id, 'add')}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </>
            )}
          </ScrollArea>
        </div>
      </ModalBody>
    </Modal>
  )
}
