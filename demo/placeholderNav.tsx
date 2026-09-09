import { Boxes, Circle, FileText, Folder, Layers, Square, Triangle } from 'lucide-react'

import { NAV_ICON_SIZE, type NavItem } from '@faclon-labs/iosense-shell'

/**
 * A PLACEHOLDER nav. Not a product's — deliberately.
 *
 * The iosense rows that used to be here (Zomato, Steam Trap, Memory B, and
 * nineteen others) are gone: they were our pages, and a demo that shows them is
 * a demo of our app rather than of the shell. A host adds their own.
 *
 * WHAT IS LEFT, AND WHY IT IS NOT EMPTY. The rail's BEHAVIOUR — the accordion
 * that unfolds and remembers, the section that hides and unhides its rows, the
 * collapse to 48px, the hover peek, the flyout, the badge that becomes a dot —
 * is the whole product of this package, and none of it can be seen against an
 * empty rail. Storybook covers every case in isolation; this is the one place
 * you can click through them in a real shell.
 *
 * So these rows exist ONLY to demonstrate the three shapes:
 *
 *   two plain entities   one with a count, one with a word, so the badge rules
 *                        and the collapsed dot are both visible
 *   one accordion        unfolds in place; opens a flyout when collapsed
 *   one section          folds its rows away; forced open when collapsed
 *
 * The labels say what each thing IS rather than naming a page, because there is
 * no page behind any of them. Replace the whole file.
 */
export const PLACEHOLDER_NAV: NavItem[] = [
  { id: 'first', label: 'A plain row', icon: <Circle size={NAV_ICON_SIZE} /> },
  {
    id: 'with-count',
    label: 'A row with a count',
    icon: <Square size={NAV_ICON_SIZE} />,
    // A quantity -> Counter, and `info` because a plain number is not news.
    // Collapsed, this becomes a dot on the icon.
    badge: { kind: 'count', value: 12, tone: 'info' },
  },
  {
    id: 'with-word',
    label: 'A row with a word',
    icon: <Triangle size={NAV_ICON_SIZE} />,
    // A word -> Badge. `label` tone draws NO collapsed dot: it is not state.
    badge: { kind: 'word', label: 'Beta', tone: 'label' },
  },
  {
    // THE ACCORDION. Click the parent to unfold. Collapse the rail and click it
    // again — the children fly out beside the 48px strip instead, because there
    // is nowhere to unfold into. The open state is remembered across reloads.
    id: 'group',
    label: 'An accordion',
    icon: <Layers size={NAV_ICON_SIZE} />,
    children: [
      { id: 'group-one', label: 'First child', icon: <FileText size={NAV_ICON_SIZE} /> },
      { id: 'group-two', label: 'Second child', icon: <FileText size={NAV_ICON_SIZE} /> },
      {
        // `isRecord` draws the tree branch differently — this is one INSTANCE
        // rather than a page, and it is the case that makes a three-crumb trail.
        id: 'group-record',
        label: 'A record with a long name that will not fit',
        icon: <Folder size={NAV_ICON_SIZE} />,
        isRecord: true,
      },
    ],
  },
  {
    // THE SECTION. Click "A section" to fold its rows away. Collapse the rail
    // and it is forced back open — folded, the label would be a hairline with
    // no affordance to unfold it and both rows below would be stranded.
    kind: 'section',
    id: 'section',
    label: 'A section',
    items: [
      { id: 'section-one', label: 'Inside the section', icon: <Boxes size={NAV_ICON_SIZE} /> },
      { id: 'section-two', label: 'Also inside it', icon: <Boxes size={NAV_ICON_SIZE} /> },
    ],
  },
]

/**
 * An accordion parent is not a page — it has no content of its own — so an id
 * landing on one is redirected to a real child.
 *
 * Written out rather than `children[0]`: here the first child happens to be
 * right, which is exactly what would make an implicit first-child rule look
 * correct until a nav whose first child is a specific record proved it wrong.
 */
export const PLACEHOLDER_SECTION_DEFAULT: Record<string, string> = {
  group: 'group-one',
}

/** A record sits inside the list it belongs to — one level the rail does not draw. */
export const PLACEHOLDER_RECORD_PARENT: Record<string, string> = {
  'group-record': 'group-one',
}
