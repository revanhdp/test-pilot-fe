import type { ProjectListItem } from '~/types/api'

/**
 * The user's projects and the "current" one that scopes the Test cases and
 * Test runs pages. The selection is remembered in a cookie.
 */
export function useProjects() {
  const { $api } = useNuxtApp()
  const projects = useState<ProjectListItem[] | null>('projects', () => null)
  const cookie = useCookie<string | null>('tp_project', {
    default: () => null,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })
  const currentId = useState<string | null>('currentProjectId', () => cookie.value)

  const current = computed(
    () =>
      projects.value?.find((project) => project.id === currentId.value) ??
      projects.value?.[0] ??
      null,
  )

  async function refresh() {
    projects.value = await $api<ProjectListItem[]>('/projects')
  }

  async function ensureLoaded() {
    if (!projects.value) await refresh()
  }

  function select(id: string) {
    currentId.value = id
    cookie.value = id
  }

  return { projects, current, refresh, ensureLoaded, select }
}
