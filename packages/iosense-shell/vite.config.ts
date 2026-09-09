import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Library build for @faclon-labs/iosense-shell.
 *
 * ESM only — the consumer is a bundler, and shipping a CJS build nobody
 * exercises is how a broken CJS build goes unnoticed.
 *
 * EVERYTHING the package depends on is external. React must not be bundled
 * (two copies in one app is a broken-hooks error that surfaces far from its
 * cause), and neither must the SDKs: this package is a consumer of them, and
 * bundling a copy would give the host two sets of components fighting over the
 * same token names and the same injected stylesheets.
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
      cssFileName: 'style',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-dom/client',
        'lucide-react',
        /^@faclon-labs\//,
      ],
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: true,
  },
})
