/**
 * The gradient the assistant glyph strokes itself with.
 *
 * An SVG stroke can only reference a paint server that EXISTS IN THE DOCUMENT,
 * so these defs have to be rendered once somewhere. They live here rather than
 * in the package because the button they serve is not part of the package —
 * and a package shipping CSS that points at an id it never defines is exactly
 * the dangling reference this move fixed.
 *
 * It is rendered in main.tsx, OUTSIDE the shell. Inside the content container it
 * would be a direct child, and every direct child gets the 16px gap even when it
 * draws nothing — measured pushing the first visible block to 32px from the top
 * instead of 16.
 */
export const AiGradientDefs = () => (
  <svg width="0" height="0" aria-hidden="true" focusable="false" className="svg-defs">
    <defs>
      <linearGradient id="ai-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--global-brand-500)" />
        <stop offset="100%" stopColor="var(--global-sapphire-500)" />
      </linearGradient>
    </defs>
  </svg>
)

