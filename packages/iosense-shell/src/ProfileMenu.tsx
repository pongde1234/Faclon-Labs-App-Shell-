import { useState, type ReactElement } from 'react'
import { LogOut, Palette, Settings, User } from 'lucide-react'
import { Avatar } from '@faclon-labs/fds/avatar'
import { Badge } from '@faclon-labs/fds/badge'
import { DropdownMenu, DropdownMenuHeader, DropdownMenuOverlay, DropdownMenuTrigger } from '@faclon-labs/fds/dropdownmenu'
import {
  ActionList,
  ActionListItem,
  ActionListItemIcon,
  ActionListItemText,
} from '@faclon-labs/fds/actionlist'

import { AppearanceModal } from './AppearanceModal'
import { themeLabel } from './themes'
import type { ThemePreference } from './useAppTheme'
import { fullName, type Profile } from './profile'

export function ProfileMenu({
  profile,
  onOpenProfile,
  preference,
  onPreferenceChange,
  trigger,

}: {
  profile: Profile
  onOpenProfile: () => void
  /** Theme state is owned by App — the rail reads it too, so it can't live here. */
  preference: ThemePreference
  onPreferenceChange: (next: ThemePreference) => void
  /** Custom opener (e.g. the rail's avatar + name). Defaults to the avatar button. */
  trigger?: React.ReactNode
  /** Where the menu hangs relative to the trigger. */
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false)

  const close = () => setIsOpen(false)

  const openProfile = () => {
    close()
    onOpenProfile()
  }

  // Close the menu FIRST. DropdownMenu and Modal each own a focus trap, and
  // opening the modal from inside the open menu would put both on screen at
  // once — the same ordering openProfile uses.
  const openAppearance = () => {
    close()
    setIsAppearanceOpen(true)
  }

  return (
    <>
    <DropdownMenu
      isOpen={isOpen}
      onOpenChange={({ isOpen: next }) => (next ? setIsOpen(true) : close())}
    >
      {/* fds anchors the overlay itself (bottom-start, flipping to fit), so the
          old `placement` has nowhere to go. */}
      <DropdownMenuTrigger>
        {(trigger as ReactElement<Record<string, unknown>>) ?? (
          /* The ONLY definition of this trigger. AppTopBar used to pass its own
             near-copy, which drifted from it; keep it that way.

             No presence dot here by ruling — the top bar shows who you are, not
             how you are. The menu header still carries one, which is where the
             identity block has room to say more than the name. Because the dot
             is gone the label drops back to plain "Account menu": it named the
             presence only because the Avatar is accessibilityLabel=""
             (decorative, so the button is not announced twice) and an
             aria-hidden avatar takes `indicatorLabel` down with it. */
          <button type="button" className="profile-trigger" aria-label="Account menu">
            <Avatar
              size="Small"
              color="Information"
              src={profile.avatarUrl || undefined}
              name={profile.avatarUrl ? undefined : fullName(profile)}
              accessibilityLabel=""
            />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuOverlay>
        <DropdownMenuHeader
          title={fullName(profile)}
          subtitle={profile.email}
          /* The span is the contract, not decoration. DropdownMenuHeader wraps
             `titleSuffix` and `trailing` in a header-slot itself but renders
             `leading` RAW, because it expects an already-slot-shaped node —
             which is all DropdownMenuHeaderIcon and DropdownMenuHeaderAsset
             are. That slot is a fixed 28px centred box, and the component's own
             note says the point of it is that title, leading, titleSuffix and
             trailing "want to be centred against each OTHER, not against their
             own line boxes". A bare Avatar skips the box and top-aligns as a
             24px flex child, landing 2px — (28-24)/2 — above the centreline the
             name and the org Badge share.

             Neither shipped helper fits: Icon takes a lucide component at 20px,
             Asset takes an <img> at 32×32, and this needs an initials fallback
             and a status dot. So it meets the same contract by hand. */
          leading={
            <span className="ds-dropdown-menu__header-slot">
              <Avatar
                size="Small"
                color="Information"
                src={profile.avatarUrl || undefined}
                name={profile.avatarUrl ? undefined : fullName(profile)}
                icon={User} indicator="Positive" indicatorLabel="Online"
              />
            </span>
          }
          trailing={
            <Badge size="Small" color="Neutral" emphasis="Subtle" label={profile.org} />
          }
        />
        <ActionList accessibilityLabel="Account menu">
          <ActionListItem
            title="Settings"
            value="settings"
            leading={<ActionListItemIcon icon={Settings} />}
            onClick={openProfile}
          />

          {/* One row that opens the picker, not the picker itself. The choice
              lives in AppearanceModal on a RadioGroup — see that file for why
              neither a ChipGroup nor four rows could carry it here.

              The trailing slot names the current theme, so the answer is visible
              without opening anything, and ActionListItemText is what R14 allows
              there. Unlike the check it replaces, this is real text: a screen
              reader reads "Theme, Light" rather than announcing nothing. */}
          <ActionListItem
            title="Theme"
            value="theme"
            leading={<ActionListItemIcon icon={Palette} />}
            trailing={<ActionListItemText>{themeLabel(preference)}</ActionListItemText>}
            onClick={openAppearance}
          />

          {/* Negative by product decision, over the guard's rule. ActionList
              defines intent="negative" as "the row destroys something (delete,
              revoke, disconnect) — not merely 'be careful'", and signing out
              destroys nothing: it is the most reversible action here. The call
              is that ending the session should still read as weighty.

              What that costs, so it is not rediscovered later: negative is now
              spent on a row that appears in every session, which is the "if
              every row is red, none of them reads as dangerous" case the guard
              warns about. If a genuinely destructive row is ever added here —
              Delete account, Revoke all sessions — it will not stand out, and
              this one should go neutral to make room for it. */}
          <ActionListItem
            title="Log Out"
            value="logout"
            intent="negative"
            leading={<ActionListItemIcon icon={LogOut} />}
            onClick={close}
          />
        </ActionList>
      </DropdownMenuOverlay>
    </DropdownMenu>

    {/* Sibling of the menu, not a child of it: Modal unmounts entirely while
        closed, and nesting it inside the overlay would tie its lifetime to the
        menu that opened it — which closes on the very click that opens this. */}
    <AppearanceModal
      isOpen={isAppearanceOpen}
      onClose={() => setIsAppearanceOpen(false)}
      preference={preference}
      onPreferenceChange={onPreferenceChange}
    />
    </>
  )
}
