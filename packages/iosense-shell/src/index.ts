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

// ── The nav, as data ─────────────────────────────────────────────────────────
// The rail renders whatever you give it and renders NOTHING by default. This
// package ships the rail's BEHAVIOUR — hover peek, the tooltip that only fires
// on an unreadable label, the accordion that opens on a deep link, the flyout
// in the 48px strip, the badge that becomes a dot — none of which depends on
// which rows are in it.
export { isSection, isAccordion, navPageIds, navParents, NAV_ICON_SIZE } from './navItems'
export type { NavItem, NavEntity, NavAccordion, NavSection, NavBadge, NavTone } from './navItems'

// NO SAMPLE NAV IS EXPORTED, deliberately. The rows we built are the iosense
// product's pages — Zomato, Steam Trap, Memory B — and a package that exported
// them would put them into every install that forgot to pass its own. They live
// in `demo/iosenseNav.tsx`, where they are demo content and nothing else.
//
// What ships is the model (above) and the behaviour. Copy the demo's file as a
// starting point if you want one.

// ── The pieces, for hosts that assemble their own ────────────────────────────
export { AppSideNav, NavFooterRow } from './AppSideNav'
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
export { buildTrail, resolveSection } from './trail'
export type { BuildTrailOptions } from './trail'

// ── State the chrome's required props need ───────────────────────────────────
//
// ONLY what the chrome itself uses. This block used to carry GENDERS, LOCATIONS,
// MAX_AVATAR_BYTES, readFileAsDataUrl, greeting, dayLabel and timeLabel — the
// options, upload helpers and date formatters for the app's Profile and
// Notifications PAGES. Those pages are not chrome, no component here touched any
// of them, and exporting them told a consumer this package would help build
// screens it knows nothing about.
export { useProfile, EMPTY_PROFILE, fullName } from './profile'
export type { Profile } from './profile'
export { useNotifications } from './useNotifications'
// KIND_LABEL and KIND_COLOR stay: they are the vocabulary of the notification
// kinds you have to supply, and the menu renders from them.
export { KIND_LABEL, KIND_COLOR } from './notifications'
export type { AppNotification, NotificationKind, Remark } from './notifications'

// ── Theme ────────────────────────────────────────────────────────────────────
// The language picker went the same way as the page helpers above: nothing in
// the chrome renders one, and the app had no i18n layer behind it either.
export { useAppTheme, railThemeFor } from './useAppTheme'
export type { ThemePreference, ResolvedTheme } from './useAppTheme'
export { THEMES, themeLabel } from './themes'

// ── Utilities ────────────────────────────────────────────────────────────────
export { useIsMobile } from './useIsMobile'
