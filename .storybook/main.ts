import { resolve } from 'node:path'
import type { StorybookConfig } from '@storybook/react-vite'

const root = resolve(import.meta.dirname, '..')

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  framework: { name: '@storybook/react-vite', options: {} },

  /**
   * Storybook builds with its OWN vite config, not the repo's — so the aliases
   * that let the demo import the packages by their published names have to be
   * repeated here. Without them every story would import a relative path into
   * package internals, which would defeat the point: a story that reaches past
   * the exports map cannot tell you the exports map is complete.
   *
   * Order is load-bearing for the same reason as in vite.config.ts: a string
   * `find` is a PREFIX match, so the bare package name would otherwise swallow
   * its own stylesheet subpath.
   */
  viteFinal: (viteConfig) => {
    viteConfig.resolve ??= {}
    viteConfig.resolve.alias = [
      {
        find: '@faclon-labs/iosense-shell/theme-overrides.css',
        replacement: resolve(root, 'packages/iosense-shell/src/theme-overrides.css'),
      },
      {
        find: '@faclon-labs/iosense-shell',
        replacement: resolve(root, 'packages/iosense-shell/src/index.ts'),
      },
      {
        find: '@faclon-labs/app-shell',
        replacement: resolve(root, 'packages/app-shell/src/index.ts'),
      },
      ...(Array.isArray(viteConfig.resolve.alias) ? viteConfig.resolve.alias : []),
    ]
    viteConfig.server ??= {}
    viteConfig.server.fs = { allow: [root] }
    return viteConfig
  },
}

export default config
