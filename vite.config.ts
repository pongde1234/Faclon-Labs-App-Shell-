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
  build: {
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
