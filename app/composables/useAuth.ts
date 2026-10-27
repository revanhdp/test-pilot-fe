import type { User } from '~/types/api'

/**
 * The signed-in user. Sign-in, sign-up and password flows are Clerk's; the
 * API returns the matching local user (created on first request).
 */
export function useAuth() {
  const { $api, $clerk } = useNuxtApp()
  const user = useState<User | null>('auth:user', () => null)
  const loaded = useState('auth:loaded', () => false)

  /** Loads the user once per app load. */
  async function fetchUser(): Promise<User | null> {
    if (loaded.value) return user.value
    if (!$clerk.session) {
      user.value = null
    } else {
      try {
        user.value = (await $api<{ user: User }>('/auth/me')).user
      } catch {
        user.value = null
      }
    }
    loaded.value = true
    return user.value
  }

  /** Call after Clerk finishes a sign-in so the next navigation sees the new user. */
  function reset() {
    loaded.value = false
    user.value = null
  }

  async function logout() {
    await $clerk.signOut().catch(() => undefined)
    reset()
    clearNuxtState(['projects', 'currentProjectId'])
    await navigateTo('/login')
  }

  return { user, loaded, fetchUser, reset, logout }
}
