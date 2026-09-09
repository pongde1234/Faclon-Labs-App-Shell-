import { Modal, ModalBody, ModalHeader } from '@faclon-labs/fds/modal'

import { ThemeTiles } from './ThemeTiles'
import type { ThemePreference } from './useAppTheme'

/**
 * Appearance — the theme picker, as a RadioGroup in a Modal.
 *
 * WHY NOT IN THE MENU. This lived in the account menu twice and neither worked.
 * A ChipGroup inside a row put four <button>s inside a `menuitem`, which
 * ActionList forbids outright ("the row is the only click target — a nested
 * control … can never be reached by keyboard") and which measured exactly that:
 * Tab left the open menu for the page behind it, and the chips were never
 * focusable. Splitting it into one row per theme fixed the keyboard but not the
 * announcement: ActionListItem does not forward aria-current, ActionListItemIcon
 * is locked aria-hidden, and selectionType="single" is inert under a button
 * trigger — so the check beside the active theme was decoration and a screen
 * reader heard four identical rows.
 *
 * RadioGroup is what fds actually builds for this. Its guard names the case —
 * "a single setting with 2-5 named options" — and is blunt that the compact
 * control the original design wanted does not exist: "a segmented control — NOT
 * BUILT. Say so; do not substitute a RadioGroup." Real radio semantics carry the
 * current value for free, which is the whole reason for the move.
 *
 * No ModalFooter: selecting applies immediately, so there is nothing to confirm
 * and no Cancel to honour. Dismiss is the only action, and Modal already gives
 * it three ways (✕, backdrop, Escape).
 */
export function AppearanceModal({
  isOpen,
  onClose,
  preference,
  onPreferenceChange,
}: {
  isOpen: boolean
  onClose: () => void
  preference: ThemePreference
  onPreferenceChange: (next: ThemePreference) => void
}) {
  return (
    // size is lowercase here — ModalSize is 'sm' | 'md' | 'lg' | 'full', unlike
    // the PascalCase Badge/Counter/Avatar take. No accessibilityLabel: the
    // header's title already names the dialog, and passing both names it twice.
    <Modal isOpen={isOpen} onDismiss={onClose} size="sm">
      <ModalHeader title="Appearance" subtitle="How the interface looks on this device." />
      <ModalBody>
        <ThemeTiles value={preference} onChange={onPreferenceChange} />
      </ModalBody>
    </Modal>
  )
}
