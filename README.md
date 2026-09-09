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
  buildTrail,
  useProfile,
  useNotifications,
} from '@faclon-labs/iosense-shell'

// The three stylesheets, in THIS order. See "The stylesheet contract" below —
// getting it wrong does not throw, it just degrades.
import '@faclon-labs/design-sdk/styles.css'
import '@faclon-labs/fds/styles.css'
import '@faclon-labs/iosense-shell/theme-overrides.css'

const PAGE_TITLES: Record<string, string> = { home: 'Overview', devices: 'Devices' /* … */ }

export default function App() {
  const [activeId, setActiveId] = useState('home')
  const { profile } = useProfile()
  const notifications = useNotifications()
  const title = PAGE_TITLES[activeId] ?? ''

  return (
    <IosenseShell
      activeId={activeId}
      onNavigate={setActiveId}
      trail={buildTrail(activeId, title, { pageTitles: PAGE_TITLES })}
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
AppTopBar.tsx       breadcrumbs, notifications, profile
AppNavDrawer.tsx    the mobile drawer
RailFlyout.tsx      the collapsed rail's sub-menu
MaybeTooltip.tsx    a tooltip that can be switched off
NotificationMenu    ProfileMenu    AppearanceModal    ThemeTiles
trail.ts            buildTrail / resolveSection — the breadcrumb RULE
useAppTheme  useIsMobile  useProfile  useNotifications  themes
```

## The content container

`IosenseShell` renders your `children` inside `.app-main-scroll`, which carries
**`padding-inline: 16px`**. Page roots are expected to carry `padding: 16px 0`.
That split is deliberate and is the whole of the 16px-on-all-four-sides rule —
change one side and you must change the other, or the sheet goes lopsided.

16px rather than 12 is not a taste call: the top bar's breadcrumb is inset 16px
from the same column, so page content and the bar's first glyph share a left
edge. Measured at 17px on every side — the 16 plus the sheet's own 1px border.

Content generated into this area should never set its own outer margin. Let the
rhythm come from the container and from `Stack`/`Grid`/`Card`, so it holds at
every nesting depth.

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
