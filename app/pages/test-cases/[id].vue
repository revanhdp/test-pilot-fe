<script setup lang="ts">
import type { Environment, TestCaseDetail, TestSuite } from '~/types/api'

const route = useRoute()
const id = computed(() => route.params.id as string)
const { $api } = useNuxtApp()
const { select } = useProjects()

const { data, error } = await useAsyncData(
  () => `test-case:${id.value}`,
  async () => {
    const testCase = await $api<TestCaseDetail>(`/test-cases/${id.value}`)
    const query = { projectId: testCase.projectId }
    const [suites, environments] = await Promise.all([
      $api<TestSuite[]>('/test-suites', { query }),
      $api<Environment[]>('/environments', { query }),
    ])
    return { testCase, suites, environments }
  },
)

watch(data, (d) => d && select(d.testCase.projectId), { immediate: true })
useHead({ title: () => `${data.value ? tcKey(data.value.testCase.number) : 'Test case'} · TestPilot AI` })

function onSaved(testCase: TestCaseDetail) {
  if (data.value) data.value = { ...data.value, testCase }
}
</script>

<template>
  <div v-if="error" class="panel">
    <UiEmptyState title="Test case not found" description="It may have been deleted, or it belongs to another account.">
      <UiButton to="/test-cases">Back to test cases</UiButton>
    </UiEmptyState>
  </div>
  <TestCaseEditor
    v-else-if="data"
    :key="data.testCase.id"
    :project-id="data.testCase.projectId"
    :test-case="data.testCase"
    :suites="data.suites"
    :environments="data.environments"
    @saved="onSaved"
  />
</template>
