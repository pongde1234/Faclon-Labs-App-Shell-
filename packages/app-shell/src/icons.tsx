/**
 * Every glyph the shell draws, as inline SVG.
 *
 * There is no icon library here and there cannot be — react and react-dom are
 * the only runtime imports this package is allowed. These six are the complete
 * set the shell needs for its own chrome; a consumer's nav icons are `ReactNode`
 * on NavItem, so callers keep using whatever they already have.
 *
 * All six share one geometry: a 24-unit viewBox drawn with strokes, so they
 * scale from the `size` prop and take their colour from `currentColor`. That
 * makes them inherit the active/hover colours in interactive.module.css for
 * free, with no per-icon styling anywhere.
 */

interface IconProps {
  size?: number
  className?: string
}

/** `focusable="false"` matters on IE-era engines and costs nothing elsewhere;
    `aria-hidden` keeps every one of these out of the accessibility tree, since
    each is paired with a real text label or an accessible name on its parent. */
function svgProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    // `as const` so it stays the literal "false" — widened to `string` it no
    // longer satisfies React's `Booleanish | "auto"`.
    focusable: 'false' as const,
    className,
  }
}

/** Sidebar toggle. A panel with its leading column filled — it says "the thing
    on the left", which is true whether it is about to open or close. */
export function PanelIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="9" y1="4" x2="9" y2="20" />
    </svg>
  )
}

/** Expand/collapse affordance on a nav parent. Rotated in CSS when open, so
    there is one glyph rather than two that must be kept consistent. */
export function ChevronIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

/** The sidebar footer. */
export function HelpIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.2 2.4c-.6.2-.8.7-.8 1.3v.3" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
  )
}

/** Notifications trigger. */
export function BellIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </svg>
  )
}

/** Dismisses the mobile drawer. */
export function CloseIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/** Breadcrumb separator, and the only icon drawn at a non-square aspect. */
export function SeparatorIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <line x1="9" y1="20" x2="15" y2="4" />
    </svg>
  )
}
