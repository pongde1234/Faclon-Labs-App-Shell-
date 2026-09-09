# The shell, part by part

How `@faclon-labs/iosense-shell` is structured when we export it, and what a
client can change once they have it.

This is the structure document we agree on **before** writing any more code. One
section per part. Each part says the same three things:

- **What it is** — the anatomy, with the numbers taken from the code, not from memory.
- **What ships fixed** — the behaviour the client inherits and should not rebuild.
- **What the client can change** — the slot, and what is legal to put in it.

Read it top to bottom and you have the whole shell. Each `##` heading here is
also one Storybook story file, so this doc is the index for those.

---

## The picture

```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────────────────┐ │
│ │ SIDENAV  │ │ TOP NAV                                              │ │
│ │  header  │ │  [toggle]  Breadcrumbs …        [actions] [🔔] [SJ] │ │
│ ├──────────┤ ├──────────────────────────────────────────────────────┤ │
│ │          │ │                                                      │ │
│ │ content  │ │  MAIN CONTENT CONTAINER                              │ │
│ │          │ │  16px left / right / top, none at the bottom          │ │
│ │          │ │  16px between blocks, by default                     │ │
│ │          │ │                                                      │ │
│ ├──────────┤ │                                                      │ │
│ │  footer  │ │                                                      │ │
│ └──────────┘ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

Three parts: **the side nav**, **the top nav**, **the main content container**.
The side nav has three containers of its own — header, content, footer.

---

# 1. The side nav

240px pinned, 48px collapsed. On hover it **peeks**: the panel widens to 240px as
an overlay while the 48px footprint stays put, so the page does not move. Only a
click on the top bar's toggle pins it, and only pinning reflows the content.

Open delay 150ms, close delay 100ms — crossing the rail on the way somewhere
else does nothing, but a panel that lingers after you have left feels stuck.

Three containers, in order.

## 1.1 Header story

**What it is.** One row, 48px tall. `[logo] [organisation name]`.

Collapsed, the logo alone — and it **does not move** when the rail opens or
closes. The organisation name is always mounted and fades in; mounting it on
toggle made the name blink in after the rail had already finished moving.

While collapsed the name is `inert`, so it cannot be tabbed to.

**What ships fixed.** The logo's position, the fade, the `inert` handling, the
48px height.

**What the client changes.**

| Slot | Takes | Notes |
|---|---|---|
| `logo` | any node | Stays put in the 48px header, collapsed and expanded. **Set it** — unset falls through to design-sdk's built-in iosense mark |
| `workspace` | any node | The organisation row. Defaults to `<WorkspaceLabel name={profile.org} />` |

Both are the client's. A workspace switcher, a plan badge, a second line — all
legal, because the slot takes a node rather than a string.

**The collapse control is NOT here.** It lives in the top bar. A control that
hides a panel cannot sit inside that panel — collapsed, the rail is 48px, which
is why this used to exist twice (a close button in the header *and* a duplicate
"Open sidebar" row in the list). One button in fixed chrome replaces both.

## 1.2 Content story

**What it is.** The scrolling middle. Inset 8px (`--spacing-03`) from the rail's
own edge, 8px between groups. It scrolls through an overlay scrollbar — no
native gutter — and that bar is pushed out into the 8px lane so it never draws
on top of a row's badge.

It holds three kinds of thing.

### (a) Entity — a plain nav item

```
[icon]  Label                    [trailing slot]
```

- **icon** — 14px glyph inside the SDK's 16px slot, so icons read lighter without moving the icon column
- **label** — always present
- **trailing slot** — the client's, see below
- **states** — hover, active, focus. Active draws the pill.
- **tooltip** — appears **only when the label is unreadable**: the 48px strip, or an expanded label cut off by an ellipsis. Never when the text is right there.

**The trailing slot** is what you asked about — the thing at the end of the row.
Legal contents:

| Put in | Use it for | Rendered as |
|---|---|---|
| **Counter** | a quantity — "how many?" | `12`, `3`. Capped at 99, because an uncapped count stretches the row |
| **Badge** | a word — "what is this?" | `Beta`, `New` |
| **Indicator** | state worth seeing in the 48px strip | a dot drawn on the icon while collapsed |

The axis is **the answer type, not the look** — they share the same pill, the
same six colours and the same sizes. A Counter never holds a word.

Tone drives the colour *and* whether the collapsed dot is drawn: a count or an
alert is state worth surfacing in the 48px strip; a label like `Beta` is not.

> **Not a Chip.** Chip renders a `<button>` and the nav row is already a
> `<button>`. Nesting them is invalid HTML. If you want a chip's look, use a
> Badge.

When the rail collapses the SDK hides the trailing slot automatically, and the
dot takes over — so the collapsed tooltip quotes the number the badge would have
shown: `Finance · 12`.

### (b) Entity with sub-entities — the accordion

A parent row that unfolds a nested list.

- The parent row **is** the disclosure control — clicking anywhere on it toggles
- A chevron in its trailing slot is the visual cue, and toggles too
- Open state is **persisted** (`iosense:sidenav-open-groups`)
- A group **opens itself when one of its children becomes active**, so a deep
  link never lands on a hidden row — but you can fold it again afterwards
- **Collapsed rail:** there is nowhere to unfold into, so the parent opens a
  **flyout** beside the strip instead. One at a time — two popovers do not share
  a floating tree, so nothing would close the first when a second opens

Today: `Workflows` and `Reports`.

### (c) Section — a labelled group that hides and unhides its entities

A hairline label with a chevron, over a set of rows. Clicking the label folds
the whole set away.

**It is force-expanded while the rail is collapsed.** A folded section in the
48px strip would be a hairline with no affordance to unfold it, and it would
strand every icon inside it.

Today: `Connect`.

**What ships fixed.** The scroll behaviour, the tooltip rule, the collapse
behaviour, the flyout, the persisted open state, the active pill, the badge/dot
swap.

**What the client changes.** The rows themselves — id, label, icon, badge — and
which of them are grouped, nested or sectioned.

> **This is now data.** `AppSideNav` takes `items: NavItem[]` and renders
> **nothing** by default. The iosense rows live in `iosenseNav.tsx` as
> `IOSENSE_NAV` — an example to copy, not a default to inherit. Copy it into
> your own file; importing it into a product that is not iosense ships our pages
> inside someone else's app.

## 1.3 Footer story

**What it is.** A pinned row at the bottom of the rail, built as an ordinary nav
row rather than a bare icon button — so it fades its label in when the rail opens
and drops to the icon alone in the strip, using the same mechanism as every other
labelled row.

**What we export.** **Empty**, and not rendered at all when omitted, so an unused
footer costs no height. Help is what *we* put there in the product; it is not
what a client necessarily wants, so the exported footer is a `footer` slot.

Build rows with `NavFooterRow` — a bare IconButton will not fade its label with
the rail, and the row looks wrong next to the rest of the nav.

**What the client can put in it.**

- Help (the glyph is exported — `CircleQuestionMark` — so putting it back is one line)
- A promotional banner
- A plan / usage row
- Nothing at all

Profile, notifications and the assistant are **not** here. They moved to the top
bar.

---

# 2. The top nav

48px tall, above the content sheet, spanning the column to the right of the rail.

## 2.1 Left — the toggle

The rail's collapse control. It is a **state toggle, not a command**: the glyph
flips to show what pressing it will do.

| | Desktop | Mobile |
|---|---|---|
| open | `PanelLeftClose` · "Close sidebar (Ctrl+B)" | "Close navigation" |
| closed | `PanelLeftOpen` · "Open sidebar (Ctrl+B)" | "Open navigation" |

One control, two jobs: below the breakpoint there is no rail to pin, so the same
button opens the drawer. No hamburger — that would be a third idiom for one
control, and `PanelLeft*` already says "the panel on the left", which is true in
both modes.

`Ctrl/⌘+B` does the same thing, and is skipped while you are typing.

## 2.2 Middle — the breadcrumbs

The page name, and the trail above it. **Three renders, one rule:**

| Crumb | Renders as |
|---|---|
| the last one | the current page, `aria-current`, not a link |
| has an `id` | a link — clicking navigates |
| has neither | **plain, inert text** |

That third case is the one worth stating, because it is deliberate and fds has
no such variant — every non-current breadcrumb item there is a tabbable button,
so this is ours.

**Two layers** → the first crumb is plain text, the second is the current page.
**Three layers** → first is plain text, the **second is a link**, third is current.

```
Workflows / Store dashboard                              ← 2: text, current
Workflows / All Workflows / Create company when a deal…  ← 3: text, LINK, current
```

**Why sections are inert.** Workflows and Reports are not pages. Pointing their
crumb at the section's first child was tried and was worse: a crumb whose job is
to go **up** instead moved the reader **sideways** into a sibling.

`buildTrail()` is what decides which crumb gets no id. It is exported — the rule
is not something the client re-derives.

## 2.3 Right — actions, notifications, profile

Fixed order, right edge inward:

```
[ actions slot ]  [ 🔔 notifications ]  [ SJ avatar ]
```

| | What it is | Client's? |
|---|---|---|
| **actions** | a slot, rendered to the **left** of the other two | yes — anything |
| **notifications** | bell + unread count pill in the corner | the items and count are the client's; the menu is ours |
| **profile** | avatar with initials or an image, opening the account menu | the profile object is the client's; the menu is ours |

The unread pill is a Counter positioned in the bell's corner, with a 2px ring cut
out against the bar so it separates from the glyph underneath. The avatar's hover
is a box-shadow halo, not padding — a shadow costs no layout, so the avatar's
right edge stays aligned with the content edge below it.

**Deliberately not exported:** the application launcher (the app grid) and the
assistant button. One lists applications only the host can enumerate, the other
opens an assistant this package knows nothing about. Both go in `actions`.

---

# 3. The main content container

**16px left, right and top. No padding on the bottom. 16px between blocks.**
This is the rule the whole export exists to protect.

```
┌─────────────────────────────────────────┐
│              ↕ 16px                     │
│  ↔16px   ┌───────────────────┐   16px↔  │
│          │      Card         │          │
│          └───────────────────┘          │
│              ↕ 16px  ← between blocks   │
│          ┌───────────────────┐          │
│          │      Card         │          │
│          └───────────────────┘          │
│                                         │
│   … content continues, no bottom pad    │
└─────────────────────────────────────────┘   ← scrolls past the edge
```

## 3.1 The three sides, and the one that is missing

| Side | Value | Why |
|---|---|---|
| left / right | **16px** | the top bar's breadcrumb is inset 16px from the same column, so page content and the bar's first glyph share a left edge |
| top | **16px** | separates the first block from the bar above it |
| **bottom** | **none** | **the content is scrollable.** A scrolling column has no bottom to pad — it has a cut-off. Padding there either does nothing useful or invents a dead band the reader has to scroll through before the content ends |

**16 rather than 12 is not a taste call** — it is the breadcrumb alignment above.
Pulling the sides in to 12 would misalign them.

## 3.2 Between blocks: 16px, as the default

The gap between one card and the next is **16px**, and it is a **default, not a
law**. The container supplies it so that content which says nothing about spacing
still comes out right; a host who wants a denser or looser page changes it.

That default matters more here than anywhere else in the shell, because **this
container takes generated dashboards**. A generator that has to remember margins
will get it wrong at some depth. A container that supplies the rhythm cannot.

So the rule reads in that order:

1. **The container gives 16px** — between blocks, and on three sides.
2. **Content sets no outer margin of its own.** Spacing comes from
   `Stack` / `Grid` / `Card`, never from a margin on the block itself.
3. **The host may override the gap** when a page genuinely wants a different
   density. Overriding is a decision; inheriting is the default.

**The scrollbar is an overlay** drawn on top of the content, so it costs no
layout width — the content does not shift when a page starts or stops
overflowing. That is also why the bottom needs no padding to keep clear of it.

## 3.3 How the code implements it

**One owner.** `.app-main-scroll` carries the whole rule:

```css
.app-main-scroll {
  --shell-content-pad: 16px;    /* three sides */
  --shell-content-gap: 16px;    /* between blocks */
  padding: var(--shell-content-pad) var(--shell-content-pad) 0;
}
.app-main-scroll > * + * {
  margin-block-start: var(--shell-content-gap);
}
```

The inset used to be **split across two owners** — the sides here, the top and
bottom on every page root's `padding: 16px 0`. That is what put padding at the
bottom, and it meant the rule could not be stated in one place. **Page roots now
add nothing.**

```tsx
<IosenseShell {...rest}>
  <YourPage />           {/* no wrapper, no padding, no margin */}
</IosenseShell>
```

**Why `> * + *` and not `display: flex; gap`.** Flex would change the layout
model of the *scroll container*: every child becomes a flex item with
`flex-shrink: 1`, so a tall page gets squashed to fit instead of overflowing —
the one thing a scroll container must not do. Verified: with the sibling
selector, a 900px block inside an 851px viewport stays 900px and the container
scrolls.

**Margins collapse, and that is the right precedence.** A block that sets its own
`margin-block-start` larger than the gap wins rather than adding to it — content
that has explicitly asked for room gets it; content that asked for nothing gets
the default.

**Overriding.** Both values are custom properties, so a denser page is one
declaration and does not re-state the rule:

```css
.dense-page .app-main-scroll { --shell-content-gap: 8px; }
```

**Measured**, with a page whose blocks set no padding or margin of their own:

| | |
|---|---|
| computed padding | `16px / 16px / 0px / 16px` |
| first block from the top / left / right | 16 / 16 / 16 |
| between blocks | 16, 16 |
| below the last block, scrolled to the end | **0** |
| child heights (200, 900) | unchanged — not squashed |

---

# 4. What is one component today, and what should be several

The honest state of things, because this is the part that decides how much work
the rest of this is.

| Part | Today | Still to do |
|---|---|---|
| **Nav data** | ✅ a `navItems` prop, **empty by default** | — |
| **Header logo** | ✅ a `logo` slot | — |
| **Header org name** | ✅ a `workspace` slot | — |
| **Footer** | ✅ a `footer` slot, **empty by default**, `NavFooterRow` for rows | — |
| **Breadcrumb rule** | ✅ `buildTrail` reads the same `navItems` | — |
| Entity (nav row) | `NavRow`, internal | export it, so a host can render one outside the rail |
| Accordion entity | `NestedNavItem`, internal | export it |
| Section | `NavGroup`, internal | export it |
| Top nav | `AppTopBar` | fine as is — already slot-based |
| **Content container** | ✅ 16/16/16/0 and a default 16px gap, one owner | — |

**What changed.** The rail's 22 hardcoded rows moved out to `iosenseNav.tsx` as
`IOSENSE_NAV` — an example to copy, not a default to inherit. `AppSideNav` now
renders whatever `items` you give it and **renders nothing if you give it
nothing**. That is the export: the behaviour, not our content.

The three inner components are still internal. That is a smaller gap than it
was: a host who wants a different rail now supplies different data rather than
forking the file. Exporting `NavRow` and friends only matters for someone
rendering a nav row *outside* the rail, which nobody has asked for yet.

**One deliberate behaviour change.** First-visit defaults used to be
`['workflows', 'connect']`, which were iosense's own ids. The rule is now
**every section open, every accordion closed** — a folded section in a fresh
install is a hairline label with no affordance to unfold it and it strands every
row inside, whereas a folded accordion still shows its parent row. Override with
`defaultOpenGroups`. Existing users keep whatever they had; this only affects a
first run.

**Order of work from here:**

1. Stories for each `##` above
2. Export Entity / Accordion / Section if a host ever needs one loose

---

# 5. Stories

`npm run storybook`. Three files, grouped by the component you actually mount —
not one per section of this document, and the difference is worth explaining.

```
stories/
  fixtures.tsx           small hand-written navs, a non-iosense logo, a frame
  SideNav.stories.tsx    §1  — 14 stories
  TopNav.stories.tsx     §2  —  8 stories
  Shell.stories.tsx      §3 + the whole shell — 6 stories
```

**Why not one file per section.** §1.1, §1.2 and §1.3 describe the header, the
rows and the footer, but those are not separately mountable components yet —
see §4. They are `AppSideNav` with different props. A `SideNavHeader.stories.tsx`
would have to mount the whole rail anyway and pretend it was showing you a
header, which is a worse lie than grouping them honestly.

If §4's component split happens, these files split with it.

| Section | Stories |
|---|---|
| §1.1 header | `HeaderWithoutLogo` (falls through to design-sdk's iosense mark), `HeaderWithCustomWorkspace` |
| §1.2(a) entity | `WithRows`, `Badges` (both badge kinds, a capped 1284, a truncated label), `Collapsed` (dots + tooltips) |
| §1.2(b) accordion | `Accordions`, `AccordionOpensForActiveChild`, `CollapsedFlyout` |
| §1.2(c) section | `Sections`, `CollapsedSectionStaysOpen` |
| §1.3 footer | `Footer`, `FooterWithBanner` — and `Default`, which has none |
| §2 top bar | `OneCrumb`, `TwoCrumbs`, `ThreeCrumbs`, `WithActions`, `NoUnread`, `ManyUnread`, `Mobile` |
| §3 content | `ContentSpacing`, `DenserContentSpacing` |
| whole shell | `Default` (empty — what ships), `Branded`, `TheIosenseProduct`, `DeepLinked` |

**The breadcrumb stories matter most.** `TwoCrumbs` and `ThreeCrumbs` are the
rule that is easiest to get wrong and hardest to notice when it is wrong — try
tabbing to the first crumb in either; you cannot, and that is the point.

**`Default` is the other one to read.** Both `Shell/Default` and
`Side nav/Default` show what the package ships with nothing passed in: an empty
rail, no footer, and design-sdk's own mark in the header. Everything in every
other story is a prop.
