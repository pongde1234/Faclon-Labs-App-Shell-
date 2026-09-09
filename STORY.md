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

**The trailing slot** — the thing at the end of the row. Legal contents:

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

See `Side nav/Rules > Collapsed` for both behaviours side by side.

### (c) Section — a labelled group that hides and unhides its entities

A hairline label with a chevron, over a set of rows. Clicking the label folds
the whole set away.

**It is force-expanded while the rail is collapsed.** A folded section in the
48px strip would be a hairline with no affordance to unfold it, and it would
strand every icon inside it.

A section is never a breadcrumb ancestor — it groups rows visually; it is not
above them.

**What ships fixed.** The scroll behaviour, the tooltip rule, the collapse
behaviour, the flyout, the persisted open state, the active pill, the badge/dot
swap.

**What the client changes.** The rows themselves — id, label, icon, badge — and
which of them are grouped, nested or sectioned.

> **The entities are NOT exported.** `AppSideNav` takes `items: NavItem[]` and
> renders **nothing** by default. The rows we built are the iosense product's
> pages — Zomato, Steam Trap, Memory B — and they were only ever demo content,
> so they live in `demo/placeholderNav.tsx` and the package does not export them.
> Copy that file as a starting point. Same for the profile and the notifications:
> `demo/sampleData.ts`, not the package.

### The fixed rules

You supply the glyph and the label text. **Those are the only two things you
supply**, and neither may change the row's geometry — otherwise one badly-sized
icon in someone's nav data sets the width of the whole rail.

So these are **enforced in CSS**, not asked for in a README:

| | Fixed at | Enforced how |
|---|---|---|
| **Icon** | **14px square** | `> svg` in the icon slot is sized directly. Icon libraries set width/height as presentation *attributes*, and CSS beats those without `!important` — so a stray `size={64}` is harmless |
| Icon slot | 16px, the SDK's | untouched, so every label starts at the same x whatever the glyph does |
| **Label** | **one line, ellipsised** | `white-space: nowrap` + `text-overflow: ellipsis`. A wrapped label changes the row height, and rows of different heights make the icon column look broken |
| **Font size** | **14px / weight 400** | one step above the SDK's default. Section labels sit one step below at 12px so the hierarchy reads |
| Active row | still weight **400** | the SDK bolds it; overridden. The row is already marked by its background and ink, and bolding reflows the text a pixel or two as you navigate |

`NAV_ICON_SIZE` (14) is exported so correct data is easy to write. The CSS is
what makes incorrect data survivable.

**Measured**, with a rail deliberately fed `size={8}`, `size={32}` and
`size={64}` in adjacent rows:

```
label                   glyph    rowH  labelX  font        wrap
Correct                 14x14    32    40      14px/400    nowrap
size 8                  14x14    32    40      14px/400    nowrap
size 32                 14x14    32    40      14px/400    nowrap
size 64                 14x14    32    40      14px/400    nowrap
Averylongunbrokenword…  14x14    32    40      14px/400    nowrap   ← clipped
rail width: 240
```

**Why `label` is a `string` and not a `ReactNode`.** Arbitrary markup could not
be measured for truncation, so the tooltip rule — show the label only when it is
clipped — would silently stop working. The type is the rule.

See `Side nav/Rules` in Storybook: every story there passes deliberately wrong
data and shows the rail holding its shape.

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

## 1.4 The guardrails, in one place

Everything above, as the rules you need when writing nav data. **No rows are
shipped** — this section is the contract they have to satisfy.

### Collapsed and expanded

Two footprints, one component. `isPinned` picks between them.

| | Expanded | Collapsed |
|---|---|---|
| Footprint | **240px** | **48px** |
| Header | logo + org name | **logo only, and it does not move** |
| Row | `[icon] Label [slot]` | `[icon]` centred |
| Label | visible | hidden by the SDK |
| Trailing slot | visible | **hidden** — a dot on the icon replaces it |
| Accordion | unfolds **in place**, below its parent | opens a **flyout** beside the strip |
| Section | label + rows, foldable | label hidden, rows **forced visible** |
| Footer | icon + label | icon only |
| Tooltip | only when the label is clipped | **always**, and it quotes the badge |

Two rules there are load-bearing and easy to get wrong:

- **The logo never shifts.** It sits in the 48px header in both states, so the
  rail's top-left is a fixed point while everything under it changes.
- **A section is forced open when collapsed.** Folded, it would be a hairline
  with no affordance to unfold it, and every icon inside would be stranded.

### The third state: hover-peek

Not two states — three. **Peek is a hover, and it is not the same as pinned.**

| | Pinned | Peeked | Collapsed |
|---|---|---|---|
| Panel drawn at | 240px | **240px** | 48px |
| Footprint | 240px | **48px** | 48px |
| Page content | offset | **does not move** | offset |
| Set by | the top bar's toggle | hovering the rail | the toggle |

A peek widens `.fds-sidenav__inner` as an **overlay** over a 48px footprint.
Only pinning sets `data-sidenav-pinned`, and only that reflows the page.

Open after **150ms**, close after **100ms** — crossing the rail on the way
somewhere else does nothing, but a panel that lingers after you have left feels
stuck rather than forgiving.

> **Never key your own behaviour on `isPinned` meaning "open".** During a peek
> the rail is expanded and not pinned, so anything that does is wrong for the
> whole duration of the hover. That bug is why the peek is owned in React at
> all: the SDK sets `data-hovered` inside its own DOM where React cannot see it,
> so the component believed it was a 48px strip while the user looked at a 240px
> panel — tooltips fired on rows whose labels were plainly readable, and the
> organisation name stayed hidden.

### Row states

All of it is ours. A host supplies no colours.

| State | What changes |
|---|---|
| default | transparent, secondary ink |
| **hover** | `--background-gray-hover-light` |
| **pressed** | `--background-gray-default` |
| **active** | `--background-gray-default` + primary ink, **and the icon takes primary ink too** |
| active + hover | `--background-gray-hover-dark` — so an active row still answers the pointer |
| focus | the SDK's focus ring |

**The active row keeps `font-weight: 400`.** The SDK bolds it; that is
overridden, because the row is already marked by background and ink, and bolding
reflows the label a pixel or two as you navigate.

Transitions are `background-color` and `color` at `--fds-duration-quick`, and
`width` at `--fds-duration-moderate` — never `all`.

### The trailing slot — what you may put at the end of a row

One field, `badge`, and it is a union rather than a node. You choose the
**answer type**, not the look:

| You want | Write | Renders | Collapsed |
|---|---|---|---|
| a quantity | `{ kind: 'count', value: 12, tone: 'info' }` | **Counter** | a dot |
| a word | `{ kind: 'word', label: 'Beta', tone: 'label' }` | **Badge** | *nothing* |
| an alert count | `{ kind: 'count', value: 7, tone: 'alert' }` | **Counter**, Negative | a red dot |

**Tone drives the colour AND whether a collapsed dot is drawn.** A count or an
alert is state worth surfacing in a 48px strip; `Beta` is not — it is a label,
and a dot for it would be noise. The dot is 6px with a 2px ring in the rail's
own surface, so it reads as lifted off the glyph in every theme.

Counts are **capped at 99**. Counter has no default max, and an uncapped count
stretches the row it sits in.

**What you may NOT put there:**

| | Why |
|---|---|
| A **Chip** | Chip renders a `<button>`, and the row is already a `<button>`. Nesting them is invalid HTML. Use a Badge for the look |
| An arbitrary node | the slot is typed as the union above, so the collapsed dot can be derived. A node could not be |
| A second action | a `<button>` inside the row's `<button>`, again. The row is the only interactive thing in it |
| `tone: 'alert'` on anything routine | it only works as a signal while nothing else borrows it. Twelve accounts are furniture, not news |

### The whole contract, as a type

```ts
{ id, label, icon }                      // a row
{ id, label, icon, badge }               // …with a slot
{ id, label, icon, children: [...] }     // an accordion
{ kind: 'section', id, label, items }    // a section
```

Four shapes. `id` and `label` are strings, `icon` is a node drawn at
`NAV_ICON_SIZE`, and everything else about how they look is the package's.

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
| **actions** | a slot, rendered to the **left** of the other two | yes — anything, any number |
| **notifications** | bell + unread count pill in the corner | the items and count are the client's; the menu is ours |
| **profile** | avatar with initials or an image, opening the account menu | the profile object is the client's; the menu is ours |

### `actions` is a container, not two fixed buttons

It takes **any node**, so it takes **any number of them**. The product happens to
put two there — the assistant and the application launcher — but nothing about
the slot is specific to those, and neither ships:

```tsx
actions={
  <>
    <IconButton icon={AssistantIcon} accessibilityLabel="Assistant" onClick={…} />
    <YourAppLauncher />
    <IconButton icon={Search} accessibilityLabel="Search" onClick={…} />
    <EnvironmentBadge label="Staging" />
  </>
}
```

Icon buttons, a badge, a menu trigger, an environment marker, a "what's new"
button — whatever the use case needs. The shell spaces them and puts them in the
row; it does not care what they are.

**One rule: they go to the LEFT of the bell and the avatar, always.** Those two
are chrome and are always in the same place, so a user learns one spot for "my
account" and one for "what happened". A slot that could displace them would take
that away, which is why it is a slot on one side rather than a free-form bar.

The two on the right are chrome and always in that order, so a user learns one
place for "my account" and one for "what happened". Anything a product adds goes
to their **left**, where it cannot displace them.

**Deliberately not exported:** the application launcher (the app grid) and the
assistant button. One lists applications only the host can enumerate, the other
opens an assistant this package knows nothing about. Both go in `actions`.

> **The demo puts them back, and that is the proof.** `npm run dev` renders the
> product's top bar exactly — gradient sparkle, app grid, bell, avatar — with
> both buttons passed through `actions` from `demo/IosenseDemo.tsx`. The package
> ships neither. If the slot were not sufficient, the demo could not reproduce
> the screenshot, and it does.
>
> Measured against the product at 1917×949 with the rail collapsed: rail 48px,
> logo 48×48 at the origin, content inset `16px 16px 0 16px`, 0 console
> exceptions.
>
> The assistant's gradient moved to the demo with it. `.ai-icon` sets
> `stroke: url(#ai-gradient)`, and that paint server was defined by an
> `<svg><defs>` in the app's own root which never shipped — so the package was
> carrying CSS pointing at an id it did not define. An SVG stroke can only
> reference a paint server that exists in the document, so the defs now render
> next to the button that needs them.

### What the notifications bell opens

```
┌── Notifications ──────────────────┐
│ ● Temperature above threshold     │   ← Indicator: Intense unread, Subtle read
│   Alert · Site A · 2h             │   ← kind · source · when
│ ● Weekly summary ready            │
│   Report · Scheduled reports · 5h │
│ ○ Firmware rollout finished       │
│ …                        up to 5  │
│              View more            │   ← hands off to your page
└───────────────────────────────────┘
```

**Five is a preview, not a list.** A panel that scrolls is a page in a popover,
and the honest version of that is a page — so "View more" calls
`onOpenNotifications` and the rest is yours.

The whole row navigates; there is no per-row action, because most of the time
the title is the whole answer. Empty, it shows an fds `EmptyState` reading
"You're all caught up" — a popover that opens onto nothing reads as broken.

The unread pill is a Counter positioned in the bell's corner, with a 2px ring cut
out against the bar so it separates from the glyph underneath. Placement is all
that is ours: Counter owns its box, radius, fill, ink and type, and has no anchor
mode by design.

### What the avatar opens

```
┌───────────────────────────────────┐
│ (AB)  Ada Byron    [Northwind Ltd]│   ← avatar or initials, name, org Badge
├───────────────────────────────────┤
│ ⚙  Settings                       │   → onOpenProfile
│ 🎨 Theme                    Light │   → opens the appearance picker
│ ⏻  Log Out                        │   → drawn intent="negative"
└───────────────────────────────────┘
```

**The Theme row names the current theme in its trailing slot**, so the answer is
visible without opening anything — and a screen reader says "Theme, Light"
rather than announcing nothing, which is what the check mark it replaced did.

**The picker is a modal, and a sibling of the menu rather than a child.** Modal
unmounts entirely while closed, so nesting it inside the overlay would tie its
lifetime to the menu that opened it — which closes on the very click that opens
the modal. The menu also closes *first*: DropdownMenu and Modal each own a focus
trap, and two on screen at once fight over focus.

**Log Out is `negative` by product decision, against the fds guard.** The guard
reserves negative for rows that *destroy* something; signing out destroys nothing
and is the most reversible action there. The call is that ending a session should
still read as weighty. What it costs, written down so it is not rediscovered:
negative is now spent on a row present in every session, so a genuinely
destructive row added later — Delete account, Revoke sessions — will not stand
out, and this one should go neutral to make room.

The avatar's hover is a box-shadow halo, not padding — a shadow costs no layout,
so the avatar's right edge stays aligned with the content edge below it.

---

# 3. The main content container

**16px left, right and top — equal, and measured equal. No padding on the
bottom. 16px between blocks.** This is the rule the whole export exists to
protect.

> **EVERY DIRECT CHILD GETS THE GAP, including ones that draw nothing.**
>
> The gap is `> * + *`, so an element that renders no pixels is still a sibling
> in that chain. An `<svg>` defs block, a portal anchor or a hidden marker
> placed in the content container pushes the first visible block down by a full
> gap — **measured at 32px from the top instead of 16**, while the left and
> right stayed at 16. Three sides that should have been equal were not, and
> nothing on screen showed why.
>
> Keep invisible helpers **outside** the shell. The demo renders its gradient
> defs in `main.tsx`, above `<IosenseDemo />`, for exactly this reason.

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

## 3.3 What may go in it

**Everything rendered into the content container comes from the SDK.**

That is a rule, not a preference. The container supplies the spacing; the SDK
supplies the surfaces. A page that hand-rolls its own is consistent on the day
it is written and wrong on every day after — it will not follow a theme switch,
it will not track the SDK's card when that changes, and two pages written a
month apart will not match.

| Want | Use | Not |
|---|---|---|
| a surface | `Card`, `CardHeader`, `CardBody` | a div with a border and a radius |
| a table | `Table` | `<table>` with your own CSS |
| a chart | `Chart`, `LineChart`, `PieChart`, `Gauge` | an SVG you drew |
| nothing to show | `EmptyState` | a centred paragraph |
| an action | `Button`, `IconButton`, `LinkButton` | a styled `<button>` |
| a field | `TextInput`, `SelectInput`, `SearchInput` | a bare `<input>` |
| an annotation | `Badge`, `Tag`, `Chip`, `Counter`, `Indicator` | a styled span |
| a message | `Alert`, `Toast` | a coloured div |

Both packages are peers you already have: `@faclon-labs/design-sdk` and
`@faclon-labs/fds`. If a surface seems to be missing, it is far more likely to be
named something else than to be absent — the SDK ships ~100 subpaths.

**This is also how content follows the theme.** The shell stamps `data-theme` on
the document root, and every SDK component reads it. Nothing in a page needs to
know which theme is active, or to branch on it — an SDK `Card` is
`rgb(255,255,255)` in light and `rgb(31,33,35)` in dark on its own, and its ink
follows.

A hand-rolled surface does not. `background: #fff` is white in dark mode, and
`color: #101828` is black-on-black. That is not a styling preference, it is the
difference between a page that themes and a page that breaks — and it is why the
rule above is a rule rather than a suggestion.

Measured in dark: main `rgb(19,20,21)`, SDK cards `rgb(31,33,35)`, ink
`rgb(255,255,255)` — all from the components, none from the page.

**Do not re-style an SDK component to make it fit either.** An overridden card
is a fork of the card, and it silently stops tracking the original. Use the props
it offers — `padding`, `size`, `validationState`; if none of them fit, it is
probably the wrong component.

### The one exception: layout

**Arranging those components is yours.** A grid or a flex row that positions
cards is *structure*, not a surface — the SDK ships no layout primitive for it,
and inventing one here would be a second opinion about spacing.

```tsx
<div className="cards-grid">   {/* layout: yours */}
  <Card />                     {/* surface: the SDK's */}
  <Card />
</div>
```

Surfaces, type, colour, elevation and interaction states come from the SDK.
Where the boxes sit does not.

> **The demo obeys this.** `demo/IosenseDemo.tsx` is written entirely out of
> `Card` / `CardHeader` / `CardHeaderLeading` / `CardHeaderBadge` / `CardBody`,
> and `demo.css` is down to a grid, three type helpers and the assistant's
> gradient. It used to hand-roll `.demo-card` — which made the reference page
> contradict the rule it was supposed to demonstrate.

## 3.4 Scrolling

**The content area is the only thing that scrolls. The chrome never moves.**

| | Behaviour |
|---|---|
| Scroll container | `.app-main-scroll`, and nothing above it |
| Rail | fixed. Does not scroll with the page |
| Top bar | fixed. Does not scroll with the page |
| Document | does not scroll — the shell is locked to the viewport |
| Scrollbar | an **overlay**, drawn on top |
| Layout cost of the bar | **0px** — measured `offsetWidth − clientWidth = 0` |
| On navigation | **resets to the top** |

**Why the scroller is ours and not `<main>`.** `<main>` stays a positioned,
non-scrolling column so the overlay bars can be rendered as a *sibling* of the
scroller rather than a child of it. That is what lets the thumb sit still while
the content moves under it — anchoring the bars to `<main>` let the thumb run up
over the sheet's top edge.

**Why the bar costs nothing.** `scrollbar-width: none` plus a hidden
`::-webkit-scrollbar`, with fds's overlay thumb painted on top. A native gutter
would appear and disappear as pages start and stop overflowing, moving all your
content sideways by ~15px each time. Measured: `clientWidth` and `offsetWidth`
are both 1190 — the bar takes nothing.

**A new page starts at the top.** The shell resets `scrollTop` when `activeId`
changes. Without it the offset simply persists, and arriving 620px down a page
you have never seen reads as a broken render rather than as a scroll position —
which is exactly what it did before this was added.

It is keyed on `activeId`, not on `children`: `children` is a new element on
every render, so keying there would fight the reader for the scrollbar on any
parent state change. And it is instant rather than smooth — the page has already
been replaced, so animating to the top would scroll content nobody asked to see.

> If your app has its own router and you navigate **without** changing
> `activeId`, the reset will not fire. Change `activeId` on every navigation —
> the rail's active row and the breadcrumb depend on that too.

**Long content is your business, not the container's.** It does not cap height,
add its own inner scrollers, or virtualise. One scroll container, all the way
down.

## 3.5 How the code implements it

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

**What changed.** The rail's 22 hardcoded rows are gone. The demo carries a
six-row placeholder whose only job is to make the accordion, the section and the
collapse clickable; nothing is exported. `AppSideNav` now
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

`npm run storybook`. Four files, grouped by the component you actually mount —
not one per section of this document, and the difference is worth explaining.

```
stories/
  fixtures.tsx           small hand-written navs, a non-iosense logo, a frame
  SideNav.stories.tsx    §1   — 14 stories
  Rules.stories.tsx      §1.4 the guardrails — 8: sizes, states, collapsed/expanded
  TopNav.stories.tsx     §2   — 15: the toggle, every crumb case, the actions container
  Menus.stories.tsx      §2.3 — 10 stories, the two panels OPEN
  Shell.stories.tsx      §3 + the whole shell — 7, including Scrolling
```

54 stories. `Menus.stories.tsx` opens its panels with a `play` function on mount,
because a bell and an avatar shown closed tell you nothing about what they do —
and both are portalled, so those plays query `document.body` rather than the
canvas.

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
| §1 fixed rules | `IconSizeIsFixed` (8/32/64px glyphs all clamp to 14), `LabelIsOneLine`, `TypeScaleIsFixed`, `WhatYouControl` |
| §2.1 toggle | `ToggleWhenOpen`, `ToggleWhenCollapsed`, `ToggleOnMobile`, `ToggleOnMobileOpen` — the glyph and label flip to show what pressing it will *do* |
| §2.2 breadcrumbs | `OneCrumb`, `TwoCrumbs` (first is inert text), `ThreeCrumbs` (text → LINK → current), `LongCrumb` |
| §2.3 right edge | `RightEdge`, `WithActions`, `ActionsIsAContainer` (four things in the slot), `NoActions`, `NoUnread`, `ManyUnread`, `AvatarFallsBackToInitials` |
| §2.3 profile menu | `Trigger`, `Open` (Settings / Theme / Log Out), `OpenWithInitials`, `OpenOnDarkTheme`, `AppearancePicker` |
| §2.3 notifications | `NotificationsOpen`, `NotificationsEmpty`, `NotificationsOverflowing`, `NotificationsManyUnread`, `NotificationsNoUnread` |
| §3 content | `ContentSpacing`, `DenserContentSpacing`, `Scrolling` (chrome stays put; a new page starts at the top) |
| whole shell | `Default` (empty — what ships), `Branded`, `EveryRowType`, `DeepLinked` |

**The breadcrumb stories matter most.** `TwoCrumbs` and `ThreeCrumbs` are the
rule that is easiest to get wrong and hardest to notice when it is wrong — try
tabbing to the first crumb in either; you cannot, and that is the point.

**`Default` is the other one to read.** Both `Shell/Default` and
`Side nav/Default` show what the package ships with nothing passed in: an empty
rail, no footer, and design-sdk's own mark in the header. Everything in every
other story is a prop.
