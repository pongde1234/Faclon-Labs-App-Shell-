import { THEMES } from './themes'
import type { ThemePreference } from './useAppTheme'
import './ThemeTiles.css'

/**
 * One miniature of the interface. Purely decorative — the tile's <input> is
 * what carries the value, and this is aria-hidden.
 *
 * `--ground` / `--rail` / `--card` / `--ink` are set per theme in the CSS, so
 * this markup is drawn four times and coloured four ways.
 */
function Face({ variant }: { variant?: 'dark' }) {
  return (
    <span className={variant ? 'theme-tiles__face theme-tiles__face--dark' : 'theme-tiles__face'}>
      <span className="theme-tiles__rail" />
      <span className="theme-tiles__body">
        <span className="theme-tiles__card">
          <span className="theme-tiles__bar theme-tiles__bar--wide" />
          <span className="theme-tiles__bar" />
        </span>
      </span>
    </span>
  )
}

/**
 * Theme picker as preview tiles, the shape ClickUp / VS Code / macOS all use.
 *
 * WHY THIS IS HAND-BUILT, against the fds-only rule everywhere else here: fds
 * ships nothing that can carry it. Its selectable Card was deliberately removed
 * — "FLAT SURFACE by user ruling: no rest shadow, no selection ring, no
 * validation ring… the earlier isSelected / value (group-wiring) / as='label'
 * selection system was removed the same day it shipped" — and Radio renders a
 * 16px circle with an inline label, not a tile. There is no third option.
 *
 * A theme is a visual property, so a swatch answers "what will this look like?"
 * in a way a word cannot, and "System" stops needing help text once it is drawn
 * as a split of the other two.
 *
 * SEMANTICS ARE NOT HAND-BUILT. Each tile is a real <input type="radio"> inside
 * its <label>, sharing one `name`, so the browser gives the roving focus, the
 * arrow-key cycling and the "one of N" announcement for free. The input is
 * clipped rather than `display:none` — hiding it outright would take it out of
 * the accessibility tree and off the keyboard.
 */
export function ThemeTiles({
  value,
  onChange,
}: {
  value: ThemePreference
  onChange: (next: ThemePreference) => void
}) {
  return (
    <fieldset className="theme-tiles">
      <legend className="theme-tiles__legend">Theme</legend>
      <div className="theme-tiles__row">
        {THEMES.map((t) => (
          <label key={t.value} className="theme-tiles__tile">
            <input
              className="theme-tiles__input"
              type="radio"
              name="app-theme"
              value={t.value}
              checked={value === t.value}
              onChange={() => onChange(t.value)}
            />
            <span className="theme-tiles__preview" data-theme={t.value} aria-hidden="true">
              <Face />
              {/* System shows both, split on the diagonal — the only honest way
                  to draw "whichever your device is using". */}
              {t.value === 'system' && <Face variant="dark" />}
            </span>
            <span className="theme-tiles__label">{t.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
