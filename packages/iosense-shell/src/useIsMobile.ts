import { useEffect, useState } from 'react'

/**
 * The one breakpoint in the app: below this the nav becomes a drawer.
 *
 * 768 to match design-sdk's own `mobileBreakpoint` default, so our drawer takes
 * over at exactly the width the SDK would have. Kept as a number rather than a
 * CSS token because it has to be read by matchMedia, not by a stylesheet.
 */
export const MOBILE_BREAKPOINT = 768

/**
 * True below MOBILE_BREAKPOINT.
 *
 * Why the app owns this rather than the SDK: the drawer state lives in whichever
 * SideNavBarProvider wraps <SideNavBar>, and that is OUR nested provider (the
 * one giving the rail its dark theme without leaking it to page content).
 * SideNavBarProvider exposes `openMobile` only through context — there is no
 * controlled prop — so nothing outside that provider can open it, and the top
 * bar is outside. AppShell does not help: it renders the `sideNav` slot verbatim
 * and owns no drawer of its own.
 *
 * Same matchMedia shape as useAppTheme's `prefers-color-scheme` listener.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const apply = () => setIsMobile(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  return isMobile
}
