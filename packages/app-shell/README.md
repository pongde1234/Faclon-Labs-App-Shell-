# @faclon-labs/app-shell

A sticky top bar, a collapsible sidebar, and a content area that scrolls
independently of both. **React and react-dom are the only runtime dependencies** —
there is no design system, component library, icon set or router underneath.

```bash
npm install @faclon-labs/app-shell
```

```tsx
import { AppShell, Breadcrumb, Grid, Card } from '@faclon-labs/app-shell'
import '@faclon-labs/app-shell/styles.css'

<AppShell
  navItems={nav}                    // the tree, as data — the shell renders no rows of its own
  currentPath={path}                // active state is derived, never stored
  linkComponent={Link}              // any component taking `href`; no router is imported
  brand={<><Logo /> Acme Corp</>}   // sidebar header — yours entirely
  footer={<HelpLink />}             // sidebar footer — yours entirely
  topNavContent={<Breadcrumb trail={trail} />}
  topNavActions={<Search />}        // extras, to the LEFT of the two below
  notifications={{ items, onSelect, onViewAll }}
  profile={{ user, actions }}
>
  <Grid>
    <Card title="Revenue">…</Card>
  </Grid>
</AppShell>
```

## What the shell owns, and what you own

| | |
|---|---|
| **Yours** | every nav row, the brand, the footer, page content, top-bar extras |
| **The shell's** | the layout, the collapse, the notifications bell, the profile avatar |

The bell and the avatar sit at the right edge in that fixed order so users moving
between applications find them in the same place. Neither renders without its prop.

## Layout, and why it is built this way

- The sidebar is `position: absolute`; the content is offset by `margin-left`
  alone. Flexing the two would make the content's width a function of the
  sidebar's, so every collapse would reflow the page.
- Collapsing animates the panel and the content **on one duration with `linear`
  easing**. They read as a single moving object, and any mismatch makes the
  content edge tear away mid-animation.
- Hovering a collapsed rail **peeks** it open over the page without moving the
  content. Only clicking pins it, and only pinning reflows.
- Nothing animates on first paint, so a shell rendered already-collapsed does not
  play an opening animation on every load.

## Spacing

`<main>` is a flex column with a 16px gutter and a 16px gap, and it zeroes the UA
margins on block elements inside it — so identical content cannot space
differently depending on which tag came first. Use `Stack`, `Grid` and `Card` for
anything deeper: their gaps come from the same scale, and `Grid` reflows by item
width so it has no breakpoints to get wrong.

## Theming

Every value is a `--shell-*` custom property declared on the global `.appShell`
class. Override them anywhere; do not patch the CSS.

```css
.appShell { --shell-accent: #7c3aed; --shell-nav-width: 280px; }
```

Only a light palette ships. `prefers-reduced-motion` is honoured by retuning the
duration tokens to `0.01ms` — not to zero, because `transitionend` still has to
fire.

## Accessibility

`<header>` and `<nav aria-label="Main">`; a skip link as the first focusable
element; `aria-current="page"` on the active row; `aria-expanded` +
`aria-controls` on expandable parents; expand triggers are `<button>` and
navigation is `<a>`, never a clickable `<div>`; a visible `:focus-visible` ring
throughout; the mobile drawer traps focus, restores it on close and closes on
Escape.

## Known limits

- **Nesting is capped at 3 levels.** A 4th throws a named error in development
  rather than rendering something broken.
- **`side="right"`** positions the panel correctly, but row icons do not hold
  still through a collapse the way they do on the left — the panel is pinned by
  its outer edge, and on the right that is not the edge icons are measured from.
- **The controlled drawer is dismissal-only.** `isSidebarOpen` + `onSidebarDismiss`
  let you close it; opening it is your control's job. Leave `isSidebarOpen`
  undefined and the shell's own button does both.
- **No responsive-array props on `Box`.** Responsive behaviour lives in the
  stylesheets.
