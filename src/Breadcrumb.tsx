import { Fragment } from 'react'

import { SeparatorIcon } from './icons'
import { useShell } from './NavContext'
import type { Crumb } from './types'
import styles from './Breadcrumb.module.css'

/**
 * The trail of ancestors above the current page.
 *
 * THREE RENDERS, ONE RULE — and the middle one is the reason this component
 * exists rather than being a handful of anchors:
 *
 *   last crumb          →  <span aria-current="page">, never interactive
 *   crumb with href     →  a link
 *   crumb without href  →  PLAIN TEXT, not a button
 *
 * That third case is the one every breadcrumb implementation gets wrong. A
 * section that is not a page ("Workflows", "Settings") has nothing to link to,
 * and the usual answer — render it anyway with no handler — produces a control
 * that is in the tab order and does nothing when activated. Pointing it at the
 * section's first child is worse: the crumb whose whole job is to go UP then
 * moves you SIDEWAYS into a sibling.
 *
 * So `href` being absent is meaningful input, not missing input. The consumer
 * decides what belongs in the trail; this decides how each step is drawn.
 *
 * There is deliberately no overflow collapsing. A long trail wraps.
 */
export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  const { linkComponent: As } = useShell('Breadcrumb')
  if (trail.length === 0) return null

  return (
    // The label names the landmark; without it a screen reader announces an
    // unnamed navigation region, which is no help when the page has two.
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              <li className={styles.item}>
                {isLast ? (
                  <span className={styles.current} aria-current="page">
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <As className={styles.link} href={crumb.href}>
                    {crumb.label}
                  </As>
                ) : (
                  <span className={styles.static}>{crumb.label}</span>
                )}
              </li>
              {!isLast && (
                <li className={styles.separator} aria-hidden="true">
                  <SeparatorIcon />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
