import type { Preview } from '@storybook/react-vite'

// The stylesheet contract, in the order the README requires. It matters here
// exactly as much as it does in an app: design-sdk FIRST because it is the only
// definition of --spacing-* and of the SDK's component CSS, and
// theme-overrides LAST because design-sdk injects each component's stylesheet
// when its module loads.
//
// A story that renders without these looks broken in a way that is easy to
// blame on the component, so getting it right here is what keeps Storybook
// honest about what the package does.
import '@faclon-labs/design-sdk/styles.css'
import '@faclon-labs/fds/styles.css'
import '@faclon-labs/iosense-shell/theme-overrides.css'
import './storybook.css'

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // The shell fills the viewport, so the padded default canvas would show it
    // inset in a way it never is in an app.
    layout: 'fullscreen',
    options: {
      // Read in the order of STORY.md rather than alphabetically: the shell
      // first, then the rail top to bottom, then the bar, then the content.
      storySort: {
        order: [
          'Introduction',
          'Shell',
          'Side nav',
          ['Header', 'Entity', 'Accordion', 'Section', 'Footer'],
          'Top nav',
          'Content container',
        ],
      },
    },
  },
}

export default preview
