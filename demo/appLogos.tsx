/**
 * The product marks for the application launcher.
 *
 * THEY LIVE IN THE DEMO, like the nav rows and the app list — these are our
 * products, and a package that shipped them would put our brand into every
 * install.
 *
 * EACH ONE CARRIES ITS OWN PLATE. The artwork is a filled rounded square with
 * the mark drawn on it, so nothing here crops, masks or re-shapes it: the
 * launcher's glyph box sets no background and no radius of its own, and the
 * `viewBox` plus the default `preserveAspectRatio` letterbox rather than
 * distort. Forge is 42×43 rather than square, and it stays 42×43.
 *
 * No `useId` namespacing, unlike the Bruce mark: none of these three defines a
 * gradient, mask or clip path, so there are no document-global ids to collide.
 * Add one that does and it needs the same treatment.
 */

/** Shared by all three: square-ish artwork sized by one number. */
type LogoProps = { size?: number | string }

export function DeepsenseLogo({ size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="42" height="42" rx="3.77528" fill="#FF6600" />
      <circle cx="31.6813" cy="14.8119" r="2.50425" fill="white" />
      <path
        d="M21.3512 6.04727C19.7861 5.73424 18.2209 6.98637 18.534 9.49062C18.2929 11.4195 16.0978 12.7294 14.9105 13.1966C14.3445 13.3178 12.7742 13.3722 11.0212 12.621C8.82996 11.6819 7.89087 13.5601 7.89087 14.8122C7.89087 16.0643 9.143 18.2555 12.2733 16.3774C14.7776 14.8748 16.6558 16.586 17.2818 17.6295C18.0122 18.8816 19.0974 21.8867 17.5949 23.8901C16.0923 25.8935 13.4211 25.7683 12.2733 25.4553C10.7082 24.8292 9.14301 23.8901 8.20392 26.0813C7.26482 28.2726 9.14301 29.5247 10.7082 29.5247C12.2733 29.5247 12.8994 27.9595 14.1515 28.5856C18.2209 29.5247 17.9079 31.4029 18.534 33.5941C19.16 35.7853 21.0382 36.0983 22.2903 35.1593C23.5425 34.2202 23.8555 32.655 21.6643 30.7768C19.4731 28.8986 19.7861 26.7074 20.0991 25.7683C20.4122 24.8292 21.6643 22.325 24.7946 22.325C27.9249 22.325 29.177 25.4553 29.177 27.3335C29.177 29.2117 31.6813 31.0898 33.5595 28.8986C35.062 27.1456 33.9769 25.664 33.2465 25.1422C32.3074 24.6205 30.4292 22.951 30.4292 20.4468C29.6779 17.9425 27.6119 18.3599 26.6728 18.8816C25.212 19.4033 21.9773 19.8207 20.7252 17.3164C18.534 11.9949 21.0382 11.6819 22.6034 10.1167C24.1685 8.55156 22.9164 6.3603 21.3512 6.04727Z"
        fill="white"
      />
    </svg>
  )
}

export function ForgeLogo({ size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      // 42×43, not square. Left as drawn — the default preserveAspectRatio
      // centres it in whatever box it is given rather than stretching it.
      viewBox="0 0 42 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="42" height="42.8" rx="3.78" fill="#101D14" />
      <path
        d="M40.1123 0C41.1548 0 42 0.84518 42 1.8877V40.1123C42 41.1548 41.1548 42 40.1123 42H1.8877C0.84518 42 0 41.1548 0 40.1123V1.8877C0 0.84518 0.84518 0 1.8877 0H40.1123Z"
        fill="#101D14"
      />
      <path d="M34.4215 8H18.6025L20.1617 10.4687H29.614L18.0845 31.8842L19.7736 34.6128L34.4215 8Z" fill="#00EA5F" />
      <path
        d="M22.5592 16.4687L21 14H9L17.145 27.2386L18.7041 24.6399L13.2878 16.4687H22.5592Z"
        fill="#00EA5F"
      />
    </svg>
  )
}

export function FoundryLogo({ size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="42" height="42" rx="3.77528" fill="#2D82FF" />
      <path
        d="M26.2214 20.8887V31.4209L21.8328 34.0537L8.37476 26.1553V15.915L12.7634 13.2822L26.2214 20.8887ZM11.8855 24.3994L22.7107 30.543V22.9365L11.8855 16.793V24.3994Z"
        fill="white"
      />
      <path
        d="M30.3518 18.0439L17.311 10.4606L20.7886 8.41895L33.9999 16.0022V26.5021L30.3518 28.5438V18.0439Z"
        fill="white"
      />
    </svg>
  )
}
