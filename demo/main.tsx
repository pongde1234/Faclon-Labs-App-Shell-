import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { DemoPage } from './DemoPage'

/**
 * The demo's entry, deliberately bare.
 *
 * No font import, no design-system stylesheet, no provider — if this page
 * renders correctly then the shell really does stand on react and react-dom
 * alone. Anything added here weakens that as evidence.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DemoPage />
  </StrictMode>,
)
