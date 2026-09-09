import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The DEMO server — `npm run dev`.
 *
 * The demo resolves both packages BY THEIR PUBLISHED NAMES rather than by
 * relative path, so it is an ordinary consumer with no privileged access. If it
 * compiles, the exports maps are complete; a relative import into a package's
 * internals would hide a missing export until someone outside the repo hit it.
 *
 * Aliases rather than npm workspaces: workspaces would mean re-running
 * `npm install` against a lockfile that currently produces a working tree, and
 * that risk buys nothing here. The published `exports` maps are what real
 * consumers use, and the library builds live in each package's own vite config.
 */
export default defineConfig({
  plugins: [react()],
  root: resolve(import.meta.dirname, 'demo'),
  resolve: {
    // The ARRAY form, and the order is load-bearing: an alias `find` given as a
    // string is a PREFIX match, so a bare '@faclon-labs/iosense-shell' pointing
    // at index.ts would also swallow '@faclon-labs/iosense-shell/…' and rewrite
    // it to '<…>/src/index.ts/theme-overrides.css'. Subpaths first.
    //
    // Only iosense-shell needs a stylesheet subpath. app-shell's AppShell.tsx
    // imports its own tokens.css, so in dev the CSS arrives with the module and
    // its published './styles.css' entry is only for the built bundle.
    alias: [
      {
        find: '@faclon-labs/iosense-shell/theme-overrides.css',
        replacement: resolve(import.meta.dirname, 'packages/iosense-shell/src/theme-overrides.css'),
      },
      {
        find: '@faclon-labs/iosense-shell',
        replacement: resolve(import.meta.dirname, 'packages/iosense-shell/src/index.ts'),
      },
      {
        find: '@faclon-labs/app-shell',
        replacement: resolve(import.meta.dirname, 'packages/app-shell/src/index.ts'),
      },
    ],
  },
  server: { fs: { allow: [resolve(import.meta.dirname)] } },
})
