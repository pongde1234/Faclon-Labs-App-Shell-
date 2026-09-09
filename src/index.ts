/**
 * The iosense application chrome, as shipped in the product.
 *
 * This package is NOT dependency-free — it is built on @faclon-labs/design-sdk
 * and @faclon-labs/fds and inherits their tokens and behaviour. Both, plus
 * lucide-react, are peer dependencies.
 *
 * START HERE: `IosenseShell` is the whole chrome assembled — rail, top bar,
 * mobile drawer, menus, and the content sheet with its 16px inset and overlay
 * scrollbar. Mounting the individual pieces yourself is supported but is NOT
 * equivalent: the content-area styling in theme-overrides.css keys off markup
 * that only `IosenseShell` renders. See its doc comment.
 *
 * Import the stylesheet LAST, after @faclon-labs/fds/styles.css:
 *
 *     import '@faclon-labs/fds/styles.css'
 *     import '@faclon-labs/iosense-shell/theme-overrides.css'
 */

// ── The assembly ─────────────────────────────────────────────────────────────
export { IosenseShell } from './IosenseShell'
export type { IosenseShellProps } from './IosenseShell'

// ── The pieces, for hosts that assemble their own ────────────────────────────
export { AppSideNav, WORKFLOW_PAGE_IDS, REPORT_PAGE_IDS } from './AppSideNav'
export type { AppSideNavProps } from './AppSideNav'
export { AppTopBar } from './AppTopBar'
export type { Crumb, AppTopBarProps } from './AppTopBar'
export { AppNavDrawer } from './AppNavDrawer'
export { NotificationMenu } from './NotificationMenu'
export { ProfileMenu } from './ProfileMenu'
export { WorkspaceLabel } from './WorkspaceSwitcher'

// ── Breadcrumbs ──────────────────────────────────────────────────────────────
// The RULE, not just the renderer: `buildTrail` is what decides which crumb has
// no id, and an id-less crumb is what AppTopBar draws as plain text.
export { buildTrail, resolveSection, RECORD_PARENT, SECTION_DEFAULT } from './trail'
export type { BuildTrailOptions } from './trail'

// ── State the chrome's required props need ───────────────────────────────────
export { useProfile, DEFAULT_PROFILE, fullName, readFileAsDataUrl, GENDERS, LOCATIONS, MAX_AVATAR_BYTES } from './profile'
export type { Profile } from './profile'
export { useNotifications } from './useNotifications'
export {
  NOTIFICATIONS,
  KIND_LABEL,
  KIND_COLOR,
  greeting,
  dayLabel,
  timeLabel,
} from './notifications'
export type { AppNotification, NotificationKind, Remark } from './notifications'

// ── Theme ────────────────────────────────────────────────────────────────────
export { useAppTheme, railThemeFor, useAppLanguage, LANGUAGES } from './useAppTheme'
export type { ThemePreference, ResolvedTheme, LanguageCode } from './useAppTheme'
export { THEMES, themeLabel } from './themes'

// ── Utilities ────────────────────────────────────────────────────────────────
export { useIsMobile } from './useIsMobile'
