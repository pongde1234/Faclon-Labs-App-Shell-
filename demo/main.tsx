import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IosenseDemo />
  </StrictMode>,
)
