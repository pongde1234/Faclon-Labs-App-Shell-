import { useCallback, useEffect, useState } from 'react'

export interface Profile {
  firstName: string
  lastName: string
  gender: string
  /** Organisation shown under the name on the identity card. */
  org: string
  email: string
  phone: string
  jobTitle: string
  location: string
  bio: string
  /** Data URL for an uploaded avatar; empty falls back to initials. */
  avatarUrl: string
}

/**
 * A blank profile — what `useProfile()` starts from when you give it no seed.
 *
 * The default is EMPTY rather than a person on purpose: this package is the
 * chrome, and a chrome that ships someone's name and email address as its
 * default state puts that person into every install.
 */
export const EMPTY_PROFILE: Profile = {
  firstName: '',
  lastName: '',
  gender: '',
  org: '',
  email: '',
  phone: '',
  jobTitle: '',
  location: '',
  bio: '',
  avatarUrl: '',
}

/**
 * The iosense product's own seed data — an EXAMPLE, the way IOSENSE_NAV is.
 * Stands in for whatever the account API would return.
 *
 * Do not pass this in a product that is not iosense: it is a real person.
 */
export const IOSENSE_PROFILE: Profile = {
  firstName: 'Siddharth',
  lastName: 'Jain',
  gender: 'Prefer not to say',
  org: 'Faclon Labs',
  email: 'siddharth.j@iosense.io',
  phone: '+91 98200 41122',
  jobTitle: 'Operations Lead',
  location: 'Mumbai, India',
  bio: 'Runs cold-chain monitoring across 240 retail sites. Watches door events and humidity more than anyone should.',
  avatarUrl: '',
}

export const GENDERS = ['Male', 'Female', 'Others', 'Prefer not to say']

export const LOCATIONS = [
  'Mumbai, India',
  'Delhi, India',
  'Bangalore, India',
  'Chennai, India',
  'Kolkata, India',
  'Remote',
]

export const fullName = (p: Profile) => `${p.firstName} ${p.lastName}`.trim()

const STORAGE_KEY = 'iosense:profile'

/** Max avatar payload. Data URLs land in localStorage, which caps out ~5MB. */
export const MAX_AVATAR_BYTES = 1_000_000

/** Earlier builds stored a single `name`; split it so saved profiles survive. */
function migrate(raw: Record<string, unknown>): Partial<Profile> {
  if (typeof raw.name === 'string' && !raw.firstName) {
    const [first, ...rest] = raw.name.trim().split(/\s+/)
    return { ...raw, firstName: first ?? '', lastName: rest.join(' ') }
  }
  return raw as Partial<Profile>
}

/**
 * Local, persisted profile state, for hosts without an account API of their own.
 *
 * `seed` is what a first run starts from, and it is BLANK by default — see
 * EMPTY_PROFILE. If you have a real user, pass them: the hook only owns
 * persistence and the edit form's state, not identity.
 */
export function useProfile(seed: Profile = EMPTY_PROFILE) {
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...seed, ...migrate(JSON.parse(stored)) } : seed
    } catch {
      return seed
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // Quota exceeded (usually an oversized avatar) — keep the in-memory value.
    }
  }, [profile])

  const save = useCallback((next: Profile) => setProfile(next), [])
  // Back to the SEED, not to a package constant — "reset" means "undo my edits",
  // and resetting to someone else's identity would be a strange thing to do.
  const reset = useCallback(() => setProfile(seed), [seed])

  return { profile, save, reset }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
