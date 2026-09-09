# @faclon-labs/iosense-shell

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

```tsx
import { AppSideNav, AppTopBar, useIsMobile } from '@faclon-labs/iosense-shell'
import '@faclon-labs/iosense-shell/theme-overrides.css'
```

## What is here

```
AppSideNav.tsx      the rail — nested groups, flyouts, badges, hover peek
AppTopBar.tsx       breadcrumbs, notifications, profile
AppNavDrawer.tsx    the mobile drawer
RailFlyout.tsx      the collapsed rail's sub-menu
MaybeTooltip.tsx    a tooltip that can be switched off
NotificationMenu    ProfileMenu    AppearanceModal    ThemeTiles
useAppTheme  useIsMobile  themes  profile  notifications
```

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
