# @faclon-labs/iosense-shell

The iosense application chrome, extracted as a package. This repository is the
package — there is nothing else in it.

The iosense application chrome, as shipped in the product: the collapsible rail,
the top bar, and the notification, profile and theme menus.

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
  useNotifications,
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
  const notifications = useNotifications()
  const title = PAGE_TITLES[activeId] ?? ''

  return (
    <IosenseShell
      navItems={NAV}
      logo={<YourLogo />}
      sideNavFooter={<NavFooterRow icon={<CircleQuestionMark size={14} />} label="Help" />}
      activeId={activeId}
      onNavigate={setActiveId}
      trail={buildTrail(activeId, title, { items: NAV, pageTitles: PAGE_TITLES })}
      profile={profile}
      notifications={notifications.items}
      unreadCount={notifications.unreadCount}
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

- hover peek at 150/100ms that widens the panel **without moving the page**
- a tooltip only when a label is genuinely unreadable — the 48px strip, or an ellipsis
- an accordion that opens itself when a child becomes active, so a deep link never lands hidden
- a flyout beside the strip when there is nowhere to unfold into
- a badge that becomes a dot on the icon when the rail collapses
- a section that force-expands while collapsed, because a folded one there is a hairline that strands its icons

Three row shapes:

| Shape | Written as | Notes |
|---|---|---|
| **Entity** | `{ id, label, icon, badge? }` | the plain row |
| **Accordion** | `{ id, label, icon, children: [] }` | the parent row *is* the toggle; only accordions appear in the breadcrumb trail |
| **Section** | `{ kind: 'section', id, label, items: [] }` | a labelled group that folds; **never** a breadcrumb ancestor |

The trailing `badge` is either a **Counter** (a quantity — `{ kind: 'count', value: 12, tone: 'info' }`)
or a **Badge** (a word — `{ kind: 'word', label: 'Beta', tone: 'label' }`). Not a
Chip: Chip renders a `<button>` and the row is already a `<button>`.

`IOSENSE_NAV` is a complete worked example — every row type, both badge kinds,
two accordions and a section. **Copy it, don't import it**, unless you are
iosense: it is our pages, and shipping them inside someone else's app is the
mistake this export exists to prevent.

`buildTrail` reads the **same array**, so the trail and the rail cannot drift
apart — there is one definition of what contains what.

> **Set `logo`.** Left unset, design-sdk falls through to its own built-in
> iosense mark, so an unbranded install silently ships our identity.

## Everything else is empty too

The nav is not the only place this applies. Every piece of iosense *content* is
now a seed you pass, never a default you inherit:

| Hook | Default | The iosense sample |
|---|---|---|
| `useProfile(seed?)` | `EMPTY_PROFILE` — blank | `IOSENSE_PROFILE` |
| `useNotifications(seed?)` | `[]` | `IOSENSE_NOTIFICATIONS` |
| `AppSideNav items` | `[]` | `IOSENSE_NAV` |
| `AppSideNav footer` | nothing rendered | `NavFooterRow` with Help |
| `AppSideNav logo` | design-sdk's iosense mark | — |

`useProfile()` used to default to a real person — a name, a phone number and a
working email address — which every install would then have carried. The
`IOSENSE_*` constants exist so that shipping our content is something you have to
*type*, rather than something that happens because you did not.

The hooks are a convenience for hosts with no account or notifications API of
their own. If you have real data, skip them and pass it straight to
`IosenseShell`.

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
AppSideNav.tsx      the rail — nested groups, flyouts, badges, hover peek
navItems.ts         the nav DATA MODEL — entity / accordion / section
iosenseNav.tsx      IOSENSE_NAV — a worked example, not a default
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

- **The application launcher** (the grid of apps) and **the assistant button**.
  Both are product surfaces rather than chrome: one opens an assistant this
  package knows nothing about, the other lists applications only the host can
  enumerate. `AppTopBar` takes an `actions` slot instead — pass your own.

## Behaviour worth knowing

- **The rail peeks on hover and pins on click**, and the two are different
  states. A peek widens `.fds-sidenav__inner` over the page while the footprint
  stays 48px, so the content does not move. Only pinning sets
  `data-sidenav-pinned`, which is what widens the footprint and reflows the page.
- **The peek is owned in React, not by the SDK.** Both state objects strip the
  SDK's own `data-hovered` and a peek is expressed as `data-state="expanded"`.
  Without that the component could not know it was expanded, and every
  behaviour keyed on `isPinned` was wrong during a hover — tooltips fired on
  rows whose labels were plainly readable, and the organisation name stayed
  hidden.
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
