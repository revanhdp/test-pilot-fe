<script setup lang="ts">
import { FolderKanban, Plus, Workflow } from '@lucide/vue'
import type { TestRunListItem } from '~/types/api'

useHead({ title: 'Test runs · TestPilot AI' })

const { $api } = useNuxtApp()
const { current } = useProjects()
const projectId = computed(() => current.value?.id ?? null)

const { data: runs, refresh } = await useAsyncData(
  () => `runs:${projectId.value}`,
  () =>
    projectId.value
      ? $api<TestRunListItem[]>('/test-runs', { query: { projectId: projectId.value } })
      : Promise.resolve([]),
  { watch: [projectId] },
)

const anyActive = computed(() => runs.value?.some((run) => isActiveStatus(run.status)) ?? false)
usePolling(refresh, anyActive, 2000)
</script>

<template>
  <div>
    <AppPageHeader title="Test runs" :eyebrow="current?.name">
      Every execution of one or more test cases against an environment.
      <template v-if="current" #actions>
        <UiButton to="/test-cases">Choose tests to run</UiButton>
      </template>
    </AppPageHeader>

    <div class="panel overflow-hidden">
      <UiEmptyState v-if="!current" title="Create a project first" description="Runs execute a project's test cases against one of its environments.">
        <template #icon><FolderKanban /></template>
        <UiButton variant="primary" to="/projects?new=1"><Plus /> New project</UiButton>
      </UiEmptyState>

      <UiEmptyState v-else-if="!runs?.length" title="No runs yet" description="Open a test case or a suite and start a run. Results, screenshots and timings will appear here.">
        <template #icon><Workflow /></template>
        <UiButton variant="primary" to="/test-cases">Go to test cases</UiButton>
      </UiEmptyState>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[860px] text-left text-[13px]">
          <thead>
            <tr class="border-b border-line text-xs text-fg-subtle">
              <th class="px-4 py-2.5 font-medium">Run</th>
              <th class="px-3 py-2.5 font-medium">Status</th>
              <th class="px-3 py-2.5 font-medium">Environment</th>
              <th class="w-64 px-3 py-2.5 font-medium">Results</th>
              <th class="px-3 py-2.5 text-right font-medium">Pass rate</th>
              <th class="px-3 py-2.5 text-right font-medium">Duration</th>
              <th class="px-4 py-2.5 text-right font-medium">Started</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="run in runs" :key="run.id" class="cursor-pointer transition-colors hover:bg-raised" @click="navigateTo(`/test-runs/${run.id}`)">
              <td class="px-4 py-3">
                <NuxtLink :to="`/test-runs/${run.id}`" class="font-mono font-medium text-fg" @click.stop>#{{ run.number }}</NuxtLink>
                <p class="mt-0.5 text-xs text-fg-subtle">{{ run.triggeredBy?.name ?? '—' }} · {{ run.browser }}</p>
              </td>
              <td class="px-3 py-3"><RunStatusBadge :status="run.status" /></td>
              <td class="px-3 py-3">
                <p class="text-fg-muted">{{ run.environmentName }}</p>
                <p class="max-w-[200px] truncate font-mono text-[11px] text-fg-subtle">{{ prettyUrl(run.baseUrl) }}</p>
              </td>
              <td class="px-3 py-3">
                <RunResultBar :passed="run.passedTests" :failed="run.failedTests" :skipped="run.skippedTests" :total="run.totalTests" />
                <p class="mt-1.5 flex gap-3 font-mono text-[11px] tabular-nums">
                  <span class="text-pass">{{ run.passedTests }} passed</span>
                  <span :class="run.failedTests ? 'text-fail' : 'text-fg-subtle'">{{ run.failedTests }} failed</span>
                  <span v-if="run.skippedTests" class="text-fg-subtle">{{ run.skippedTests }} skipped</span>
                  <span class="text-fg-subtle">/ {{ run.totalTests }}</span>
                </p>
              </td>
              <td class="px-3 py-3 text-right font-mono text-xs text-fg-muted tabular-nums">{{ formatPercent(runPassRate(run), 1) }}</td>
              <td class="px-3 py-3 text-right font-mono text-xs text-fg-muted tabular-nums">{{ formatDuration(runDuration(run)) }}</td>
              <td class="px-4 py-3 text-right text-xs text-fg-subtle" :title="formatDateTime(run.createdAt)">{{ formatRelative(run.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
