import { useState } from 'react'
import { House, Wallet } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { AppSideNav, NAV_ICON_SIZE, WorkspaceLabel, type NavItem } from '@faclon-labs/iosense-shell'

import { DemoLogo, RailFrame, icon } from './fixtures'

/**
 * THE RULES — what is fixed about anything you put into the shell.
 *
 * The header and the footer are slots and the rail's middle is yours to fill,
 * but "yours" does not mean "anything goes". A row's icon size, its label and
 * its type scale are the shape of the rail; if one row could change them, one
 * row could set the width of the whole thing.
 *
 * So these are enforced in CSS rather than asked for in a README. Each story
 * here passes DELIBERATELY WRONG data and shows the rail holding its shape
 * anyway.
 */
const meta = {
  title: 'Side nav/Rules',
  component: AppSideNav,
  args: {
    activeId: 'home',
    onNavigate: () => {},
    isPinned: true,
    railTheme: 'Light' as const,
    logo: <DemoLogo />,
    workspace: <WorkspaceLabel name="Northwind Ltd" />,
  },
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

// ── icon size ──────────────────────────────────────────────────────────────

/** Correct data: every glyph built with NAV_ICON_SIZE. */
const CORRECT: NavItem[] = [
  { id: 'home', label: 'Home', icon: icon(House) },
  { id: 'finance', label: 'Finance', icon: icon(Wallet) },
]

/** Deliberately wrong: 8px, 32px and 64px glyphs in the same rail. */
const WRONG_ICON_SIZES: NavItem[] = [
  { id: 'home', label: 'Correct — NAV_ICON_SIZE', icon: <House size={NAV_ICON_SIZE} /> },
  { id: 'tiny', label: 'Passed size={8}', icon: <House size={8} /> },
  { id: 'big', label: 'Passed size={32}', icon: <House size={32} /> },
  { id: 'huge', label: 'Passed size={64}', icon: <House size={64} /> },
]

/**
 * THE ICON IS 14px, WHATEVER YOU PASS.
 *
 * All four rows below ask for a different glyph size. All four render at 14px
 * inside the SDK's 16px slot, so every label still starts at the same x and the
 * rail is still 240px.
 *
 * The clamp is CSS on the icon slot's `> svg`. It works because icon libraries
 * set width/height as presentation ATTRIBUTES, which CSS beats without
 * `!important` — so a stray `size={64}` in someone's nav data is harmless
 * rather than catastrophic.
 *
 * `NAV_ICON_SIZE` is exported so correct data is easy to write. This rule is
 * what makes incorrect data survivable.
 */
export const IconSizeIsFixed: Story = {
  args: { items: WRONG_ICON_SIZES },
}

/** For comparison — data that was right to begin with. Identical result. */
export const IconSizeWhenCorrect: Story = {
  args: { items: CORRECT },
}

// ── the label ──────────────────────────────────────────────────────────────

const LONG_LABELS: NavItem[] = [
  { id: 'short', label: 'Home', icon: icon(House) },
  {
    id: 'long',
    label: 'A label long enough that it cannot possibly fit inside 240 pixels of rail',
    icon: icon(Wallet),
  },
  {
    id: 'unbroken',
    label: 'Averylongunbrokenwordwithnospacesatallwhichcannotwrapanywhere',
    icon: icon(House),
  },
]

/**
 * THE LABEL IS ONE LINE, AND IT ELLIPSISES.
 *
 * Not a style preference. A wrapped label changes the row's height, and rows of
 * different heights make the icon column look broken — so the label is
 * `white-space: nowrap` with `text-overflow: ellipsis`, including for a single
 * unbroken word with nowhere to wrap.
 *
 * The clipped label is exactly the case the tooltip exists for: hover either of
 * the bottom two rows and you get the full text. That is also the ONLY case an
 * expanded row shows a tooltip — a label that fits shows none, because
 * repeating text that is already on screen is noise.
 *
 * Which is why `label` is a `string` and not a `ReactNode`. Arbitrary markup
 * could not be measured for truncation, so the tooltip rule would silently stop
 * working.
 */
export const LabelIsOneLine: Story = {
  args: { items: LONG_LABELS },
}

// ── the type scale ─────────────────────────────────────────────────────────

const SCALE: NavItem[] = [
  { id: 'row', label: 'A nav row — 14px / 400', icon: icon(House) },
  {
    kind: 'section',
    id: 'group',
    label: 'A section label — 12px',
    items: [{ id: 'child', label: 'A row inside it — 14px / 400', icon: icon(Wallet) }],
  },
]

/**
 * THE TYPE SCALE IS FIXED, AND SO IS THE WEIGHT.
 *
 *   nav row        14px / 400 / --line-height-200
 *   section label  12px, one step down, so the hierarchy reads
 *   active row     STILL 400
 *
 * The active row keeping its weight is the one worth calling out. The SDK bolds
 * it (`--active { font-weight: 500 }`); that is overridden here, because the
 * active row is already marked by its background and its ink. Bolding it too
 * makes the text reflow by a pixel or two as you navigate, and a rail whose
 * labels shift when you click is unsettling in a way that is hard to name.
 *
 * Click a row to see it: the pill moves, the text does not.
 */
export const TypeScaleIsFixed: Story = {
  args: { items: SCALE },
}

// ── what the host actually controls ────────────────────────────────────────

/**
 * SO WHAT IS YOURS?
 *
 *   the rows        id, label text, which glyph, badge, and the nesting
 *   the header      logo, organisation row — both take any node
 *   the footer      any node
 *
 * And what is not: the glyph's size, the label's type and line count, the row's
 * height, the 240/48 widths, the tooltip rule, the peek timings.
 *
 * The split is not arbitrary. Everything on the first list is CONTENT, which
 * differs per product. Everything on the second is the rail's SHAPE, which is
 * the thing the package exists to keep consistent — if a consumer had to get
 * these right themselves, they would be reimplementing the rail rather than
 * using it.
 */
export const WhatYouControl: Story = {
  args: {
    items: [
      { id: 'home', label: 'Yours: the label text', icon: icon(House) },
      {
        id: 'finance',
        label: 'Yours: the glyph and the badge',
        icon: icon(Wallet),
        badge: { kind: 'count', value: 12, tone: 'info' },
      },
      {
        kind: 'section',
        id: 'group',
        label: 'Yours: the grouping',
        items: [{ id: 'child', label: 'Ours: everything about how this looks', icon: icon(House) }],
      },
    ],
  },
}
