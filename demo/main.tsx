import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AiGradientDefs } from './AiGradientDefs'
import { IosenseDemo } from './IosenseDemo'

// The three stylesheets, in the order the README's stylesheet contract
// requires, and AFTER the component imports above.
//
// design-sdk FIRST: it is the only definition of --spacing-* and of the SDK's
// component CSS. Without it the rail renders as unstyled rows and the content
// container's padding resolves against an undefined custom property, which
// makes the declaration invalid and silently drops the inset to 0.
//
// theme-overrides LAST: design-sdk injects each component's stylesheet when its
// module loads, so an import placed above IosenseDemo would land earlier in the
// cascade and the SDK's rules would win.
import '@faclon-labs/design-sdk/styles.css'
import '@faclon-labs/fds/styles.css'
import '@faclon-labs/iosense-shell/theme-overrides.css'
import './demo.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* OUTSIDE the shell, and that placement is the point.
        Every direct child of the content container gets the 16px gap, including
        one that draws nothing — so an <svg> defs block placed in there is a
        sibling in that chain and pushes the first visible block down by a full
        gap. Measured at 32px from the top instead of 16 while it lived there. */}
    <AiGradientDefs />
    <IosenseDemo />
  </StrictMode>,
)
