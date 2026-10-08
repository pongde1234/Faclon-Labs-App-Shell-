/**
 * The iosense mark.
 *
 * HERE, IN THE DEMO, not in the package — the same rule the nav rows, the
 * profile and `appLogos.tsx` follow. A shell that shipped our identity would
 * put it in everyone else's product.
 *
 * It exists because `AppCenter.logo` has NO FALLBACK, deliberately: omit it and
 * the header is title and subtitle alone. The rail's `logo` prop does have one
 * — design-sdk draws this same mark when nothing is passed — which is exactly
 * why the prop's own doc says to set it. Passing this to both is a one-liner
 * whenever we want one source of truth rather than two drawings that can drift.
 *
 * The artwork is design-sdk's internal `BrandLogo`, transcribed: that component
 * is not exported, so there is no import to reach it by.
 */
export interface IosenseLogoProps {
  /** Both edges, in px. The SDK's own header draws it at 28. */
  size?: number
}

export function IosenseLogo({ size = 28 }: IosenseLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      /* `display: block` kills the inline baseline gap, which otherwise pushes
         the mark a few px below the centre of whatever row it sits in. */
      style={{ display: 'block' }}
      role="img"
      aria-label="IOsense"
    >
      <rect width="36" height="36" rx="7.2" fill="url(#iosense-logo-gradient)" />
      <path
        d="M18.1013 29.6999L12.1632 12.7136L9.9596 19.5471L13.5365 22.261L14.1743 25.1025L7.68092 20.375L12.3533 6.30023L18.1013 23.3766L23.7868 6.55036L28.3191 20.7602L21.8383 25.4527L22.5411 22.3886L25.9879 19.7697L23.6892 13.0012L18.1013 29.6999Z"
        fill="white"
      />
      <defs>
        {/* A DISTINCT id from the SDK's (`fds-sidenav-brand-logo-gradient`).
            Gradient ids are document-global: reusing theirs would make whichever
            copy rendered last win for both, and the rail already has one on the
            page. */}
        <linearGradient
          id="iosense-logo-gradient"
          x1="4.5"
          y1="0.45"
          x2="36"
          y2="31.95"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#305EFF" />
          <stop offset="1" stopColor="#6687FE" />
        </linearGradient>
      </defs>
    </svg>
  )
}
