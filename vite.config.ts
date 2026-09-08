import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The DEMO server. `npm run dev` serves demo/ and resolves the package by its
 * published name, so the demo is an ordinary consumer rather than a sibling
 * with privileged access — if it compiles, the public exports are complete.
 *
 * The library build lives in vite.lib.config.ts.
 */
export default defineConfig({
  plugins: [react()],
  root: resolve(import.meta.dirname, 'demo'),
  resolve: {
    alias: {
      '@faclon-labs/app-shell': resolve(import.meta.dirname, 'src/index.ts'),
    },
  },
})
