import type { ReactNode } from 'react'

import { Box } from './Box'
import type { SpacingToken } from './boxTokens'

/**
 * Stack — a run of children with one gap between them.
 *
 * THE POINT OF THIS COMPONENT is that spacing is not something the caller can
 * forget. `<main>` spaces its own direct children, but that reach stops one
 * level down: the moment a page wraps anything in a plain <div>, the rhythm
 * inside that wrapper is whatever the markup happened to do. Content here is
 * generated from prompts rather than written by hand, so "whatever the markup
 * happened to do" is not an edge case — it is the default outcome.
 *
 * Stack, Grid and Card exist so that the generated vocabulary has no way to
 * express inconsistent spacing. Every gap comes from the same scale, and the
 * default is the same 16px rhythm the content area itself uses.
 */
export interface StackProps {
  /** Default `vertical`. */
  direction?: 'vertical' | 'horizontal'
  /** Default `contentGap` — the same 16px the content area uses. */
  gap?: SpacingToken
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between'
  /** Horizontal stacks wrap by default; vertical ones have nothing to wrap. */
  wrap?: boolean
  className?: string
  children?: ReactNode
}

/** CSS spells these differently from the prop vocabulary. */
const ALIGN = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
} as const

const JUSTIFY = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
} as const

export function Stack({
  direction = 'vertical',
  gap = 'contentGap',
  align,
  justify,
  wrap,
  className,
  children,
}: StackProps) {
  const horizontal = direction === 'horizontal'
  return (
    <Box
      className={className}
      display="flex"
      flexDirection={horizontal ? 'row' : 'column'}
      gap={gap}
      alignItems={align ? ALIGN[align] : horizontal ? 'center' : undefined}
      justifyContent={justify ? JUSTIFY[justify] : undefined}
      flexWrap={(wrap ?? horizontal) ? 'wrap' : undefined}
      // Flex items refuse to shrink below their content without this, which is
      // how a long unbroken string in one card forces the whole row wider than
      // the viewport.
      minWidth="none"
    >
      {children}
    </Box>
  )
}
