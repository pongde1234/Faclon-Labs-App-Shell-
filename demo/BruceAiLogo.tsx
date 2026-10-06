import { useId } from 'react'

/**
 * The Bruce AI mark, for the assistant button in the top bar.
 *
 * IT LIVES IN THE DEMO, not in the package — the assistant button is passed in
 * through `actions`, because the shell knows nothing about what it opens. A
 * package that shipped this mark would put our product's identity into every
 * install.
 *
 * SHAPED FOR `IconButton`, which takes a COMPONENT and renders it at the size
 * its own `size` prop promises (Medium = 16px). So this takes `size` and spends
 * it on width/height while the artwork keeps its own 36-unit `viewBox` — the
 * mark scales rather than being cropped.
 *
 * EVERY ID IS NAMESPACED with `useId`. SVG ids are DOCUMENT-global: the
 * exported artwork refers to its gradients, masks and clip path by fixed names,
 * so two of these on one page would have the second instance's paint servers
 * silently resolve to the first instance's. That is the same class of dangling
 * reference the old assistant glyph hit when its gradient lived in a stylesheet
 * and its `<defs>` did not — see the note that used to be in demo.css.
 */
export function BruceAiLogo({ size = 16 }: { size?: number | string }) {
  const id = useId()
  const clip = `${id}-clip`
  const mask = (n: number) => `${id}-mask${n}`
  const paint = (n: number) => `${id}-paint${n}`

  // The rounded-square plate the whole mark sits on. Drawn several times over —
  // as the mask, as the gradient fill and as the flat tint beneath it — exactly
  // as the source artwork does.
  const plate =
    'M32 0H4C1.79086 0 0 1.79086 0 4V32C0 34.2091 1.79086 36 4 36H32C34.2091 36 36 34.2091 36 32V4C36 1.79086 34.2091 0 32 0Z'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      // Decorative: the button's own accessible name says what it does.
      aria-hidden="true"
      focusable="false"
    >
      <g clipPath={`url(#${clip})`}>
        <mask id={mask(0)} style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <path d={plate} fill="white" />
        </mask>
        <g mask={`url(#${mask(0)})`}>
          <path d={plate} fill={`url(#${paint(0)})`} />
          <mask id={mask(1)} style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
            <path d="M36 0H0V36H36V0Z" fill="white" />
          </mask>
          <g mask={`url(#${mask(1)})`}>
            <path d={plate} fill="#EBB1B1" />
            <path d={plate} fill={`url(#${paint(1)})`} />
            <mask id={mask(2)} style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="7" y="6" width="21" height="23">
              <path d="M27.965 6.94238H7.97217V28.9281H27.965V6.94238Z" fill="white" />
            </mask>
            <g mask={`url(#${mask(2)})`}>
              <path
                d="M17.4157 13.6039C17.7211 13.4276 18.0973 13.4276 18.4027 13.6039L21.3522 15.3068C21.6576 15.4831 21.8457 15.809 21.8457 16.1616V19.5673C21.8457 19.92 21.6576 20.2458 21.3522 20.4221L18.4027 22.125C18.0973 22.3013 17.7211 22.3013 17.4157 22.125L14.4662 20.4221C14.1608 20.2458 13.9727 19.92 13.9727 19.5673V16.1616C13.9727 15.809 14.1608 15.4831 14.4662 15.3068L17.4157 13.6039Z"
                fill="white"
              />
              <path
                d="M17.6981 10.7453L18.7012 10.1647C19.6961 9.58879 19.7036 8.15503 18.7147 7.56875C18.2467 7.29125 17.6653 7.28811 17.1943 7.56055L10.4779 11.4454C9.35959 12.0923 8.6709 13.2862 8.6709 14.5782V21.1501C8.6709 22.4373 9.35455 23.6276 10.4664 24.2762L12.7803 25.626C13.243 25.896 13.8145 25.8995 14.2805 25.6352C15.3057 25.0538 15.2945 23.5727 14.2606 23.0069L12.6264 22.1125C12.0223 21.7819 11.6467 21.1481 11.6467 20.4595V15.9527C11.6467 14.8955 12.2103 13.9185 13.1255 13.3893L17.6981 10.7453Z"
                fill="white"
                stroke="white"
                strokeWidth="0.0423006"
              />
              <path
                d="M25.5245 11.4542L23.2006 10.1076C22.7295 9.83462 22.1479 9.83667 21.6788 10.113C20.6841 10.6988 20.6892 12.1391 21.688 12.7179L23.3531 13.6828C23.9625 14.0359 24.3377 14.687 24.3377 15.3913V19.8458C24.3377 20.9205 23.7553 21.9109 22.8161 22.4334L17.2413 25.5346C16.2046 26.1113 16.2006 27.6011 17.2342 28.1833C17.7006 28.4461 18.271 28.4437 18.7352 28.177L25.513 24.2828C26.6364 23.6373 27.3291 22.4405 27.3291 21.1448V14.5856C27.3291 13.2946 26.6414 12.1015 25.5245 11.4542Z"
                fill="white"
                strokeWidth="0.0423006"
                stroke="white"
              />
            </g>
            {/* The sparkle. It sits BELOW the 36-unit box in the source and is
                clipped away by `clip` — kept so the artwork stays a faithful
                copy of the export rather than a redrawn one. */}
            <path
              d="M2.31137 44.8087C2.59258 45.0816 3.02376 45.0985 3.34687 44.8438C6.2636 42.6125 6.97125 42.5946 9.75512 44.7435C10.0782 44.9889 10.5357 44.9631 10.8084 44.6821C11.0849 44.3973 11.0934 43.9509 10.8461 43.6274C8.69138 40.8615 8.67827 40.2577 10.7515 37.2152C10.981 36.8772 10.9591 36.4543 10.6818 36.1851C10.3967 35.9084 9.96946 35.8953 9.63854 36.1425C6.73339 38.3774 6.02577 38.3954 3.24577 36.2502C2.91107 36.0011 2.4651 36.0229 2.18483 36.3117C1.91212 36.5926 1.89577 37.0315 2.15093 37.3625C4.30193 40.14 4.31493 40.7362 2.2339 43.771C2.00841 44.1205 2.03798 44.5433 2.31137 44.8087Z"
              fill={`url(#${paint(2)})`}
            />
            <path
              d="M2.31137 44.8087C2.59258 45.0816 3.02376 45.0985 3.34687 44.8438C6.2636 42.6125 6.97125 42.5946 9.75512 44.7435C10.0782 44.9889 10.5357 44.9631 10.8084 44.6821C11.0849 44.3973 11.0934 43.9509 10.8461 43.6274C8.69138 40.8615 8.67827 40.2577 10.7515 37.2152C10.981 36.8772 10.9591 36.4543 10.6818 36.1851C10.3967 35.9084 9.96946 35.8953 9.63854 36.1425C6.73339 38.3774 6.02577 38.3954 3.24577 36.2502C2.91107 36.0011 2.4651 36.0229 2.18483 36.3117C1.91212 36.5926 1.89577 37.0315 2.15093 37.3625C4.30193 40.14 4.31493 40.7362 2.2339 43.771C2.00841 44.1205 2.03798 44.5433 2.31137 44.8087Z"
              fill={`url(#${paint(3)})`}
              fillOpacity="0.2"
            />
          </g>
        </g>
      </g>
      <defs>
        <linearGradient id={paint(0)} x1="36" y1="0" x2="0" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F7AAF9" />
          <stop offset="1" stopColor="#342DFB" />
        </linearGradient>
        <linearGradient id={paint(1)} x1="36" y1="0" x2="0" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F7AAF9" />
          <stop offset="1" stopColor="#342DFB" />
        </linearGradient>
        <linearGradient id={paint(2)} x1="10.6818" y1="36.1851" x2="2.31137" y2="44.8087" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F7AAF9" />
          <stop offset="1" stopColor="#342DFB" />
        </linearGradient>
        <linearGradient id={paint(3)} x1="10.6818" y1="36.1851" x2="2.31137" y2="44.8087" gradientUnits="userSpaceOnUse">
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clip}>
          <rect width="36" height="36" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
