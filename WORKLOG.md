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
`Grip`. An open panel keeps its trigger lit via `aria-expanded`, which
floating-ui already sets — no mirrored React state.

### The application launcher

`AppLauncher` (new, exported) is the panel: a 3-column grid in a Popover, with
the current app marked by `aria-current`. **Its CSS already existed** —
a complete orphaned `.app-launcher` block from the first commit, with no
component ever written against it — so this was built to the contract the
stylesheet already described.

**It caps at 8 apps**, with a ninth "More" tile calling `onShowAll`: 8 + 1 is
three full rows, so the panel keeps one shape at any scale. The cap is absolute
past 8, including at exactly 9. **Without `onShowAll` nothing is capped** —
hiding apps behind a tile that leads nowhere would make them unreachable.

Apps are the host's (`demo/iosenseApps.tsx`), and each hands over its own brand
mark. The glyph box is a bordered container that does **not** re-shape what it
holds: no circle crop, no background plate, and `preserveAspectRatio` keeps
Forge's 42×43 from being stretched square.

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
- [ ] **The launcher's "More" count and glyph weight.** `Ellipsis` at 20 beside
      32px brand plates, and the count only in the accessible name. Both chosen
      by reasoning, neither checked on screen.
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
