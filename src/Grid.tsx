import type { ReactNode } from 'react'

import { Box } from './Box'
import type { SpacingToken } from './boxTokens'

/**
 * Grid — the dashboard layout, with no breakpoints for a caller to get wrong.
 *
 * The DEFAULT is `columns="auto"`, which is
 * `repeat(auto-fit, minmax(--shell-grid-min-item, 1fr))`. That reflows on its
 * own at every width: three tiles on a wide screen, two on a laptop, one on a
 * phone, with no media query anywhere. For generated content this matters more
 * than the flexibility it gives up — a fixed column count is the single most
 * common way an AI-written dashboard breaks on a narrow screen, and this
 * removes the opportunity.
 *
 * An explicit `columns={n}` is available for layouts that genuinely need a
 * fixed shape, and even then it collapses to one column below the mobile
 * breakpoint rather than overflowing.
 */
export interface GridProps {
  /** `auto` (default) reflows by item width. A number fixes the count. */
  columns?: 'auto' | 1 | 2 | 3 | 4 | 6
  /** Default `contentGap` — the same 16px rhythm as everything else. */
  gap?: SpacingToken
  className?: string
  children?: ReactNode
}

export function Grid({ columns = 'auto', gap = 'contentGap', className, children }: GridProps) {
  return (
    <Box
      className={className}
      display="grid"
      gap={gap}
      // `minmax(0, 1fr)` rather than plain `1fr`: a grid track's default
      // minimum is min-content, so one long word or a wide table inside a tile
      // pushes the track — and the whole page — past the viewport. This is the
      // grid equivalent of `min-width: 0` on a flex child.
      gridTemplateColumns={
        columns === 'auto'
          ? 'repeat(auto-fit, minmax(min(var(--shell-grid-min-item), 100%), 1fr))'
          : `repeat(${columns}, minmax(0, 1fr))`
      }
      data-shell-grid-columns={columns}
    >
      {children}
    </Box>
  )
}
