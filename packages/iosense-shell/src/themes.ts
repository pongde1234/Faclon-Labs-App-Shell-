import type { ComponentType } from 'react'
import { Monitor, Moon, Palette, Sun } from 'lucide-react'

import type { ThemePreference } from './useAppTheme'

/**
 * The themes, and the single source for them.
 *
 * Its own module rather than living beside AppearanceModal: a file that exports
 * both a component and constants loses Fast Refresh ("only works when a file
 * only exports components"), and the account menu needs the labels while the
 * modal needs the whole list.
 *
 * The icons stay on the array even though Radio does not draw them — anything
 * that wants a glyph per theme still has one.
 */
export const THEMES: Array<{
  value: ThemePreference
  label: string
  icon: ComponentType<{ size?: number | string }>
}> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  // Label only. The stored VALUE stays 'brand' — it is written to localStorage,
  // drives `[data-theme='brand']` across theme-overrides.css, and useAppTheme
  // still migrates the pre-rename 'classic' value forward to it. Renaming the
  // value would invert that migration and strand anyone's saved preference.
  { value: 'brand', label: 'Classic', icon: Palette },
  // Last, because it is the "whichever you already chose" option rather than a
  // look of its own — the order ClickUp and macOS both use.
  { value: 'system', label: 'System', icon: Monitor },
]

/** The label for a preference — the menu row shows this without opening anything. */
export const themeLabel = (value: ThemePreference) =>
  THEMES.find((t) => t.value === value)?.label ?? value
