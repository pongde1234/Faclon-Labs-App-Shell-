import { useState } from 'react'
import { CircleQuestionMark, Sparkles } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { AppSideNav, NavFooterRow, NAV_ICON_SIZE, WorkspaceLabel } from '@faclon-labs/iosense-shell'

import {
  ACCORDION_ROWS,
  BADGED_ROWS,
  DemoLogo,
  PLAIN_ROWS,
  RailFrame,
  SECTION_ROWS,
} from './fixtures'

/**
 * STORY.md §1 — the side nav, container by container.
 *
 * Every story here mounts the rail ALONE, without the shell, so what you are
 * looking at is the rail's own behaviour rather than the layout around it.
 * `isPinned` is the control: true is the 240px panel, false is the 48px strip.
 */
const meta = {
  title: 'Side nav/Rail',
  component: AppSideNav,
  parameters: {
    docs: {
      description: {
        component:
          'The rail ships EMPTY. What the package provides is the behaviour — hover peek, ' +
          'the tooltip that only fires on an unreadable label, the accordion that opens ' +
          'itself on a deep link, the flyout in the 48px strip. The rows are data you pass.',
      },
    },
  },
  args: {
    activeId: 'home',
    // Required by AppSideNav's type, so `satisfies Meta` demands it here even
    // though every story's render replaces it with real state.
    onNavigate: () => {},
    isPinned: true,
    railTheme: 'Light' as const,
    logo: <DemoLogo />,
    workspace: <WorkspaceLabel name="Northwind Ltd" />,
  },
  // Interactive: clicking a row moves the active pill, which is most of what
  // there is to see.
  render: (args) => {
    const Rail = () => {
      const [activeId, setActiveId] = useState(args.activeId)
      return (
        <RailFrame>
          <AppSideNav {...args} activeId={activeId} onNavigate={setActiveId} />
        </RailFrame>
      )
    }
    return <Rail />
  },
} satisfies Meta<typeof AppSideNav>

export default meta
type Story = StoryObj<typeof meta>

/**
 * WHAT THE PACKAGE ACTUALLY SHIPS. No items, no footer — a header and an empty
 * column. Everything in the other stories is passed in.
 */
export const Default: Story = {
  args: { items: undefined, footer: undefined },
}

export const WithRows: Story = {
  args: { items: PLAIN_ROWS },
}

/**
 * §1.2(a) — the trailing slot. A Counter for a quantity, a Badge for a word.
 * Never a Chip: Chip renders a <button> and the row is already a <button>.
 *
 * Note 1284 rendering as 99+ — Counter has no default max, so the rail pins it
 * or the count would stretch the row. And the last row's label is deliberately
 * too long: hover it to see the tooltip, which appears ONLY because the text is
 * clipped.
 */
export const Badges: Story = {
  args: { items: BADGED_ROWS },
}

/**
 * §1.2(b) — an accordion. The parent row IS the disclosure control; the chevron
 * is a cue, not a separate button (that would be a <button> inside a <button>).
 */
export const Accordions: Story = {
  args: { items: ACCORDION_ROWS },
}

/**
 * A child is active, so its group opens ITSELF. This is what stops a deep link
 * landing on a row nobody can see.
 */
export const AccordionOpensForActiveChild: Story = {
  args: { items: ACCORDION_ROWS, activeId: 'reports-archive' },
}

/**
 * §1.2(c) — a section: a labelled group whose label folds it away. Click
 * "Connect" to fold it.
 */
export const Sections: Story = {
  args: { items: SECTION_ROWS },
}

/**
 * The 48px strip. Labels and badges are gone; a dot stands in for a count or an
 * alert, and hovering a row gives you the label — with the number appended,
 * since the dot says THAT there is something but not what.
 *
 * Hover the rail itself and it peeks open, without moving anything to its right.
 */
export const Collapsed: Story = {
  args: { items: BADGED_ROWS, isPinned: false },
}

/**
 * Collapsed, an accordion has nowhere to unfold into — so the parent opens a
 * FLYOUT beside the strip. Click "Workflows".
 *
 * One at a time: fds's Popovers do not join a floating tree, so nothing would
 * close the first panel when a second opened.
 */
export const CollapsedFlyout: Story = {
  args: { items: ACCORDION_ROWS, isPinned: false },
}

/**
 * A section is FORCE-EXPANDED in the strip, even if you folded it while open.
 * A folded section here would be a hairline with no affordance to unfold it,
 * and it would strand every icon inside.
 */
export const CollapsedSectionStaysOpen: Story = {
  args: { items: SECTION_ROWS, isPinned: false },
}

/**
 * §1.3 — the footer. Empty by default and not rendered at all when omitted, so
 * an unused footer costs no height.
 *
 * Built with NavFooterRow rather than a bare IconButton: the label then fades
 * with the rail like every other row. Collapse this story to see it.
 */
export const Footer: Story = {
  args: {
    items: PLAIN_ROWS,
    footer: <NavFooterRow icon={<CircleQuestionMark size={NAV_ICON_SIZE} />} label="Help" />,
  },
}

/** A footer is a slot, not a Help button — anything can go in it. */
export const FooterWithBanner: Story = {
  args: {
    items: PLAIN_ROWS,
    footer: (
      <>
        <NavFooterRow icon={<Sparkles size={NAV_ICON_SIZE} />} label="What's new" />
        <NavFooterRow icon={<CircleQuestionMark size={NAV_ICON_SIZE} />} label="Help" />
      </>
    ),
  },
}

/**
 * §1.1 — the header, with NO logo passed.
 *
 * design-sdk falls through to its own built-in mark, which is the IOSENSE logo.
 * That is the whole reason the prop is documented as one you must set: an
 * unbranded install silently ships someone else's identity.
 */
export const HeaderWithoutLogo: Story = {
  args: { items: PLAIN_ROWS, logo: undefined },
}

/** The organisation row is a node, so a switcher or a plan badge is legal too. */
export const HeaderWithCustomWorkspace: Story = {
  args: {
    items: PLAIN_ROWS,
    workspace: (
      <span style={{ display: 'grid', lineHeight: 1.3 }}>
        <strong style={{ fontSize: 13 }}>Northwind Ltd</strong>
        <span style={{ fontSize: 11, opacity: 0.6 }}>Enterprise plan</span>
      </span>
    ),
  },
}

/** The rail's dark variant, as the brand and dark themes render it. */
export const DarkRail: Story = {
  args: { items: BADGED_ROWS, railTheme: 'Dark' },
}
