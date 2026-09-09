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
  /*
   * ROOT AND OUTDIR ARE BOTH ABSOLUTE, and that is not belt-and-braces.
   *
   * This config is invoked from the REPO root — see the build scripts in the
   * root package.json — and Vite resolves build.outDir against root, which
   * defaults to the CWD. Left alone, both packages wrote their
   * bundle to <repo>/dist — overwriting each other — while each package's own
   * dist/ got nothing but the .d.ts files tsc puts there afterwards.
   *
   * It looks like a clean build: vite prints its summary, tsc prints nothing,
   * and dist/ is full of files. It is only wrong at publish time, when
   * the package manifest points main at something that was never written.
   */
  root: import.meta.dirname,
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
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
