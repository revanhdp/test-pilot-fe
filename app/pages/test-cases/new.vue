<script setup lang="ts">
import type { Environment, TestCaseDetail, TestSuite } from '~/types/api'

useHead({ title: 'New test case · TestPilot AI' })

const route = useRoute()
const { $api } = useNuxtApp()
const { current, refresh: refreshProjects } = useProjects()

const { data } = await useAsyncData(
  () => `new-test-case:${current.value?.id}`,
  async () => {
    if (!current.value) return null
    const query = { projectId: current.value.id }
    const [suites, environments] = await Promise.all([
      $api<TestSuite[]>('/test-suites', { query }),
      $api<Environment[]>('/environments', { query }),
    ])
    return { suites, environments }
  },
)

const defaultSuiteId = typeof route.query.suite === 'string' ? route.query.suite : undefined

async function onSaved(testCase: TestCaseDetail) {
  await refreshProjects()
  await navigateTo(`/test-cases/${testCase.id}`, { replace: true })
}
</script>

<template>
  <div v-if="!current" class="panel">
    <UiEmptyState title="Create a project first" description="Test cases belong to a project.">
      <UiButton variant="primary" to="/projects?new=1">New project</UiButton>
    </UiEmptyState>
  </div>
  <TestCaseEditor
    v-else-if="data"
    :project-id="current.id"
    :suites="data.suites"
    :environments="data.environments"
    :default-suite-id="defaultSuiteId"
    @saved="onSaved"
  />
</template>
