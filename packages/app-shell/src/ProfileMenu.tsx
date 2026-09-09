import { Menu, MenuItem, MenuSeparator } from './Menu'
import type { ShellUser } from './types'
import styles from './ProfileMenu.module.css'

/** One entry in the profile menu. Data, so the shell hardcodes no actions. */
export interface ProfileAction {
  id: string
  label: string
  onSelect: () => void
  /** `danger` for sign out — the one destructive action a profile menu has. */
  tone?: 'danger'
}

interface ProfileMenuProps {
  user: ShellUser
  actions?: ProfileAction[]
}

/**
 * First letter of the first two words. Two initials rather than one because a
 * single letter collides constantly in any real user list; more than two stop
 * fitting the circle at this size.
 */
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function ProfileMenu({ user, actions = [] }: ProfileMenuProps) {
  return (
    <Menu
      label={`Account: ${user.name}`}
      triggerClassName={styles.trigger}
      trigger={
        <span className={styles.avatar} aria-hidden="true">
          {user.avatarUrl ? (
            // `alt=""` because the button's aria-label already names the user;
            // a described image here would announce the name twice.
            <img className={styles.image} src={user.avatarUrl} alt="" />
          ) : (
            initials(user.name)
          )}
        </span>
      }
    >
      {(close) => (
        <>
          <div className={styles.identity}>
            <span className={styles.name}>{user.name}</span>
            {user.email && <span className={styles.email}>{user.email}</span>}
          </div>
          {actions.length > 0 && <MenuSeparator />}
          {actions.map((action) => (
            <MenuItem
              key={action.id}
              tone={action.tone}
              onClick={() => {
                action.onSelect()
                close()
              }}
            >
              {action.label}
            </MenuItem>
          ))}
        </>
      )}
    </Menu>
  )
}
