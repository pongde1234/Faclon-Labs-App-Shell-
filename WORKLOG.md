# Worklog

**What this file is.** A running record of every change made to this repo
outside its commit history — what changed, and *why*, while it is still
uncommitted and still being argued about. It lives in the repo rather than in
anyone's notes precisely so it merges with the code: the reasoning arrives in
the same pull request as the diff it explains.

**How it is kept.** Append to *Done* as each change lands. Move things out of
*Next* rather than deleting them. When a batch is committed, fold its entries
into the commit message and strike them from here — a worklog that still lists
things the history already explains is two sources of truth.

**The one rule.** Say why, not just what. `git diff` already says what.

---

## The direction

The committed history deliberately emptied this repo's demo — `1c4028c` "Strip
the demo to the chrome", `c922abf` "No rows anywhere: the demo is the bare
chrome", `ff10347` "Empty the content container". **That is being reversed.**
The demo is being filled in so the chrome can actually be looked at.

What is *not* being reversed is the line the emptying was protecting: content
lives in `demo/`, and the packages still export none of it. A package that
shipped these rows would put Zomato and Steam Trap into every install that
forgot to pass its own. Fill the demo; do not fill the package.

---

## Done — uncommitted as of 2026-10-06

### The iosense demo has its nav back

Recovered from `1c4028c^`, where it was deleted.

| File | |
|---|---|
| `demo/iosenseNav.tsx` | new — the product's 22 rows: Home, Finance, Opportunities, Agents Lab, Voice; the Workflows and Reports accordions; the Connect section. Plus `IOSENSE_SECTION_DEFAULT` and `IOSENSE_RECORD_PARENT` |
| `demo/IosenseDemo.tsx` | wired it up — `PAGE_TITLES`, `buildTrail` breadcrumbs, `resolveSection` routing, the Help footer row, the Assistant and Applications buttons |
| `demo/AiGradientDefs.tsx`, `demo/demo.css` | new — the assistant glyph's gradient, mounted **outside** the shell in `main.tsx` because every direct child of the content container takes the 16px gap, even one that draws nothing |

**Two things deliberately not restored verbatim:**

1. **Notifications are a count, not a list.** The panel was removed from the
   package later, in `f685988` — `useNotifications`, `AppNotification` and the
   `notifications` prop no longer exist. The bell takes `unreadCount` and hands
   the click back. Restoring the old 11-item list means reviving the panel in
   the package first. *Open question — see Next.*
2. **The profile stays a placeholder.** The old `demo/sampleData.ts` held a real
   person with a working email and phone number, and the repo's own history
   removed it for that reason. Ada Byron stands in. *Open question — see Next.*

### The Overview dashboard

`demo/OverviewPage.tsx` — new, built to match a screenshot the user supplied:
the Overview heading, four stat cards, the Energy use `LineChart`, the
dismissible chillers `Alert`, and Recent alerts. Other nav rows render
`PlaceholderPage` rather than pretending the Overview dashboard is the Devices
page.

Every surface is an SDK component; `demo.css` adds layout and type only, and no
margins — the 16px rhythm stays the content container's.

**This required an install.** `highcharts` and `highcharts-react-official` are
declared peer dependencies of design-sdk and were never installed, so Vite was
resolving the chart's import to a `__vite-optional-peer-dep` stub that throws at
runtime. Added as devDependencies (12.6.2 / 3.2.3) in `package.json`.

### A demo of the react-only package

`demo/appShellNav.tsx`, `demo/AppShellDemo.tsx`, `demo/appshell-main.tsx`,
`demo/appshell.html` — new. A filled-in demo of `@faclon-labs/app-shell` at
`/appshell.html`, exercising every row shape: an unlabelled section, three
levels of nesting (the cap), a pure expand toggle with no `href`, badges as both
a number and a node, a collapsed-rail tooltip, descriptions at depth 2–3 only.

Its own page rather than a route inside the iosense demo: this package's whole
claim is that it has no design system underneath, and sharing a page with
design-sdk's global stylesheet would let the SDK's tokens answer for it.

**Built on a misreading** — "serve the appshell" meant the iosense demo. Kept
because it is a working demo of a real package, but it was not what was asked
for. *Open question — see Next.*

### Docs that had become false

The repo asserted in eight places that no nav rows exist anywhere in it. True at
`HEAD`, not true now. Corrected in `README.md`, `STORY.md`,
`packages/iosense-shell/README.md`, `src/index.ts`, `src/navItems.ts`,
`guards/index.json`, `guards/NavItems.guard.json` and
`stories/Shell.stories.tsx` — each now says the package exports no nav while the
demo fills its rail from `demo/iosenseNav.tsx`, which is the arrangement that
actually holds.

### The rail, rebuilt in normal flow

A row was three absolutely-positioned boxes, with the icon's width hard-coded
into the label's `left`. It is one flex line now, the 8px stated once as a `gap`
instead of as arithmetic in another rule — and RTL comes free, since the SDK's
mirrored copies of those rules are inert under static positioning.

Three things this forced, each of which would have broken something:

- the icon keeps `position: relative` — the collapsed dot is an `::after` on it
  and needs it as a containing block;
- `min-width: 0` on the label, or a flex item refuses to shrink below its
  content and `text-overflow: ellipsis` never fires;
- collapsed, the label and badge go to `max-width: 0` rather than
  `display: none`, so the SDK's opacity transition still runs on a peek.

The **section header** got the same treatment. The SDK stacks its name and its
collapsed hairline on top of each other (one absolute, one in flow); both are
flex items now, each taking zero width in the state that is not its own. That
retired a `pointer-events: none` hack whose only job was to stop the hairline
eating clicks through the label.

**Sections no longer fold.** The label was a disclosure button; folding only
ever hid rows the user still had to reach, and the control had to be
force-disabled in the 48px strip anyway. Accordions still fold — their parent
row stays on screen, so nothing becomes unreachable.

**Hover no longer opens the rail**, and neither does clicking it. The peek is
keyboard-only now, gated on `:focus-visible` so a pointer press on a row does
not expand the panel. The toggle and Ctrl/Cmd+B are the only deliberate routes.

### Two construction bugs found by reading the DOM

- **`--shell-nav-icon-size` was the other package's token.** The rail's icon
  clamp read it with a `14px` fallback; `@faclon-labs/app-shell` defines it as
  **24px**. Nothing loads both stylesheets today, so the fallback quietly did
  the work — and the moment anything did, every glyph would have jumped and the
  icon column would have broken. Now a local `--app-nav-icon-size`.
- **Collapsed rows had no accessible name.** The SDK hides the label and badge
  with `visibility: hidden`, which removes them from the accessibility tree, and
  the icon is an unlabelled `<svg>` — so a screen reader read "button". The
  tooltip does not rescue it: fds wires `aria-describedby`, a description, which
  cannot stand in for a name. Both the row and the accordion parent now set
  `aria-label` while collapsed only.

### Tokens: fds for type and spacing, the SDK for what it owns

Every spacing value in the shell and the demo is on fds's value-named ramp
(`--spacing-0/2/4/…`), including the ones that were raw `px` inside local custom
properties. Where fds has no step the value is **composed** rather than rounded —
`calc(var(--spacing-12) + var(--spacing-2))` for the 14px glyph, so the measured
number survives while every term comes from fds.

The SDK's own ramp is **aliased** at `:root` (`--spacing-01: var(--spacing-2)`,
…). Its compiled stylesheet names those tokens 551 times and ships prebuilt, so
this is the only way to put those rules on fds values without restating them.

Type is the system's **named styles** rather than tokens mixed by hand:
`BodyLargeMedium` on an entity row, `BodyLargeRegular` on a nested one,
`BodyXSmallMedium` on a section caption. The rail declares no type of its own.
One wart: `SideNavBarMenuButton` types `label` as `string` while rendering it as
a child, so a single documented cast in `styledLabel` puts the class on the
label span — the only element where nothing outranks it.

### Component defaults restored

A sweep put library components back on their own values: the notifications
footer divider, the rail's two separators, the scrollbar thumb, and the chart /
list-card borders — the last of which had been given one shared colour when the
two components never had the same default.

It also fixed a **self-referential custom property** an earlier blanket `sed`
had created: `--border-neutral-default: var(--border-neutral-default)`. A cyclic
custom property computes to the guaranteed-invalid value, which unsets every
declaration reading it — so in dark and brand the content sheet's edge, the card
borders, the rail's hairline and the footer rule were all broken at once. The
line exists because design-sdk and fds **disagree** on that token and design-sdk
wins on specificity with a near-white `#D5D6D7`; pointing it at
`--border-gray-subtle` is what lets fds's own `#3B3D40` through.

### Classic uses dark's chrome

The brand theme had its own palette — a `#050505` ground, white-alpha washes, a
`#D5D6D7` text ramp, each value separately measured. Two palettes meant two sets
of contrast decisions to keep in step. One block now holds design-sdk's and
fds's own **dark** values verbatim, covering the rail and the top bar together.
Classic and Dark differ only in where the treatment applies: Classic keeps the
sheet, cards and charts light.

### The top bar is three containers

`TopNavContent` (toggle + trail), `.app-topbar__assistant`, `.app-topbar__icons`
— two elements rather than one row because a flex row has exactly one `gap`, and
the assistant sits flush (`--spacing-0`) against icons that are 6px apart.

That needed a new `assistant` slot on `AppTopBar` and `IosenseShell`: the host
was passing the assistant and the launcher as one `actions` node, and the shell
cannot split a `ReactNode`. **`actions` now means icons only**, and anything
added there lands in the icon container automatically.

The assistant is a labelled ghost **Bruce** button; the launcher is lucide's
`Grip`. **A top-bar icon shows hover and nothing else** — it does not stay lit
while its panel is open. An `[aria-expanded='true']` rule did exactly that for a
while; removed on the user's ruling (2026-10-08) after they saw it and asked for
hover only. There is now no declaration at all, which leaves IconButton's own
ladder — muted at rest, subtle on hover, `isHighlighted`'s square on hover and
keyboard focus. Do not re-add the rule.

One consequence to know if it is ever revisited: Popover injects `aria-expanded`
on the cloned trigger itself (its guard forbids overriding it), so an open
launcher is announced as "expanded" while looking identical to a closed one. The
attribute is still right; only the paint is gone.

### The application launcher

`AppLauncher` (new, exported) is the panel: a 3-column grid in a Popover, with
the current app marked by `aria-current`. **Its CSS already existed** —
a complete orphaned `.app-launcher` block from the first commit, with no
component ever written against it — so this was built to the contract the
stylesheet already described.

**It caps at 8 apps**, with the ninth cell always the **Apps** tile: 8 + 1 is
a 3×3 square, so the panel keeps one shape whether the host has nine
applications or ninety. **Without `onManage` nothing is capped** — the Apps
tile is the only route to an app the grid left out, so hiding apps behind a door
that does not exist would strand them. The cap and that tile stand or fall
together, which is why the separate "More" tile (and its `onShowAll` prop) went:
the overflow route and the manage route turned out to be the same door.

Tiles are **72 wide × 88 tall** — square at 72 until a wrapped name showed why
not (see below). The WIDTH was 95.34px — a number nobody chose, just a third of a 320px
panel divided by `1fr`. The columns are now a fixed 72px and **the panel is
computed from the tile** (`3 tiles + 2 gaps + 2 paddings = 248px`) via a local
`--app-launcher-tile`, so the two cannot drift: set them independently and a
change to either leaves slack the other does not know about. 72 is spelled
`calc(var(--spacing-64) + var(--spacing-8))` because fds's ramp is value-named
and has no `--spacing-72`.

A long name **WRAPS, NEVER TRUNCATES** — the name is the only thing
identifying a tile, and "Microsoft Te…" is unusable where "Microsoft / Teams"
is not, so the box grows to fit the words rather than the words being cut to
fit the box. Three lines are still clamped away.

That is why the tile stopped being square. At 72 a two-line name filled it to
the exact pixel (8+32+4+36 = 72): nothing clipped, but the text touched both
edges and a descender sat on the hover square's boundary, which reads as
overflow. 88 tall gives the wrap 8px above and below.

**A uniform 8px inset, sides included.** Side padding was zero, argued on the
grounds that the grid gap already separates one tile from the next and the
label needs every pixel. True about the gap, wrong about the label: with
nothing at the sides a name ran edge to edge into the hover wash, which looks
like text escaping its box. It costs width and the cost IS the point — 56px of
label instead of 72 is what makes a long name wrap and, past two lines,
truncate (`-webkit-line-clamp: 2`, which puts an ellipsis at the end of line
two).

**How a name is shortened depends on whether it has a space** — a decision CSS
cannot make, so AppLauncher sets a modifier from `/s/.test(label)`.

- **One word** ("Maintenance", "Benchmarks") gets ONE line and an ellipsis.
  It has nowhere to wrap, so the alternatives were splitting it mid-word onto
  a second line or letting it overrun and be clipped with nothing to show for
  it. "Maintenan…" is the honest shortening: it says the name was cut, and it
  usually withholds two or three letters, which is enough to still recognise
  the app. `display: block` is load-bearing in that rule — it overrides the
  `-webkit-box` above, and `text-overflow: ellipsis` does nothing inside one.
- **Two or more words** ("Microsoft Teams") wrap at the space and clamp at two
  lines. Breaking at a space costs nothing, so the full name should be read
  whenever it can be.

Of the catalogue, only Benchmarks and Maintenance are long enough to ellipsise,
and no multi-word name has a FIRST word too long for a line — the one case
this does not cover, since nothing breaks words any more.

**TWO LINES, IN A 72px SQUARE — the shape settled here after one line and
after an 88px two-line tile.** The constraint the user set was all three at
once: two lines, padding on every side, and no change to the tile size. That
is fixed arithmetic, not taste:

    pad + glyph + 4 gap + 36 label + pad = 72

which leaves four legal splits on fds's ramp — 8/16, 6/20, 4/24, 2/28. 8px of
padding would make the mark 16px, smaller than the glyphs inside it, so
**4px padding and a 24px mark** is the balance point. The label gets 64px.

**TWO LINES AT REST, IN AN 84px SQUARE, 8px APART** — and the reasoning
reversed on one observation from the user: *most real product names run to two
lines.* Every size argument before this was anchored on the eleven demo names,
where most fit a single line. With multi-word names the norm, one line at rest
leaves most tiles ellipsised and unidentifiable without a hover, which defeats
the grid.

    8 pad + 28 glyph + 4 gap + 36 label + 8 pad = 84

**The size was derived from the LABEL WIDTH it produces**, not picked. 84 minus
16 of padding leaves 68px, and 68 is where nothing in a realistic twenty-name
spread truncates at two lines. 88 would keep the 32px mark, but its extra 4px
of label changes no outcome — nothing truncates at 68 either — so it buys a
heavier grid and a 296px panel for nothing. 80 was the other candidate and its
64px label still cuts "Maintenance", the exact case this is meant to remove.
The mark goes 32 to 28, the cheaper side of that trade.

**The grid gap doubled, 4 to 8.** At 4 the tiles nearly touched and the grid
read as one block rather than a set of things to pick from. 8 matches the
tile's own inner padding, so one rhythm runs through the panel: content 8 from
its tile edge, tiles 8 apart. Panel 248 to 292px, against fds's 328 cap.

**Clamp 2 at rest, 3 on hover.** The reveal is unchanged and now almost never
fires, which is correct rather than a regression — a safety net for a name
longer than anything currently shipped, not something the grid depends on.

    one-line name, rest     66  -> held at 84 by min-height
    two-line name, rest     84  -> exactly the cell, no spill
    three-line name, hover 102  -> grows 18px, the only overlapping case

**TWO BUGS HERE WERE REPORTED AS DONE WHEN THEY WERE NOT**, and the failure is
worth recording. Two string replacements missed silently in scripts whose only
check afterwards was `tsc` — which passes whether a CSS value changed or not.

- The box gap stayed at 6 instead of 4, so a two-line label computed to 86 in
  an 84 cell and spilled 2px into the row gap. One-line names were fine at 66,
  which made it look selective rather than systematic.
- Neither clamp was applied: the label was still 1 at rest lifting to 2, so a
  two-line name was clamped to one line and then expanded on hover. That is
  exactly the "even a one-liner pushes into the other div" that was reported.

Both set by line number and verified by reading the values back. The lesson is
the check, not the edit: a CSS value change needs the value re-read, because a
typecheck cannot see it.

**ONLY A TRUNCATED TILE GROWS.** The first attempt at the in-place reveal
pinned the label at one line and swapped it to a fixed two-line height on
hover, so EVERY tile jumped — including the ones with nothing hidden. The
height is now never set: the clamp goes from 1 to 2 and the box takes what the
CONTENT needs, which for a name that already fitted is still one line.

**The button reserves the cell; a box inside it draws.** The button stays a
fixed 72px so the grid row can never reflow and shove neighbours under the
pointer. `.app-launcher__box` is absolutely positioned inside it
(`top/left/right` pinned, height left alone, `min-height: 100%`) so it sizes to
its own content and grows downward — carrying the padding, the radius and the
wash with it. Neither a background on the button nor a `::before` could do
that: the first is clipped to the button, and a pseudo-element cannot size
itself to a sibling's content.

**(Superseded) FINAL SHAPE: one line at rest, the whole name revealed IN THE TILE on hover
— no tooltip.** Google's launcher pattern, chosen by ruling over the tooltip.

The budget is exact and one line is what makes it comfortable:

    8 pad + 32 glyph + 6 gap + 18 line + 8 pad = 72

All five on fds's ramp, an even 8px inset on every side, the 32px mark back
and the 12px label back. Two lines AT REST cost 36 instead of 18, which left
8px for both paddings and forced either a 16px mark or a 10px label — that is
what made the tile read top-heavy and then made the type too small. Taking
the second line out of the resting state paid for both.

**The growth does not reflow the grid**, which is the part worth keeping. A
taller tile would push its row down and shove neighbours around under the
pointer. Instead the tile keeps its 72px box, the second line OVERFLOWS it,
and `::before` — the hover wash, drawn behind — stretches down by exactly one
line to cover it. `z-index: 1` on hover lets both paint over the row beneath.
The wash had to move off the element and onto `::before` for this: a background
on the element is clipped to the element and cannot extend.

**It deleted the whole measuring apparatus.** No `useLabelClipped`, no
ResizeObserver, no `document.fonts.ready` re-measure, no `MaybeTooltip` —
the browser already knows whether a line fits and does not need to be asked.
It also removed the conditional mount that was remounting tiles and detaching
the node `initialFocusRef` had captured; the lazy ref stays anyway, since it
cannot go stale by construction.

`:focus-visible` gets the same reveal as `:hover`, so the keyboard is not left
with the shortened name — the one thing a hover-only affordance would cost.

**(Superseded) Then the padding read as uneven, and the fix was a type step.** At
`.BodySmallRegular` (12/18) two lines cost 36 of the 72, leaving 8px of slack
for BOTH paddings — so the mark sat 4px from the top while being 24px from
either side, and the tile looked top-heavy. Every split that reaches 8px
padding at that size gives a 16px mark, which is smaller than the glyphs drawn
inside it.

Dropping the label to `.BodyXSmallRegular` (10/14) makes two lines cost 28, and
8 + 24 + 4 + 28 + 8 = 72 exactly: a true 8px inset with the mark still 24px.
The cost is a 10px label, which is small — if that reads badly, the honest
alternatives are a bigger tile or back to 4px vertical.

Worth being clear about what cannot be fixed: the SIDE gap stays 24px, because
a 24px mark centred in a 72px tile cannot be 8px from the sides. Padding is
the inset of the content box and that is now even; the mark being narrower
than the tile is a separate thing.

**The label has an EXPLICIT two-line height**, and that is what makes centring
safe. The tile centres its contents now, so every label box has to be the same
height — otherwise a one-line tile centres a shorter stack and drops its mark
below its neighbours', leaving the row of glyphs ragged. That is exactly why
the 88px version was top-aligned instead. Pinning the box at two lines makes
one-line and two-line tiles geometrically identical.

It also made the clipping test SAFER rather than riskier. With an explicit
`height`, `clientHeight` is a number we set and `scrollHeight` is the content's
real height, so the comparison no longer depends on how the engine reports a
`-webkit-line-clamp` box — the one link in the chain that could not be checked
from source. Width is still tested as a cheap guard for an unbreakable word.

At 64px every one of the eleven launcher names now fits whole, "Microsoft /
Teams" and "Email / digests" over two lines. So the tooltip is there for names
longer than today's, which is the right place for it to be.

**(Superseded) ONE LINE PER LABEL, after trying two.** Every tile name is now a single
`white-space: nowrap` line, ellipsised when it does not fit, with the whole
name on hover. Two lines fit more names whole — 14 of 18 against 9 — but the
tile had to grow to 88px against a 72px width and the grid read as heavy.
User ruling: one line, take the hover.

**It deleted a surprising amount.** The tile is square again (8 + 32 + 4 + 18
+ 8 = 70 inside 72), and with it went the `-webkit-box` clamp, the
`overflow-wrap: break-word` that existed only to make that clamp ellipsise, the
`.app-launcher__label--word` variant, and the className branch that chose
between them. `useLabelClipped` dropped to a width-only test, which also
retired the one thing in the chain I could not verify from source: whether a
`-webkit-line-clamp` box reports its unclamped `scrollHeight`.

That branch had also been literally wrong at one point — a shell heredoc ate
the backslash out of `/s/` and left `/s/`, which tests for the LETTER s and put
"Benchmarks", "Insights" and "Emissions" on the wrong side. There is now no
side to be on.

Four of the eleven launcher names are cut at 56px and so get a tooltip:
Deepsense (58px), Steam Trap (59), Email digests (68), Microsoft Teams (85).

**Hovering a clipped tile shows the full name**, the way Google's launcher
does — but only when something is actually hidden. A tooltip repeating a name
already on screen is noise, and this grid would otherwise fire one on all
thirteen. That rule is not new here: the rail already says "tooltips appear
only when a label is unreadable", and `MaybeTooltip` already existed for
exactly this (fds's Tooltip has no `isDisabled`, so suppression is a branch).

The detector, `useLabelClipped`, measures BOTH AXES, which is where it differs
from the rail's `useLabelTruncated`: a one-word label is `nowrap` and overflows
sideways (caught by width), a multi-word one wraps and is cut by the line
clamp (caught by height). Width alone would miss every two-line name, which
is most of the long ones. It re-measures on `document.fonts.ready` for the
reason the rail documents — the web font widens the TEXT without changing the
BOX, so a first measure against fallback metrics is never corrected by a
ResizeObserver.

The tile became its own component to hold that hook, since hooks cannot run
inside a `map` callback. Screen readers were never affected either way: the
clipping is visual only and the full string stays in the DOM, so the button's
accessible name has always been the whole name.

**A silent bug found while doing it.** The single-word test read `/s/`, not
`/s/` — a backslash lost to a shell heredoc two edits earlier. It was
matching the LETTER s, so "Benchmarks", "Insights" and "Emissions" were all
treated as multi-word and sent down the wrapping branch. Rewritten as
`includes(' ')`, which has nothing to escape and cannot fail that way again.

**The width constraint, without which NONE of the above fires.** The tile is
`align-items: center`, so a column flex child is sized to its CONTENT, not to
the tile's 56px content box. The label box therefore grew to whatever the
longest word was — leaving `overflow: hidden` nothing to clip and
`text-overflow: ellipsis` nothing to overflow. Neither the clamp nor the
single-word ellipsis ever ran, and a long name just walked out of the tile and
across its neighbours. `align-self: stretch` fixes it — the flex way to say
"fill the cross axis", with no percentage to resolve against a box that is
itself being sized.

**`overflow-wrap: break-word` came back, but only on the multi-word rule.** A
name like "Email digestsssssssssssssss" wraps at its space and then has one
unbreakable run on line two, and a `-webkit-box` cannot ellipsise a line that
is merely too WIDE — only lines past the clamp. Breaking that word pushes the
content beyond two lines, which is what makes the clamp ellipsise. It cannot
touch single-word names: those carry `white-space: nowrap`, which forbids
wrapping and breaking outright. That separation is the point — breaking is
right when there is already a line break to work with, wrong when the whole
name is one word.
"Maintenance" is eleven characters and cannot fit 56px on one line; without
this it overran the box and was cut by `overflow: hidden` with NO ellipsis —
silently losing letters. Breaking it across the two lines is ugly, and reading
the whole word beats not knowing it was shortened. Names that can wrap at a
space still do; this only fires when none exists.

**Top-aligned, which is the easy thing to get wrong.** Centring each tile's
contents would put a one-line tile's glyph 17px down and a two-line tile's 8px
down — the marks would sit at different heights along a row. Top-aligned they
all land at 8px and the labels grow downward from a common line.

The label's type is the named `.BodySmallRegular` rather than a
`font-size`/`line-height` pair mixed in our stylesheet. Same for the App
Center's four text roles — `.BodyMediumRegular` on the category buttons,
`.BodyLargeMedium` on the section titles, `.BodyMediumMedium` on the app names,
`.BodySmallRegular` on the descriptions. Two of those are the *exact* pair the
CSS had hand-mixed; the named style just makes it one decision instead of two
that can drift apart a property at a time. Our rules now set box and ink only,
and must never re-declare `font-size` or `line-height` — theme-overrides loads
after design-sdk, so anything there beats the named class and silently takes the
decision back.

**That swap also fixed a measurement error, and the cause is worth keeping.**
Both packages define `--font-size-50` and `--line-height-*`, on `:root`, and
they disagree: the SDK calls the step 12px/20px, fds calls it 11px/18px. **fds
loads second and wins.** An earlier note here did the tile arithmetic with the
SDK's numbers, concluded 68px, and missed that the label was really 20px-leaded
— so a two-line name came to 32 + 4 + 40 = **76px and overflowed the 72px tile
by 4px**. At `.BodySmallRegular`'s real 18px it comes to **exactly 72**: full to
the pixel, no slack. One line is 54px and centres comfortably. Anything under 72
clips a two-line label; if more room is wanted, the glyph is where to take it
from (28px buys 4px without touching type).

Apps are the host's (`demo/iosenseApps.tsx`), and each hands over its own brand
mark. The glyph box does not re-shape what it holds — no circle crop, no
background plate, and `preserveAspectRatio` keeps Forge's 42×43 from being
stretched square — **but it does clip to its own corner radius.** The brand SVGs
carry `rx="3.77528"` on a 42-unit viewBox, which at the 32px they render to
scales to about 2.9px against the slot's 8px `--radius-m`: a squarer logo inside
a rounder well, made obvious by the dashed placeholders beside them.
`overflow: hidden` clips descendants to the padding box as rounded by
border-radius, so one declaration puts every mark on the slot's corner whatever
its own artwork uses — and the SVGs stay verbatim transcriptions of the brand
files, which is the point.

**The clip only bites if the mark FILLS the slot**, which was the other half of
this and not obvious until the App Center showed it: its marks were passed at 24
inside the same 32px box, so the rounding never reached them and the row read as
a squarer tile beside the perfectly round empty placeholders. Both slots now
force their child to `100% / 100%`, so the SLOT'S radius is the one you see
everywhere.

Sized by the slot rather than by the caller, deliberately: a host passing 24, or
40, or an `<img>` with no intrinsic size gets the same square, and CSS beats an
SVG's width/height presentation attributes so there is no way to opt out. It is
not a stretch either — `viewBox` plus the default `preserveAspectRatio`
letterboxes, so Forge's 42x43 scales to fit and keeps its proportions. Sized to
the container, never moulded to it, which is the rule these logos came in under.

The manage tile is excluded: its `Settings2` is a line glyph at 20, and ink
weight rather than box size is why it is smaller — blown up to a brand plate's
32 it would be the loudest thing in the grid.

### "Your apps" replaces Featured, and the rail goes

A reshaping of the App Center around one idea: **the top section is YOUR set,
not a curated shelf**, and it is what the launcher shows outside.

- **`isFeatured` is gone; `isAdded` is the only promotion.** Two ways to be
  promoted meant an app could be featured and not added with nothing to say
  which won. Adding an app now moves it out of its category section, to the
  top, and into the launcher grid.
- **The top section is called "Your apps" — the third name it has had.**
  "Quick access" named a category of thing rather than saying anything about
  these apps. "In your launcher" fixed that by saying where they go, but leaned
  on a word THE READER HAS NEVER SEEN: nothing in the interface is labelled
  "launcher", that is our word for it in the code. "Your apps" is two common
  words, and the possessive does the separating — everything below is headed by
  a category name, so there is no second list of "apps" to confuse it with.

  The WHERE moved into the note, which is what a note is for, and it uses the
  interface's own vocabulary rather than ours: the top-bar button that opens the
  grid is labelled "Applications", so the line reads "Shown in the Applications
  menu, in this order." Keeping that sentence is also what stops "Remove"
  reading as delete or uninstall — the job the heading was doing before.
- **The category rail is gone.** It spent a fixed quarter of the window
  filtering twenty apps the search already reaches. The categories stay as the
  section headings they always were, so nothing was lost but the column. Third
  filter row to leave this window, after the status tabs and the chips.
- **Array order IS the launcher's order.** No `order` field to keep in step with it.
  `onReorder` hands back the complete new list of added ids so the host applies
  it verbatim rather than reconstructing an index; the demo reindexes by pulling
  those apps to the front and leaving the rest.
- **An empty launcher now says so**, instead of showing a panel containing
  nothing but a button. It uses fds's `DropdownMenuEmptyState`, NOT its
  `EmptyState`: that one's own guard rules it out twice — it is drawn for a
  REGION, a 90px illustration on a 20px gap ladder, and "inside a dropdown panel
  it is enormous". This panel is 248px wide. The guard's answer to "where is it?
  in a popover" is the popover-sized one, which is this: a 24px glyph, a title,
  a line, 16px padding. Its name says DropdownMenu and ours is a Popover, but
  the element is standalone markup with no menu context behind it and the two
  are the same size class, which is what the rule is about. The words follow the
  guard's split between "nothing YET" (say what this holds and how to add the
  first one) and "nothing MATCHED" — so not "No results", which would send
  someone hunting for a filter that is not there.
- **The Apps tile became a footer button.** A
  tile said it was one of the apps; it is not — it is where you go to choose
  which apps are there. It sits outside the scroller, so flex pins it and the
  grid is the only thing that moves (`position: sticky` would want a scroll
  container to stick inside, and this control belongs to the panel, not the
  list). It also stops the grid's last row changing shape with the app count.
  `ghost`, so a row of brand marks stays the loudest thing in the panel. Its
  LABEL FOLLOWS THE JOB — "Add applications" when the grid is empty, "Manage
  applications" when it is not, glyph to match. It read "Navigation settings"
  first, which named the wrong thing twice: this window has nothing to do with
  the nav rail, and "settings" suggests preferences rather than a list of
  products you pick from.
  Removing it left `.app-launcher__tile--manage` and the `:not()` guard on the
  icon-fill rule dead; both deleted.
- **The panel is capped at 70vh** (60 at first) — a cap, not a height, so a four-app launcher
  is still four apps tall and only a long one is held to it. The cap alone does
  nothing, though: every wrapper between it and the scroller has to be allowed
  to shrink, including two of fds's own (`.ds-popover__content` and
  `__body`), and `min-height: 0` is the load-bearing half of that. **This is
  NOT the App Center's problem again**, though it looks like it: there the modal
  is a definite height and `height: 100%` divides it, here the panel is
  content-sized up to a cap and flex-shrink does the work — a percentage height
  would resolve to `auto` here and silently do nothing. The 4.5-row max-height
  on the viewport gave way to that cap; two caps would have meant whichever
  is smaller wins, which is a coin toss, not a rule.
- **The panel's padding moved into the scroller and the footer.** Left on the
  panel, the footer's divider stopped 12px short of each edge and read as a
  stray line rather than the panel's own seam. The width calc is unchanged —
  the same 12px is spent one level down.
- **The launcher's 8-app cap is gone and the panel scrolls.** The cap bought a
  fixed 3x3 at the cost of putting your ninth app two clicks away, and it made
  sense only while `apps` was a whole catalogue. Now it is a set you chose.
  The scroller's max-height is on the VIEWPORT — what `.ds-scroll__viewport`
  asks of every consumer — so it needs no definite height handed down, which is
  exactly the trap the App Center's panes fell into. 4.5 rows, so a fifth row is
  visibly sliced; a clean edge at four would read as the end of the list.
- **The launcher list is derived, and `demo/iosenseApps.tsx` is deleted.** It
  was a parallel array of 13 apps kept deliberately apart from the catalogue's
  20 — readable while nothing could be added, indefensible once adding an app
  visibly did nothing to the launcher. Nothing imported it after the rewire.

**`auto-fill`, not `auto-fit` — one word, and the whole bug.** The row grid is
`repeat(…, minmax(320px, 1fr))`, three tracks at the modal's 992px of content.
Both keywords lay down the same tracks, but `auto-fit` then COLLAPSES the ones
with nothing in them — so a section holding a single app (Automation, once
Scheduler was the only one left) dropped its two empty tracks to zero and the
lone row stretched across all 992px. `auto-fill` keeps them, so that row stays
328px and the space beside it stays empty, which is what it is.

**A heading and its own subtext are one block.** Quick access's title sat 8px
above its explanatory line, which read as two stacked things rather than a pair.
4px now — fds's own title-to-description step, the one EmptyState's gap ladder
uses for exactly this. Scoped with `:has(+ .app-center__section-note)` rather
than lowering the margin outright, because the category headings have no note
under them and for those the 8px is the gap to their rows.

**Reordering, and why it is not just drag.** No dnd library is installed and
neither package ships a reorder primitive, so this is hand-built — which made
the accessibility question unavoidable rather than optional. The ROW carries
`draggable` (a 16px grip is a cruel thing to aim at, and HTML5 drag moves the
element the attribute sits on); the grip is a real `<button>` that takes
ArrowUp/ArrowDown and announces the result through a live region. Focus rides
along because the row is keyed by app id, so the node is reordered, not rebuilt.
Two details that are easy to get wrong: `preventDefault` on `dragover` is what
makes an element a drop target at all, and Firefox starts no drag without
`setData`.

**The handle is ALWAYS VISIBLE, in its own cell beside the mark.** Two
alternatives were built and both reverted on the user's ruling (2026-10-08):

- *Hidden until hover.* Quieter, but it makes the one route to reordering
  something you have to discover by sweeping the pointer across a list.
- *Stacked on the mark*, sharing one 32px box. That reclaimed the 28px the
  separate cell costs every row, but it swapped the app's identity for a grey
  grip the moment you hovered — a poor trade on the one surface where the marks
  are how you find anything.

So: drawn at all times, in `--text-neutral-muted` so it stays quieter than the
app name beside it, and the 28px is the price of keeping both the mark and the
grip. No `opacity`, no reveal rule, no transition — the component default.

**If hiding it ever comes back**, it must be `opacity`, never `display: none`
or `visibility: hidden`: those take a real button out of the accessibility tree
and the tab order, which deletes the keyboard route to reordering entirely. The
reveal list also needs `:focus-visible` (tabbing onto a control you cannot see
is worse than one that was never hidden) and `[data-dragging]` (the pointer
leaves the row it is carrying). That note is in the CSS too.

**THE PANEL GLITCHED ON SELECT, and the cause was update ordering.**
`.ds-popover[data-status='close']` plays a 200ms `ds-popover-out`, so the panel
is still mounted for a fifth of a second after it is dismissed. `pick` fired
`setIsOpen(false)` and `onSelect(id)` in the same tick, React batched them into
ONE commit, and so the whole page swap — unmounting the old route (Highcharts,
on the Overview page), mounting the new one, rebuilding the breadcrumb — was
rendered BEFORE the browser ever painted `data-status="close"`. The panel sat
frozen for the length of that work, then the animation started late or was
skipped.

Fixed by making the close the URGENT update and the navigation a transition:
`setIsOpen(false); startTransition(() => onSelect(id))`. React commits and
paints the close first; the route change renders after, interruptibly. The
animation is `opacity` + `transform`, so once started the compositor can carry
it while the main thread builds the page.

Same bug, same fix, in two more places found by sweeping for the pattern: the
launcher's footer button (mounting the App Center is a portal, a focus trap and
twenty rows) and **ProfileMenu**, whose dropdown has its own
`ds-dropdown-menu-out` and whose `openProfile` / `openAppearance` both did the
heavy work in the closing tick.

**The modal header lost its subtitle.** It read "Add the tools your team
already uses." — a line that restated the window's own name and then went
unread, which is what a subtitle usually is. The header is now the mark, the
title and the close. Both sections below carry their own note, and those say
something the heading does not.

**The footer button is OUTLINED, and fds has no `outline` variant.** Its axis
is `primary | secondary | ghost`; the outlined one is `secondary` + `neutral`,
which draws `border-color: --border-neutral-default` over
`--background-surface-intense` — a border on the panel rather than a fill. Same
pair the App Center's Add and Remove buttons use, so the two surfaces now
agree. It was `ghost`, chosen to stay quiet under a grid of brand marks; the
border wins because it is the one control in the panel and, below a divider in
its own footer, it needs an edge to read as a button at all.

**Tile labels went back to `.BodySmallRegular`** from Medium. The ink is
primary and always was — it is inherited from the tile's own
`--text-neutral-normal`, and the label declares no colour of its own, so there
is nothing that can disagree with it.

**The "Your apps" note is the user's own copy:** "Set the order apps appear in
the Applications menu. Drag and drop to rearrange." The fallback drops the verb
as well as the instruction — "The order apps appear in the Applications menu."
— because with no `onReorder`, or while a search narrows the list, you cannot
SET anything, and promising it in the one sentence meant to explain the section
would be a lie.

**The top bar is four containers now, not three.** The icon group
(`.app-topbar__icons`) holds the launcher's grip and the bell and is declared
the home for every bare glyph added later — `actions` lands inside it, so a
host adds nothing but the icon. Its gap tightened from 6px to **2px**, fds's
smallest step above zero, settled after trying 6, then 2, then 0 on screen.
These are bare marks with no border or fill, so at 6px they read as unrelated
controls that happen to be adjacent rather than one cluster.

ZERO was tried and rejected. The arithmetic argues for it — at `Medium` with
`isHighlighted` each button is a 32px box around a 16px glyph, so even flush
there is 16px between the marks — but that 32px box is also the HOVER SQUARE,
and abutting squares turn a sweep across the group into one block sliding along
instead of two separate washes.

**The avatar moved out** into `.app-topbar__profile`, 8px clear. It is a filled
circle with an image or initials against the others' line glyphs; inside the
group it ended the cluster on something that did not match it. The separation
is a `margin-inline-start` rather than a gap on `.fds-topnav__actions`, because
that gap is 0 on purpose — the assistant button sits flush against the icons,
and raising it would push those apart too. The bar now runs
`assistant [0] grip [2] bell [8] avatar`, which is three gaps and therefore
three elements: a flex row has exactly one.

**Keyboard reordering removed (user ruling), and the grip demoted with it.**
Arrow keys on a focusable grip, plus the live region that announced the result,
are gone. The grip went from `<button>` to an `aria-hidden` `<span>` in the
same change, which is the part worth noting: with the behaviour stripped, a
focusable button is a tab stop that answers no key and no click, announced to a
screen reader as an action you cannot take — worse than no button. Its
`:focus-visible` rule and the `.app-center__sr-only` rule went too, both having
lost their only consumer.

**The cost, stated plainly:** reordering is now pointer-only. A keyboard or
screen-reader user cannot do it at all, and HTML5 drag does not fire on touch,
so neither can a tablet user. `@dnd-kit/sortable` — already an fds peer dep,
just not installed — would bring keyboard and touch sensors if that ever
matters.

**Quick-access names: regular weight, primary ink.** `.BodyMediumRegular` down
from `.BodyMediumMedium`, and the secondary override added one turn earlier was
deleted so the base rule's `--text-neutral-normal` applies again. (Same ramp
note as below: fds says normal / subtle / muted where design-sdk says
primary / secondary / tertiary.)

**Quick-access app names were SECONDARY ink** (superseded above, kept for the token mapping). `--text-neutral-subtle`, which is
fds's spelling of secondary — it ships no token by that name, and the two
libraries run the same ramp under different words: design-sdk's
primary/secondary/tertiary are fds's normal/SUBTLE/muted, the second step
being the same colour in both (gray-1100 light, dark-300 dark). So this is the
exact equivalent of the rail's `--text-gray-secondary`, not a near-miss picked
by eye.

Scoped to `--quick`: the catalogue rows below keep the stronger ink, because
those are what you read to CHOOSE from. These you have already chosen.

**Launcher tiles lost their SELECTED state, and the `activeId` prop with it.**
They are links out to other applications; a grid of links has a hover and
nothing else to say. The marking was also a claim the component cannot honestly
make — it is handed ids and cannot tell an application from a page inside one.
The demo shows the hazard concretely: five app ids are ALSO nav route ids
(`steamtrap`, `terminal`, `maintenance`, `agents-lab`, `warehouse`), so opening
Steam Trap set `activeId` and its tile came back washed on every later open.

What remains on a tile: rest, `:hover`, `:focus-visible`. The blue ring in the
report was the FOCUS ring, not the wash — `--focus-ring-shadow` is a 2px gap
plus a 3px `--border-focused`, where the wash was a grey alpha. It stays: the
panel is a focus-trapped dialog and moves focus to the first tile on open, so
that ring can show on open. Removing it would delete the only indication of
where the keyboard is. The lever, if it ever has to go, is `initialFocusRef` —
drop it and nothing is focused on open, at the cost of a Tab for keyboard users
and some risk about where focus lands instead.

**The "Beta" / "MCP" tag badges are gone, and so is the `tags` field.** Not
just the rendering: nothing else read them, and an exported field feeding a
badge that no longer draws is worse than no field. The `Badge` import went with
it (tags were its last consumer), and `.app-center__row-name` dropped back to a
plain block — its flex row and 4px gap existed only to space the name from
those badges.

Unrelated and untouched: the SIDENAV's own badge system
(`{ kind: 'word', label: 'Beta' }` on nav rows, in `iosenseNav.tsx` and the
stories). Same word, different feature.

**THE LIST SHIFTS AS YOU DRAG, and nothing marks a drop target any more.**

Two versions marked one — an inset line on the leading edge, then the row's own
hover wash — and the user read the result as *replacing* an app rather than
moving it. The array maths was never wrong: `A B C D E`, drag A onto C, gives
`B C A D E`, a move with B and C shifting up, not a swap (verified by
simulation before changing anything). What was wrong was that nothing SHOWED
the shift. Marking the row under the pointer answers "which row are you over?"
when a reorder raises "where will this end up?" — and highlighting a single row
is the vocabulary of dropping a file INTO a folder.

So the rows now re-render in the would-be order on every `dragover`: the other
apps visibly step up or down to open the place the carried one will take, and
the drop commits what you can already see. The shift IS the feedback, so the
wash went with the line; all that is left is the carried row's own fade.

Three details that make it behave:

- **The preview is LOCAL state, not an `onReorder` per `dragover`.** The host
  would otherwise take dozens of writes per drag, each a round trip in a real
  app. One call, on drop.
- **Each `dragover` rebuilds from the previous preview**, not from `apps`, so
  dragging across several rows accumulates instead of each move starting over.
- **No oscillation.** After a step, the cell under the pointer holds the
  dragged row itself, and `app.id === dragId` skips it — the classic
  shift-flicker cannot start.
- **`onDragEnd` commits too**, not just `onDrop`. It fires on a cancelled drag
  (Escape, or a release outside the list) as well as after a drop, and the
  commit writes only when the order actually changed, so the second call is a
  no-op.

**Rearranging is OFF while searching.** A filtered list hides rows, and dropping
something "after the second one you can see" has no honest meaning when there
are three you cannot. The handles disappear until the query clears.

**One token caught in review:** the dragged row's fade was written as
`var(--global-opacity-disabled, 0.4)` — a token neither library defines, hidden
behind a fallback that would have shipped 0.4 looking deliberate. It is fds's
`--disabled-opacity` (0.5). Same mistake as the invented `--text-gray-subtle`
earlier; the grep for `var(--x, …)` is worth keeping in the loop.

### The App Center

`AppCenter` (new, exported) is the window the Apps tile opens: fds `Modal` at
`size="lg"`, a category rail and the app list each with **their own**
`ScrollArea` (one `ModalBody` scroller would carry the categories away with the
list), capability chips, and sectioned rows with Featured first.

**Two actions, not three states.** It was built with
`available | connected | needs-reconnect`, a Connected/Disconnected tab pair and
a status badge per row. All of it is gone: the shell has no connection to lose,
so "disconnected" was chrome describing a condition nothing here can observe or
repair. An app's `isAdded` is a boolean, the button reads **Add** or **Remove**,
and `onAppAction(id, action)` hands the press back as `'add'` or `'remove'`.
Both buttons are `tone="neutral"`, Remove included — Button's guard resolves
this collision outright (a repeated row action defaults to neutral; `negative`
is for what must look dangerous), and Remove is undone by the Add button that
replaces it in the same place.

**`AppCenter` is CONTROLLED, and the demo had not noticed.** It never touches
the array it is given; it reports the press through `onAppAction` and redraws
from whatever the host sends back. That is the right split for a shell — adding
an app is an API call that can fail, and a component flipping its own button
optimistically would end up disagreeing with the server. The cost is that the
host has to actually do something with the press, and the demo was passing the
imported constant and `console.log`-ing the callback: a button that never
changed, which reads as broken rather than as controlled. The demo now holds the
catalogue in `useState` and writes `isAdded: action === 'add'`.

Why the action and not `!app.isAdded`: the two agree today, but being handed the
action is what lets a host set the state the user ASKED FOR rather than
inverting whatever the flag says by the time the handler runs — which, once a
network round trip sits in there, is not necessarily what they saw.

**Still separate: the launcher's list and the catalogue.** `IOSENSE_APPS` (13
entries) and `IOSENSE_CATALOGUE` (20) are different arrays by an earlier
decision, so adding an app in the App Center does not make it appear in the
launcher. That was invisible while nothing could be added and is visible now.
Deriving one from the other is a few lines, but it would change what the
launcher shows today, so it is left as a question rather than taken.

**Nothing found is fds's `EmptyState`**, not the line of grey text that was
there, with `NoSearchResultIllustration` — the guard ties the picture to the
*reason* a region is empty, and a "no data" drawing would claim the catalogue is
empty when the truth is the query is too narrow. `Medium` (the default) because
this is a region in a dialog, not a page. **Clear filters** appears only when
something is actually filtering; a button that visibly does nothing is worse
than no button. Our only CSS is a width cap, which the guard asks the caller to
supply — the component centres itself and declares no max width, so at the
modal's full span the description ran to one over-long line.

**A header logo**, through `ModalHeader`'s own `leading` slot (a 28px flex cell
with a negative inline margin that lands Figma's 8px gap to the title), so it
cost no CSS. It is a **prop** with no fallback, unlike `IosenseShell.logo` —
omitted, the header is title and subtitle alone, which beats shipping someone
else's identity. The demo supplies `demo/IosenseLogo.tsx`, which transcribes
design-sdk's internal `BrandLogo` because that component is not exported, under
a distinct gradient id (ids are document-global and the rail already has one on
the page).

**Escape is shared** and guarded: the search field would otherwise lose a
half-typed query to the key pressed to clear it, so the first Escape clears and
the second dismisses. State dies with the dialog by design — Modal unmounts, so
query, category and chips reset on every open.

**The scrollbars did not work, and the reason is worth keeping.** Both panes had
`overflow-y: auto` on their `.ds-scroll__viewport` and nothing else — which does
*nothing*. `.ds-scroll` is `position: relative` and that is all; the viewport
class deliberately sets no overflow and no height, and fds says why in that
rule's own comment: **"each consumer keeps its own axes AND ITS OWN
MAX-HEIGHT."** A block with auto height grows to fit its content, so it never
overflows — it spilled past the grid cell and was clipped by `.ds-modal`'s
`overflow: hidden`. The bar was not merely invisible: `useOverlayScrollbar`
measures `scrollHeight` against `clientHeight`, found them equal, reported
`isOverflowing: false`, and `ScrollBars` returned null. No bar, no scrolling,
rows past the fold cut off.

Fixed by giving each pane `display: flex; flex-direction: column; min-height: 0`
and the viewport `flex: 1 1 auto; min-height: 0; overflow-y: auto` — the exact
shape fds gives its own modal body. The rail's scroller (`.app-sidenav__scroll`)
already had this pattern; the App Center was the one place the viewport rules
were written fresh instead of copied, which is how the bound went missing.

**AUDIT: the App Center's width and height are now entirely fds's, and there is
no token for either.** Asked where these numbers come from, the answer was
embarrassing in one place:

| dimension | set by | value |
|---|---|---|
| max width | fds `.ds-modal--size-lg` (via `size="lg"`) | 1024px |
| width below that | fds `.ds-modal` | `calc(100vw - var(--spacing-48))` |
| max height | fds `.ds-modal` | 80vh |

**fds exposes no `--modal-*` custom property.** It writes 400px / 760px /
1024px / 80vh as literals inside those rules, so there is nothing to reference
— which is exactly why the right answer is to reference nothing and let its
rules stand, rather than invent a token (the `--global-opacity-disabled`
mistake) or copy its numbers.

Copying its numbers is what had happened: `.ds-modal:has(.app-center)` carried
`height: 80vh`, hand-transcribed from fds's cap. It bought a frame that did not
resize while filtering, and cost a magic number that would silently disagree
with every other dialog the day fds changed its own. **Removed.**

The definite height was load-bearing, though, so the chain had to change with
it: a content-sized box hands its children nothing to resolve `height: 100%`
against. `.app-center` now SHRINKS instead of dividing — `flex: 1 1 auto;
min-height: 0` — the same pattern the launcher popover uses against its own
cap, and `.ds-modal-body` (fds's, not a flex container) is made one under a
`:has()` so no other dialog is touched.

**Consequence, accepted:** the modal is content-sized up to 80vh again, so it
shrinks when a search narrows the list. With twenty apps it sits at the cap
almost always, and a short modal around the "No applications found" block is
better than a tall mostly-empty one.

Still raw viewport values elsewhere, both deliberate and neither with an fds
token available: `max-width: 85vw` on the mobile nav drawer (pre-existing), and
`max-height: 70vh` on the launcher popover (the user's own figure, 60 then 70).

**That fix was necessary but not sufficient — the whole dialog still scrolled as
one, and the real cause was a layer up.** `.ds-modal` sets `max-height: 80vh`
and *no* height, so it is content-sized. That is right for a dialog that grows
with its text and wrong here: a content-sized flex container gives its
descendants no definite height to resolve a percentage against, so
`.app-center`'s `height: 100%` fell back to `auto`. The grid grew to fit the
whole catalogue, and the one ancestor carrying `overflow-y: auto` — ModalBody —
became the thing that scrolled. The sidebar and filter row went with it, because
at that point they genuinely were inside the scroller.

Fixed with `.ds-modal:has(.app-center) { height: 80vh }` — `:has()` reaches this
one dialog without touching the shared rule or any other modal in the app. 80vh
matches the cap it already had, so it is the same size it was the moment its
content overflowed; it just no longer shrinks below it. A catalogue browser
wants a stable frame regardless — otherwise the dialog resizes as you filter,
jumping taller and shorter under the cursor.

**And the filter row had to leave the scroller.** Even with the heights right,
the row was inside `.app-center__main`'s ScrollArea, so every scroll carried it
off the top — a filter you have to scroll back up to reach. The right pane is
now a plain flex column holding a `flex: none` bar and a separate
`.app-center__list` scroller beneath it, so only the apps move. The bar carries
its own 16px padding now that no scroller supplies it, and
`.app-center__section` became `+ .app-center__section` because the scroller's own
16px already sits above the first one and the two were stacking to 32px.

**Then the chips went and the search took their place.** The "Works with"
capability row is gone outright — the prop, the `AppCapability` type, the
`worksWith` field and the demo's capability list with it, since nothing else
read any of them and an exported type feeding a row that no longer renders is
worse than no type. **Two filter rows have now been through that spot and
gone** (the Connected/Disconnected tabs with the status model, then the chips),
which leaves the category rail and the search box: four ways to narrow twenty
apps was three more than it needed.

The search moved out of `ModalHeader`'s `trailing` slot into that fixed bar.
It spans the pane now instead of sitting at a fixed 256px beside the title — a
field the width of the results reads as belonging to them, where one in the
title row reads as searching the whole dialog, categories included, which it
never did. No width declared: `.fds-search-input` is already `width: 100%`, so
the old cap was the only thing stopping it filling the bar.

**And a second scrollbar defect, app-wide rather than App Center's.** Once the
wheel worked, the bar still barely did as a *control*. fds's `:root` block sets
an 8px lane carrying a 6px thumb and comments the reason — the lane "is also its
hit target, which is why it is wider than the thumb itself". Our override had
collapsed both to 4px (lane `width: var(--spacing-4)` inset 2px, thumb `left: 0;
width: 100%`), and because `pointer-events: none` sits on the lane, that 4px
strip *was* the entire grabbable surface — starting 2px from the pane edge, with
nothing either side of it to catch.

The lane now runs flush to the edge at 8px and the thumb fills it for
hit-testing while painting only the middle 4px, via transparent side borders plus
`background-clip: padding-box`. **The painted bar lands in exactly the same
pixels as before**, so nothing moves on screen; only the invisible target
doubles. `box-sizing: border-box` is declared on the thumb because this app
ships no universal border-box reset — neither library has one, so a content-box
thumb would be 8px of width plus 4px of border inside an 8px lane.

One consequence worth knowing: the thumb's live area now reaches the pane's outer
edge instead of stopping 2px short, so where a list overflows, the last 8px of a
row belongs to the thumb rather than the row. It falls inside the App Center's
16px pane padding, but the rail is tighter — if a nav row's right edge stops
taking clicks while the rail is scrollable, this is why.

**One cross-package fix this turned up.** fds recolours its illustrations onto
eight private `--_es-*` properties and inverts them under `[data-theme='dark']`
only — its own guard names the keying as a known gap. Our **Classic** theme is
`data-theme='brand'` with dark's chrome, so it drew the *light* artwork (a
#FFFFFF paper) on a dark panel: one bright rectangle in the middle of the
dialog. Rebound at `:root[data-theme='brand']` to dark's own bindings, not to
hexes, keeping the one-palette rule. The private names are a real cost — if fds
renames them the drawing silently goes light again.

---

## Next

Open questions, waiting on a decision:

- [ ] **Does the Overview page match?** Built from a screenshot; the numbers are
      invented and the Recent alerts card was cut off in it. The drag handle
      visible above that card suggests these may be draggable widgets, which are
      not built.
- [ ] **Bring the notifications panel back?** Needs reviving it in the package —
      the model and `useNotifications` went with it in `f685988`. The rules it
      followed are written down in STORY.md §2.3.
- [ ] **Real profile data, or keep the placeholder?** Only if it is the user's
      own data to publish.
- [ ] **Keep `/appshell.html`?** Built on a misreading. It works and it
      demonstrates a real package, but nobody asked for it.
- [ ] **Commit this.** 33 files, 12 of them new, none committed, and `HEAD` is
      still level with `origin/main` at `f685988`. Nothing here exists anywhere
      but this working tree — the single biggest risk on the list.
- [ ] **The App Center has not been opened on screen.** `tsc` is clean and Vite
      compiled and reloaded the new `@faclon-labs/fds/emptystate` import with no
      runtime error, but the modal only renders on a click and this repo has no
      browser automation — so the two-pane layout, the Add/Remove rows and the
      empty state are reasoned, not seen. Open it, search for something absurd,
      and check it in **dark and Classic** (the `--_es-*` rebind above is the
      line most likely to be wrong).
- [ ] **The Apps tile's glyph weight.** `Settings2` at 20 beside 32px brand
      plates — a line glyph carries far less ink than a filled plate, so
      matching their box would make this the loudest tile. Chosen by reasoning,
      not checked on screen.
- [ ] **The rail's clipped top row.** With `padding-block: 0` the scrolled list
      runs flush to the top edge, so the row on its way out is cut mid-glyph.
      Normal scroll behaviour; a `mask-image` fade would soften it. Left alone.
- [ ] **Dark mode's tree lines.** Moving them to fds's
      `--border-neutral-highlighted` lost the dark rail's deliberate
      600 → 700 step-back, so the tree is a touch louder there than it was
      tuned to be.

**A process note worth keeping.** Edits to `theme-overrides.css` and
`demo/IosenseDemo.tsx` have reverted outside the session more than once — the
row ink went back from tertiary to secondary, and a button variant went back
from `secondary` to `ghost`, both after being written and verified. If work
disappears, it is worth checking that before re-deciding the design.

Known loose ends, not blocking:

- `npm audit` reports one high-severity advisory in `brace-expansion`
  (transitive, dev-only, fixable with `npm audit fix`).
- `@faclon-labs/fds` sits at 0.3.0; 0.6.0 is published. Upgrading means bumping
  the peer range in `packages/iosense-shell/package.json`, and 0.3 → 0.6 on a
  `0.x` package crosses three breaking minors.
