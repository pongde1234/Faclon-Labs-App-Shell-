import { useCallback, useEffect, useState } from 'react'

/**
 * Light and dark come straight from the SDK's own token sets. 'brand' is the
 * classic Faclon theme: the SDK ships no brand tokens, so it is authored in
 * theme-overrides.css — a navy rail over the unchanged light page.
 */
export type ThemePreference = 'light' | 'dark' | 'brand' | 'system'
export type ResolvedTheme = 'light' | 'dark' | 'brand'

const STORAGE_KEY = 'iosense:theme'

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Only 'system' is derived; the rest name a theme directly. */
function resolve(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : preference
}

/**
 * The SideNavBar provider takes its own capitalised theme name, and its union is
 * 'Light' | 'Dark' — there is no 'Brand' to pass. 'Dark' is the right base
 * anyway: brand hands the rail the SDK's dark structural rules (white labels,
 * dark-surface states) and then retints the nine provider tokens over the top,
 * which is exactly what `:root[data-theme='brand'] .fds-sidenav-provider` does.
 */
export function railThemeFor(resolved: ResolvedTheme): 'Light' | 'Dark' {
  return resolved === 'light' ? 'Light' : 'Dark'
}

/**
 * Applies the theme by stamping `data-theme` on the document root, which is what
 * switches the SDK's full token set (`:root[data-theme=dark]` — surfaces, text,
 * borders). fds reads the same attribute (its palette is scoped
 * `[data-theme="dark"], [data-color-scheme="dark"]`), so one attribute drives
 * both packages. `<AppShell theme="Dark">` is NOT the app-level switch: it puts the
 * attribute on the sidenav provider, which carries only a partial set, so card
 * surfaces would stay light while text flipped to white.
 *
 * Returns the RESOLVED theme too, because the rail runs its own nested provider
 * and has to be handed whatever 'system' just resolved to.
 */
export function useAppTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    // 'classic' was this theme's earlier name — the brand rail over light content.
    if (stored === 'classic') return 'brand'
    return (stored as ThemePreference | null) ?? 'light'
  })
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolve(preference))

  useEffect(() => {
    const apply = () => {
      const next = resolve(preference)
      setResolved(next)
      document.documentElement.dataset.theme = next
    }
    apply()
    localStorage.setItem(STORAGE_KEY, preference)

    if (preference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference])

  return { preference, setPreference: useCallback(setPreference, []), resolved }
}
