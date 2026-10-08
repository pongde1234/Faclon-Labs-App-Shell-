# @faclon-labs/iosense-shell

The iosense application chrome, extracted as a package. This repository is the
package — there is nothing else in it.

The iosense application chrome, as shipped in the product: the collapsible rail,
the top bar, the notification bell, and the profile and theme menus.

**This package is not dependency-free**, and that is the point of it being
separate. It is built on `@faclon-labs/design-sdk` and `@faclon-labs/fds` and
inherits their components, tokens and behaviour.

| | |
|---|---|
| `@faclon-labs/app-shell` | react only, its own tokens, portable to any product |
| `@faclon-labs/iosense-shell` | the SDK's components, the product's exact look |

Pick the first if you want a shell. Pick this one if you want *this* shell.

## Usage

```tsx
import {
  IosenseShell,
  NavFooterRow,
  buildTrail,
  useProfile,
  type NavItem,
} from '@faclon-labs/iosense-shell'
import { House, HardDrive, FileText, CircleQuestionMark } from 'lucide-react'

// The three stylesheets, in THIS order. See "The stylesheet contract" below —
// getting it wrong does not throw, it just degrades.
import '@faclon-labs/design-sdk/styles.css'
import '@faclon-labs/fds/styles.css'
import '@faclon-labs/iosense-shell/theme-overrides.css'

// YOUR nav. The rail renders nothing until you give it rows — see "The nav is
// yours" below.
const NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: <House size={14} /> },
  {
    id: 'reports',
    label: 'Reports',
    icon: <FileText size={14} />,
    children: [{ id: 'reports-scheduled', label: 'Scheduled', icon: <FileText size={14} /> }],
  },
  {
    kind: 'section',
    id: 'connect',
    label: 'Connect',
    items: [{ id: 'devices', label: 'Devices', icon: <HardDrive size={14} /> }],
  },
]

const PAGE_TITLES: Record<string, string> = { home: 'Overview', devices: 'Devices' /* … */ }

export default function App() {
  const [activeId, setActiveId] = useState('home')
  const { profile } = useProfile()
  const title = PAGE_TITLES[activeId] ?? ''

  return (
    <IosenseShell
      navItems={NAV}
      logo={<YourLogo />}
      sideNavFooter={<NavFooterRow icon={<CircleQuestionMark size={14} />} label="Help" />}   {/* optional */}
      activeId={activeId}
      onNavigate={setActiveId}
      trail={buildTrail(activeId, title, { items: NAV, pageTitles: PAGE_TITLES })}
      profile={profile}
      unreadCount={unread}
      onOpenNotifications={() => setActiveId('notifications')}
    >
      <YourPage />
    </IosenseShell>
  )
}
```

## The nav is yours

**The rail ships empty.** This package is the chrome's *behaviour*, not its
contents — and none of that behaviour depends on which rows are in it:

- a keyboard peek at 150/100ms that widens the panel **without moving the page** — hover does not open it
- a tooltip only when a label is genuinely unreadable — the 48px strip, or an ellipsis
- an accordion that opens itself when a child becomes active, so a deep link never lands hidden
- a flyout beside the strip when there is nowhere to unfold into
- a badge that becomes a dot on the icon when the rail collapses
- a section that always shows its rows — the label is a caption, not a control

Three row shapes:

| Shape | Written as | Notes |
|---|---|---|
| **Entity** | `{ id, label, icon, badge? }` | the plain row |
| **Accordion** | `{ id, label, icon, children: [] }` | the parent row *is* the toggle; only accordions appear in the breadcrumb trail |
| **Section** | `{ kind: 'section', id, label, items: [] }` | a labelled group; the label is a caption, it does **not** fold; **never** a breadcrumb ancestor |

The trailing `badge` is either a **Counter** (a quantity — `{ kind: 'count', value: 12, tone: 'info' }`)
or a **Badge** (a word — `{ kind: 'word', label: 'Beta', tone: 'label' }`). Not a
Chip: Chip renders a `<button>` and the row is already a `<button>`.

**No sample nav is exported.** A shell has no opinion about what your pages are.
The demo does render a full rail — the iosense product's 22 pages — but from
`demo/iosenseNav.tsx`, a file in the repo that no consumer installs. That split
is the arrangement this package asks of you: the rows are yours, the behaviour
is ours.

What the rail *does* with the rows you pass is also written down:
[STORY.md](../../STORY.md) §1.2 and §1.4 specify it, `guards/NavItems.guard.json`
contracts it, and `stories/SideNav.stories.tsx` and `stories/Rules.stories.tsx`
exercise every case against their own fixtures.

`buildTrail` reads the **same array**, so the trail and the rail cannot drift
apart — there is one definition of what contains what.

> **Set `logo`.** Left unset, design-sdk falls through to its own built-in
> iosense mark, so an unbranded install silently ships our identity.

## Everything else is empty too

The nav is not the only place this applies. Every piece of content is a seed you
pass, never a default you inherit:

| Slot / hook | Default |
|---|---|
| `AppSideNav items` | `[]` — an empty rail |
| `AppSideNav footer` | nothing rendered, and no divider above it |
| `AppSideNav logo` | design-sdk's built-in iosense mark — **set this** |
| `AppTopBar actions` | empty; the bell and the avatar are all the bar shows |
| notifications **panel** | **not shipped** — the bell hands you the click, see STORY.md §2.3 |
| `useProfile(seed?)` | `EMPTY_PROFILE` — blank |
| `IosenseShell children` | empty; the content container is yours to fill |

`useProfile()` used to default to a real person — a name, a phone number and a
working email address — which every install would then have carried. Nothing
does now: shipping content is something you have to *type*.

`useProfile` is a convenience for a host with no account API of its own. If you
have a real user, skip it and pass them straight to `IosenseShell`.

> Local storage keys are still namespaced `iosense:` — the rail's pinned state,
> its open groups, the profile and the theme. Harmless, but they are ours, and
> worth renaming if this package is ever published outside Faclon.

`IosenseShell` is the whole chrome assembled. **Mounting `AppSideNav` and
`AppTopBar` yourself is supported but is not equivalent** — the content area's
styling in `theme-overrides.css` keys off markup and attributes only
`IosenseShell` renders:

```
.fds-app-shell[data-topbar='column']   the bar sits above the content sheet
[data-sidenav-pinned='true'] …         the pinned-rail offset and shadow
.app-scroll-frame > .app-main-scroll   the 16px inset and the overlay scrollbar
```

Hand-assemble it and miss one, and you get a shell that looks nearly right and
is not: no content inset, a native scrollbar, no rail offset.

## The theme defaults to light

Four choices — `light`, `dark`, `brand` (a light page with a navy rail) and
`system`. **A first run gets `light`, never `system`, and never the OS setting.**

`system` hands the product's appearance to something the product cannot see and
nobody involved chose: the same install then looks different on two machines,
and a screenshot in a bug report may not match what anyone else sees. Light is
also what every surface is designed and reviewed against.

Verified with `prefers-color-scheme` forced to dark and localStorage empty:
stored `light`, `data-theme="light"`, main background `rgb(247, 247, 247)`.

An explicit choice still wins and persists — a default that cannot be changed is
not a default. `system` stays in the picker for anyone who wants it.

## The stylesheet contract

Three sheets, in this order, and the order is the whole of it:

1. `@faclon-labs/design-sdk/styles.css` — **required**. It is the only place
   `--spacing-*` and the SDK's component CSS are defined. Skip it and the rail
   renders as unstyled rows and the content sheet's `padding-inline` resolves
   against an undefined custom property, which makes the declaration invalid and
   drops the inset to **0** — silently, looking exactly like a shell that was
   never given any padding.
2. `@faclon-labs/fds/styles.css` — fds wins the ~69 token names both packages
   define.
3. `@faclon-labs/iosense-shell/theme-overrides.css` — **last**, and it must be
   imported *after* the component modules, not before. design-sdk injects each
   component's stylesheet when its module loads, so an import placed above
   `IosenseShell` lands earlier in the cascade and the SDK's rules win. Measured:
   with the sheet imported first, the pinned rail's 240px offset did not apply
   and the content sat at x=0 under the rail.

Fonts are the host's: the product uses Inter (`@fontsource/inter` 400/500/600/700).

## What is here

```
IosenseShell.tsx    the assembly — rail + bar + drawer + content sheet
AppSideNav.tsx      the rail — nested groups, flyouts, badges, keyboard peek
navItems.ts         the nav DATA MODEL — entity / accordion / section
(no sample nav ships — the demo has a placeholder one)
AppTopBar.tsx       breadcrumbs, notifications, profile
AppNavDrawer.tsx    the mobile drawer
RailFlyout.tsx      the collapsed rail's sub-menu
MaybeTooltip.tsx    a tooltip that can be switched off
NotificationMenu    ProfileMenu    AppearanceModal    ThemeTiles
trail.ts            buildTrail / resolveSection — the breadcrumb RULE
useAppTheme  useIsMobile  useProfile  useNotifications  themes
```

## The content container

`IosenseShell` renders your `children` inside `.app-main-scroll`, which owns the
whole spacing rule:

| | Value | Why |
|---|---|---|
| left / right | **16px** | the top bar's breadcrumb is inset 16px from the same column, so page content and the bar's first glyph share a left edge |
| top | **16px** | separates the first block from the bar |
| **bottom** | **none** | this is the scroll container. A scrolling column has no bottom to pad — it has a cut-off |
| between blocks | **16px** | supplied by the container, so content that says nothing about spacing still comes out right |

**Your page roots add nothing.** One element owns all three sides, so there is
no second declaration to keep in sync:

```tsx
<IosenseShell {...rest}>
  <YourPage />           {/* no wrapper, no padding, no margin */}
</IosenseShell>
```

Both values are custom properties, so override them when a page genuinely wants
a different density — but inheriting is the default and overriding is a
decision:

```css
.dense-page .app-main-scroll { --shell-content-gap: 8px; }
```

**Everything you render in here comes from the SDK** — `Card`, `Table`, `Chart`,
`EmptyState`, `Alert`, `Button`, `TextInput`, `Badge` and the rest of
`@faclon-labs/design-sdk` and `@faclon-labs/fds`. A div styled to look like a
card will not follow a theme switch, will not track the real card when it
changes, and will not match the page written next month.

**Layout is the exception.** Arranging those components — a grid of cards, a
two-column row — is yours, because the SDK ships no layout primitive for it and
inventing one here would be a second opinion about spacing:

```tsx
<div className="cards-grid">   {/* layout: yours */}
  <Card />                     {/* surface: the SDK's */}
</div>
```

Do not re-style an SDK component to make it fit, either — an overridden card is
a fork of the card and stops tracking the original. Use the props it offers; if
none of them fit, it is probably the wrong component. Full rule in
[STORY.md](../../STORY.md) §3.3.

Content should not set its own outer margin. Let the rhythm come from the
container and from `Stack`/`Grid`/`Card`, so it holds at every nesting depth.
This matters most because **this container takes generated dashboards** — a
generator that has to remember margins gets it wrong at some depth; a container
that supplies the rhythm cannot.

> The gap is `> * + *`, not `display: flex; gap`. Flex would make every child a
> flex item with `flex-shrink: 1`, so a tall page would be squashed to fit
> instead of overflowing — the one thing a scroll container must not do.

Full rationale in [STORY.md](STORY.md) §3.

## Deliberately NOT exported

- **The applications themselves**, and **the assistant button**. Which products
  exist and which a given user may open is something only the host can answer,
  and the assistant opens something this package knows nothing about. The
  launcher *panel* does ship — see below — but its `apps` are a prop, and the
  assistant arrives whole through the top bar's `assistant` slot.

## Behaviour worth knowing

- **A tile label is TWO lines, then truncated, with the full name on hover.** The
  tooltip fires only when the name is actually cut — the same rule the rail
  states, and a tooltip repeating visible text is noise. `useLabelClipped` in
  `AppLauncher.tsx` measures it; `MaybeTooltip` does the suppression, because
  fds's Tooltip has no `isDisabled`.

  It briefly wrapped to two lines instead, which fit more names whole (14 of
  18 against 9) at the cost of a tile taller than it was wide. One line won on
  the shape of the grid.

- **Launcher tiles have a hover state and nothing else.** No selected, no
  current-app marking. They are links out to other applications, and the
  component cannot honestly tell an application from a page inside one — it is
  handed ids. The demo proves the hazard: `steamtrap` is both an app id and a
  nav route, so an `aria-current` wash (since removed, with the `activeId`
  prop) lit that tile permanently once you had opened it.

  The keyboard focus ring is NOT that, and stays. The panel moves focus to the
  first tile when it opens, so that ring can appear on open.

- **The launcher shows every app it is given, then an Apps tile, and scrolls.**
  No cap. The grid renders `apps` in order — order is your priority signal; the
  launcher never reorders — and `onManage` puts a button in a pinned footer
  that opens the **App Center**. Its label follows the job: **Add applications**
  when the grid is empty, **Manage applications** when it is not, with the glyph
  matching. The footer is outside the
  scroller, so flex holds it still while the grid moves; the panel itself is
  capped at **70vh**, which is a cap and not a height, so a short launcher stays
  short.

  It briefly capped at 8 with the tile as a ninth cell, for a fixed 3×3. That
  went when `apps` stopped being a whole catalogue and became **your chosen
  quick-access set** — there is nothing to protect the panel from when the list
  is one you picked, and the cap's cost was putting your ninth app two clicks
  away.

- **`AppCenter` is where applications are added and removed.** It ships with the
  window, the filtering and a two-action model: an app's `isAdded` decides
  whether its button reads **Remove** or **Add**, and that is the whole of the
  state. (It briefly carried `available | connected | needs-reconnect`, a
  Connected/Disconnected tab pair and a status badge per row; all three went,
  because the shell has no connection to lose and a "disconnected" state was
  chrome describing a condition nothing here can observe or repair.) The
  catalogue itself is yours: pass `apps` and `categories`, and every press comes
  back through `onAppAction(id, action)` where `action` is `'add'` or
  `'remove'`. Filtering is client-side over the array you pass, which suits tens
  of apps rather than thousands.

- **The top section is "Your apps".**
  `isAdded` is the only promotion there is: an added app leaves its category
  section, moves to the top, and appears in the launcher outside. A static
  `isFeatured` used to sit beside it — two ways to be promoted, with nothing to
  say which won when they disagreed.

  Third name it has had. "Quick access" named a category of thing rather than
  these apps; "In your launcher" said where they go but leaned on a word the
  reader never sees — nothing in the interface is labelled "launcher". The
  *where* lives in the note beneath instead, in the interface's own vocabulary
  ("Shown in the Applications menu"), which is also what stops **Remove**
  reading as delete or uninstall.

- **Array order IS the launcher's order.** No `order` field to keep in step.
  `onReorder` hands back the *complete* new list of added ids, so a host applies
  it verbatim instead of reconstructing an index. **Omit `onReorder` and nothing
  is draggable** — no handles, no drop targets, no keyboard move — because a
  rearrangement that silently snaps back is worse than a fixed list.

- **Rearranging is off while searching.** A filtered list hides rows, and
  dropping something "after the second one you can see" has no honest meaning
  when there are three you cannot. The handles disappear until the query clears.

- **`actions` lands in the icon group, and that group is the one to add to.**
  The bar is four containers: the toggle and trail, the assistant, **the icon
  group**, then the avatar. The grip and the bell share the icon group at a
  **2px** gap — fds's smallest step above zero, settled after trying 6, 2 and 0
  on screen. They are bare marks with no border or fill, so at 6px they stopped
  reading as one cluster; at 0 their 32px hover squares abutted. Anything added
  later goes in the same box and inherits that spacing; a host passes it through
  `actions` and needs to do nothing else.

  The avatar sits outside it, 8px clear. It is a filled circle with an image or
  initials against the others' line glyphs, so at the icons' spacing it ended
  the cluster on something that did not match it.

- **Reordering is POINTER-ONLY.** The row carries `draggable`; the grip beside
  it is a decorative `aria-hidden` span, not a control. There was a keyboard
  route — arrow keys on a focusable grip, announced through a live region — and
  it was removed by ruling. The grip was demoted with it: a focusable button
  with nothing behind it is a tab stop that answers no key and no click, which
  is worse than no button.

  Know what this costs: **a keyboard or screen-reader user cannot reorder at
  all**, and HTML5 drag does not fire on touch either, so the same is true on a
  tablet. If that matters, `@dnd-kit/sortable` (already an fds peer dep, not
  installed) brings keyboard and touch sensors with it.

- **One filter, fixed in place.** A search bar over the list, outside
  `.app-center__list` so it does not travel with the apps. Three filter rows
  have been through this window and gone: the Connected/Disconnected tabs with
  the status model, a "Works with" capability chip row after them, and the
  category rail last — it cost a permanent quarter of the window to narrow
  twenty apps the search already reaches. The categories remain as the section
  headings they always were.

- **Nothing found is an `EmptyState`, not a line of grey text.** fds's own
  component with `NoSearchResultIllustration` — the guard ties the picture to
  the *reason* a region is empty, and a "no data" drawing here would claim the
  catalogue is empty when the truth is the query is too narrow. **Clear
  filters** appears only when something is actually filtering.

- **`AppCenter.logo` has no fallback, unlike the rail's.** `IosenseShell.logo`
  falls through to design-sdk's built-in iosense mark when unset, which is how
  an unbranded install ships someone else's identity. Omit this one and the
  header is its title and subtitle alone.

- **Hover does not open the rail.** It opens from the top bar's toggle or
  Ctrl/Cmd+B, and peeks open when focus enters it from the keyboard — three
  states, not two. A peek widens `.fds-sidenav__inner` over the page while the
  footprint stays 48px, so the content does not move. Only pinning sets
  `data-sidenav-pinned`, which is what widens the footprint and reflows the page.
- **The peek is owned in React, not by the SDK.** Both state objects strip the
  SDK's own `data-hovered` and a peek is expressed as `data-state="expanded"`.
  Without that the component could not know it was expanded, and every
  behaviour keyed on `isPinned` was wrong while it was — tooltips fired on
  rows whose labels were plainly readable, and the organisation name stayed
  hidden. Stripping `data-hovered` is also what keeps the SDK's own
  hover-to-expand off, so removing our pointer handlers was enough to stop
  hover opening the rail — nothing had to be suppressed in CSS.
- **Tooltips appear only when a label is unreadable** — the 48px strip, or an
  expanded label truncated by an ellipsis. Never when the text is right there.
- **The collapse control lives in the top bar, not the rail.** A control that
  hides a panel cannot sit inside that panel: collapsed there are 48px and
  nowhere to put it.
- **Breadcrumb crumbs with no `href` are inert text.** Sections that are not
  pages are exactly that case; linking them to a first child moves the reader
  sideways when the crumb's job is to go up.

## theme-overrides.css

Shipped whole, at 1,586 lines, and **that is more than this package needs** —
roughly 100 lines are rail-specific, plus a top bar block. The rest are
app-wide SDK overrides that came with it.

It is included unsplit on purpose: the rail's geometry depends on cascade order
and on rules that do not mention the rail by name, so trimming it by grep would
risk a subtly broken panel. Splitting it is a follow-up worth doing against a
running page, not a search.
