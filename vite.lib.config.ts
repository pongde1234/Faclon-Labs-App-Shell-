import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Library build for @faclon-labs/app-shell.
 *
 * ESM only. The consumer is a bundler, and shipping a CJS build nobody
 * exercises is how a broken CJS build goes unnoticed for a year — it can be
 * added the day something actually needs it.
 *
 * Types are emitted by `tsc -p tsconfig.build.json` in the build script rather
 * than by a plugin: it adds no dependency, and this package's whole selling
 * point is that it has none.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
      // Default is the package name (app-shell.css). Pinned so the exports
      // map's ./styles.css entry cannot drift from what is emitted.
      cssFileName: 'style',
    },
    // React must not be bundled in — two copies of React in one app is a
    // broken-hooks error that surfaces far from its cause.
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: true,
  },
})
