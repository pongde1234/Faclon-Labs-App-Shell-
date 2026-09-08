import { useCallback, useEffect, useRef, useState } from 'react'
import type { TransitionEvent } from 'react'

/**
 * Tracks "a collapse is in flight", so labels can be held on screen until the
 * panel has actually finished narrowing.
 *
 * WHY THIS EXISTS. The naive version keys label visibility off the collapsed
 * state alone, so the text vanishes on the frame the state flips while the
 * panel spends the next 200ms catching up — the labels pop out of a rail that
 * is still full width. Holding them through the transition and hiding them at
 * the end is the whole fix.
 *
 * WHY IT NEEDS A FALLBACK TIMER. `transitionend` is not guaranteed. It does not
 * fire when the element is removed mid-flight, when the value did not actually
 * change (collapsing something already collapsed), or — the one that bites in
 * practice — when the tab is backgrounded, because the browser stops running
 * transitions and never emits the event on return. Any of those would strand
 * the guard permanently, and a permanently "transitioning" rail is a rail whose
 * labels never hide. The timer is the floor under all three.
 *
 * Every timeout id is kept so unmount can clear them; a fired-but-uncancelled
 * timer calling setState on an unmounted component is the classic leak here.
 */
export function useTransitionGuard(duration: number) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(
    () => () => {
      for (const t of timers.current) clearTimeout(t)
      timers.current = []
    },
    [],
  )

  /** Call when the state that drives the transition changes. */
  const begin = useCallback(() => {
    setIsTransitioning(true)
    // ~50ms past the transition, so it only ever fires when transitionend did
    // not. Racing it deliberately: whichever lands first clears the guard.
    const id = setTimeout(() => setIsTransitioning(false), duration + 50)
    timers.current.push(id)
  }, [duration])

  /**
   * Attach to the element that actually carries the transition.
   *
   * Both guards matter. `e.target !== e.currentTarget` rejects transitions
   * BUBBLING UP from children — every nav row animates its own background on
   * hover, and any one of those would otherwise end the guard early, which is
   * exactly the pop this hook exists to prevent. The `propertyName` check
   * rejects the other properties on the same element.
   */
  const onTransitionEnd = useCallback(
    (property: string) => (e: TransitionEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget || e.propertyName !== property) return
      setIsTransitioning(false)
    },
    [],
  )

  return { isTransitioning, begin, onTransitionEnd }
}
