/**
 * The iosense application chrome, as shipped in the product.
 *
 * UNLIKE @faclon-labs/app-shell, this is NOT dependency-free — it is built on
 * @faclon-labs/design-sdk and @faclon-labs/fds and inherits their tokens and
 * behaviour. That is the point of it existing separately: the two packages
 * answer different questions, and mixing them would force one of them to give
 * up its defining property.
 *
 *   @faclon-labs/app-shell      react only, own tokens, portable
 *   @faclon-labs/iosense-shell  the SDK's components, the product's look
 */
export { AppSideNav, WORKFLOW_PAGE_IDS, REPORT_PAGE_IDS } from './AppSideNav'
export { AppTopBar } from './AppTopBar'
export type { Crumb } from './AppTopBar'
export { AppNavDrawer } from './AppNavDrawer'
export { NotificationMenu } from './NotificationMenu'
export { ProfileMenu } from './ProfileMenu'
export { WorkspaceLabel } from './WorkspaceSwitcher'
export { useIsMobile } from './useIsMobile'
export { useAppTheme } from './useAppTheme'
export { THEMES, themeLabel } from './themes'
export type { ThemePreference } from './useAppTheme'
export type { Profile } from './profile'
export type { AppNotification } from './notifications'
