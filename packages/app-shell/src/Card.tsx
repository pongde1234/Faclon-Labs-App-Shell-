import type { ReactNode } from 'react'

import { Box } from './Box'
import { Stack } from './Stack'
import type { SpacingToken } from './boxTokens'
import styles from './Card.module.css'

/**
 * Card — the surface a dashboard tile sits on.
 *
 * Its inner gap defaults to `spacing.2` (8px) rather than the 16px used
 * between tiles, and that is not a second rhythm: it is the same scale, one
 * step down. Things inside one card are more related to each other than two
 * cards are to each other, and the spacing should say so. Both values come
 * from the token scale, so neither is arbitrary and either can be retuned in
 * one place.
 *
 * `title` is rendered as an <h3> because a dashboard tile sits under the page
 * heading and, usually, a section heading. It takes no `as` override — a
 * caller choosing heading levels per tile is how a generated page ends up with
 * an outline that jumps from h1 to h5.
 */
export interface CardProps {
  title?: ReactNode
  /** Top-right of the header — a menu, a filter, a link. */
  actions?: ReactNode
  /** Default `spacing.4` (16px). */
  padding?: SpacingToken
  /** Between the card's own children. Default `spacing.2` (8px). */
  gap?: SpacingToken
  className?: string
  children?: ReactNode
}

export function Card({
  title,
  actions,
  padding = 'spacing.4',
  gap = 'spacing.2',
  className,
  children,
}: CardProps) {
  return (
    <Box
      as="section"
      className={`${styles.card} ${className ?? ''}`}
      padding={padding}
      background="surface"
      borderRadius="lg"
      borderColor="border"
      display="flex"
      flexDirection="column"
      gap={gap}
      // Without this a card in a flex row will not shrink below its content.
      minWidth="none"
    >
      {(title || actions) && (
        <Stack direction="horizontal" justify="between" align="center" gap="spacing.2">
          {title ? <h3 className={styles.title}>{title}</h3> : <span />}
          {actions}
        </Stack>
      )}
      {children}
    </Box>
  )
}
