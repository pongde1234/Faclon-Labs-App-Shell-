/**
 * The token scales, and the ONLY place a token name becomes a CSS value.
 *
 * Every entry resolves to a `var(--shell-*)`, never to a literal — which is
 * what keeps the "no raw px or hex" rule true now that some styling has moved
 * out of CSS and into props. A consumer still themes by overriding the custom
 * property; these maps only decide which property a name points at.
 *
 * Its own module rather than living in Box.tsx: a non-component export in a
 * component file costs that file Fast Refresh.
 */

/**
 * Blade's dotted form — `padding="spacing.4"` — and not decoration.
 *
 * A bare numeric key (`4: '...'`) is inferred by TypeScript as the NUMBER 4,
 * which makes `padding="4"` a type error while `padding={4}` compiles. That
 * would split the API between quoted and unquoted props for no reason. The
 * prefix keeps every token on this Box a string, and it happens to be exactly
 * what Blade writes.
 *
 * `none` and `auto` stay unprefixed: they are CSS keywords, not steps on the
 * scale.
 */
export const SPACING = {
  none: '0',
  auto: 'auto',
  'spacing.1': 'var(--shell-space-1)',
  'spacing.2': 'var(--shell-space-2)',
  'spacing.3': 'var(--shell-space-3)',
  'spacing.4': 'var(--shell-space-4)',
  'spacing.5': 'var(--shell-space-5)',
  /** The gutter <main> holds around page content. */
  content: 'var(--shell-content-padding)',
  /** The gap between blocks inside <main>. */
  contentGap: 'var(--shell-content-gap)',
} as const

export const COLOR = {
  transparent: 'transparent',
  surface: 'var(--shell-bg)',
  navSurface: 'var(--shell-nav-bg)',
  topnavSurface: 'var(--shell-topnav-bg)',
  menuSurface: 'var(--shell-menu-bg)',
  scrim: 'var(--shell-scrim-bg)',
  border: 'var(--shell-border)',
  text: 'var(--shell-text)',
  textMuted: 'var(--shell-text-muted)',
  textOnAccent: 'var(--shell-text-on-accent)',
  accent: 'var(--shell-accent)',
  danger: 'var(--shell-danger)',
} as const

export const RADIUS = {
  none: '0',
  sm: 'var(--shell-radius-sm)',
  md: 'var(--shell-radius-md)',
  lg: 'var(--shell-radius-lg)',
  round: '50%',
} as const

export const SIZE = {
  none: '0',
  auto: 'auto',
  full: '100%',
  topnavHeight: 'var(--shell-topnav-height)',
  navWidth: 'var(--shell-nav-width)',
  navWidthXl: 'var(--shell-nav-width-xl)',
  navWidthCollapsed: 'var(--shell-nav-width-collapsed)',
  navItemHeight: 'var(--shell-nav-item-height)',
  navIconSize: 'var(--shell-nav-icon-size)',
  menuWidth: 'var(--shell-menu-width)',
  /** The viewport minus the top bar — the content area's height. */
  belowTopnav: 'calc(100vh - var(--shell-topnav-height))',
} as const

export const ELEVATION = {
  none: 'none',
  menu: 'var(--shell-menu-shadow)',
  focusRing: 'var(--shell-focus-ring)',
} as const

/** Named layers, so no call site invents a z-index. */
export const LAYER = {
  topnav: 'var(--shell-z-topnav)',
  scrim: 'var(--shell-z-scrim)',
  drawer: 'var(--shell-z-drawer)',
  menu: 'var(--shell-z-menu)',
  skipLink: 'var(--shell-z-skiplink)',
} as const

export const FONT_SIZE = {
  sm: 'var(--shell-font-size-sm)',
  md: 'var(--shell-font-size)',
  lg: 'var(--shell-font-size-lg)',
} as const

export const FONT_WEIGHT = {
  regular: '400',
  medium: 'var(--shell-font-weight-medium)',
  semibold: 'var(--shell-font-weight-semibold)',
} as const

export type SpacingToken = keyof typeof SPACING
export type ColorToken = keyof typeof COLOR
export type RadiusToken = keyof typeof RADIUS
export type SizeToken = keyof typeof SIZE
export type ElevationToken = keyof typeof ELEVATION
export type LayerToken = keyof typeof LAYER
export type FontSizeToken = keyof typeof FONT_SIZE
export type FontWeightToken = keyof typeof FONT_WEIGHT
