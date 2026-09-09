/**
 * The package entry.
 *
 * Everything a consumer needs and nothing they don't: the internals — the focus
 * trap, the contexts, the icon set — stay unexported so they can change without
 * being a breaking change.
 */

export { AppShell } from './AppShell'

/** The layout primitive. Box is token-restricted and is what you should use;
    BaseBox takes raw CSS values and is the escape hatch. */
export { Box } from './Box'
export { BaseBox } from './BaseBox'
export type { BoxProps } from './Box'
export type { BaseBoxProps } from './BaseBox'

/**
 * The layout vocabulary for page content.
 *
 * These exist so generated dashboards cannot express inconsistent spacing:
 * every gap comes from the token scale, and Grid reflows without breakpoints.
 * Prefer them over bare divs inside the content area.
 */
export { Stack } from './Stack'
export { Grid } from './Grid'
export { Card } from './Card'
export type { StackProps } from './Stack'
export type { GridProps } from './Grid'
export type { CardProps } from './Card'
export type {
  ColorToken, ElevationToken, FontSizeToken, FontWeightToken,
  LayerToken, RadiusToken, SizeToken, SpacingToken,
} from './boxTokens'
export { TopNav, TopNavBrand, TopNavContent, TopNavActions } from './TopNav'
export { SideNav, SideNavBody, SideNavBrand, SideNavSection, SideNavFooter } from './SideNav'
export { SideNavLink } from './SideNavLink'
export { collectHrefs } from './navTree'
export { Breadcrumb } from './Breadcrumb'
export { Menu, MenuHeader, MenuItem, MenuList, MenuSeparator } from './Menu'
export { NotificationsMenu } from './NotificationsMenu'
export { ProfileMenu } from './ProfileMenu'
export type { ProfileAction } from './ProfileMenu'

/** The glyphs the shell draws with, in case a consumer wants to match them. */
export { BellIcon, ChevronIcon, CloseIcon, HelpIcon, PanelIcon, SeparatorIcon } from './icons'

export type {
  AppShellProps,
  Crumb,
  LinkComponent,
  NavItem,
  NavSection,
  ShellNotification,
  ShellUser,
} from './types'
