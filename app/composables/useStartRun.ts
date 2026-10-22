import type { TestRunDetail } from '~/types/api'

export interface StartRunInput {
  environmentId: string
  testCaseIds?: string[]
  suiteId?: string
}

/** Starts a run and opens its live detail page. */
export function useStartRun() {
  const { $api } = useNuxtApp()
  const starting = ref(false)
  const error = ref<string | null>(null)

  async function start(input: StartRunInput): Promise<TestRunDetail | null> {
    starting.value = true
    error.value = null
    try {
      const run = await $api<TestRunDetail>('/test-runs', { method: 'POST', body: input })
      await navigateTo(`/test-runs/${run.id}`)
      return run
    } catch (e) {
      error.value = errorMessage(e)
      return null
    } finally {
      starting.value = false
    }
  }

  return { start, starting, error }
}
