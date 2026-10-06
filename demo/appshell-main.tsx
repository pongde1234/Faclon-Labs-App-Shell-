import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppShellDemo } from './AppShellDemo'

/**
 * The entry for the app-shell demo — `/appshell.html`.
 *
 * NO STYLESHEET IMPORT, and that is not an omission. `AppShell.tsx` imports its
 * own `tokens.css` and its CSS modules, so in dev the styles arrive with the
 * module; the package's published `./styles.css` entry is for the built bundle.
 *
 * It is also the reason this page is separate from the iosense demo rather than
 * a route inside it: this package's only runtime dependencies are react and
 * react-dom, and design-sdk's global stylesheet is not loaded here at all. On a
 * shared page the SDK's tokens would be answering for app-shell's, and the
 * thing worth looking at — what the react-only shell looks like on its own —
 * would be exactly what you could not see.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShellDemo />
  </StrictMode>,
)
