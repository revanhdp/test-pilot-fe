import type { User } from '~/types/api'

export function useAuth() {
  const { $api } = useNuxtApp()
  const user = useState<User | null>('auth:user', () => null)
  const loaded = useState('auth:loaded', () => false)

  /** Loads the session once per app load. */
  async function fetchUser(): Promise<User | null> {
    if (loaded.value) return user.value
    try {
      user.value = (await $api<{ user: User | null }>('/auth/me')).user
    } catch {
      user.value = null
    }
    loaded.value = true
    return user.value
  }

  async function login(input: { email: string; password: string }) {
    const res = await $api<{ user: User }>('/auth/login', { method: 'POST', body: input })
    user.value = res.user
    loaded.value = true
  }

  async function register(input: { name: string; email: string; password: string }) {
    const res = await $api<{ user: User }>('/auth/register', { method: 'POST', body: input })
    user.value = res.user
    loaded.value = true
  }

  async function logout() {
    await $api('/auth/logout', { method: 'POST' }).catch(() => undefined)
    user.value = null
    clearNuxtState(['projects', 'currentProjectId'])
    await navigateTo('/login')
  }

  return { user, loaded, fetchUser, login, register, logout }
}
