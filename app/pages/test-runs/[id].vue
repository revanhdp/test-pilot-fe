<script setup lang="ts">
import { RotateCw, TriangleAlert } from '@lucide/vue'
import type { TestRunDetail } from '~/types/api'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)
const { $api } = useNuxtApp()
const { select } = useProjects()
const { start, starting, error: rerunError } = useStartRun()

const { data: run, refresh, error } = await useAsyncData(
  () => `run:${id.value}`,
  () => $api<TestRunDetail>(`/test-runs/${id.value}`),
)

watch(run, (r) => r && select(r.projectId), { immediate: true })
useHead({ title: () => `Run #${run.value?.number ?? ''} · TestPilot AI` })

const active = computed(() => (run.value ? isActiveStatus(run.value.status) : false))
usePolling(refresh, active, 1200)

// Selected result: from ?result=, else the first failure, else the running one, else the first.
const selectedId = computed({
  get: () => {
    const results = run.value?.results ?? []
    const fromQuery = results.find((r) => r.id === route.query.result)
    return (
      fromQuery ??
      results.find((r) => r.status === 'FAILED' || r.status === 'ERROR') ??
      results.find((r) => r.status === 'RUNNING') ??
      results[0]
    )?.id
  },
  set: (resultId) => router.replace({ query: { result: resultId } }),
})
const selected = computed(() => run.value?.results.find((r) => r.id === selectedId.value) ?? null)

const passRate = computed(() => (run.value ? runPassRate(run.value) : null))
const completed = computed(() =>
  run.value ? run.value.passedTests + run.value.failedTests + run.value.skippedTests : 0,
)

const rerunnable = computed(() => run.value?.results.filter((r) => r.testCaseId).map((r) => r.testCaseId!) ?? [])
function rerun() {
  if (!run.value?.environmentId) return
  void start({ environmentId: run.value.environmentId, testCaseIds: rerunnable.value })
}
</script>

<template>
  <div v-if="error" class="panel">
    <UiEmptyState title="Run not found" description="It may have been deleted, or it belongs to another account.">
      <UiButton to="/test-runs">Back to test runs</UiButton>
    </UiEmptyState>
  </div>

  <div v-else-if="run">
    <AppPageHeader :title="`Run #${run.number}`" :eyebrow="run.project.name">
      <span class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <RunStatusBadge :status="run.status" />
        <span>{{ run.environmentName }} <span class="font-mono text-xs text-fg-subtle">{{ prettyUrl(run.baseUrl) }}</span></span>
        <span class="text-fg-subtle">·</span>
        <span class="font-mono text-xs uppercase">{{ run.browser }}</span>
        <span class="text-fg-subtle">·</span>
        <span :title="formatDateTime(run.createdAt)">{{ run.triggeredBy?.name ?? 'Unknown' }}, {{ formatRelative(run.createdAt) }}</span>
      </span>
      <template #actions>
        <UiButton
          :loading="starting"
          :disabled="active || !run.environmentId || !rerunnable.length"
          :title="!run.environmentId ? 'The environment of this run was deleted' : undefined"
          @click="rerun"
        >
          <RotateCw v-if="!starting" /> Re-run
        </UiButton>
      </template>
    </AppPageHeader>

    <UiAlert :message="rerunError" class="mb-4" />

    <!-- Summary strip -->
    <section class="panel mb-6 overflow-hidden">
      <div class="grid grid-cols-2 divide-line sm:grid-cols-5 sm:divide-x">
        <div class="p-4">
          <p class="eyebrow">Passed</p>
          <p class="mt-1 font-mono text-2xl font-medium text-pass tabular-nums">{{ run.passedTests }}</p>
        </div>
        <div class="p-4">
          <p class="eyebrow">Failed</p>
          <p :class="['mt-1 font-mono text-2xl font-medium tabular-nums', run.failedTests ? 'text-fail' : 'text-fg-subtle']">{{ run.failedTests }}</p>
        </div>
        <div class="p-4">
          <p class="eyebrow">Skipped</p>
          <p class="mt-1 font-mono text-2xl font-medium text-fg-subtle tabular-nums">{{ run.skippedTests }}</p>
        </div>
        <div class="p-4">
          <p class="eyebrow">Pass rate</p>
          <p class="mt-1 font-mono text-2xl font-medium tabular-nums">{{ formatPercent(passRate, 1) }}</p>
        </div>
        <div class="col-span-2 p-4 sm:col-span-1">
          <p class="eyebrow">Duration</p>
          <p class="mt-1 font-mono text-2xl font-medium tabular-nums">{{ formatDuration(runDuration(run)) }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 border-t border-line px-4 py-2.5">
        <RunResultBar class="flex-1" height="md" :passed="run.passedTests" :failed="run.failedTests" :skipped="run.skippedTests" :total="run.totalTests" />
        <span class="font-mono text-[11px] text-fg-subtle tabular-nums">{{ completed }}/{{ run.totalTests }}</span>
      </div>
      <div v-if="run.errorMessage" class="flex items-start gap-2 border-t border-warn/20 bg-warn/[0.06] px-4 py-2.5 text-xs text-warn">
        <TriangleAlert class="mt-px size-3.5 shrink-0" /> {{ run.errorMessage }}
      </div>
    </section>

    <!-- Results + detail -->
    <div class="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section class="panel overflow-hidden lg:sticky lg:top-0">
        <div class="panel-header">
          <h2 class="panel-title">Results</h2>
          <span class="font-mono text-[11px] text-fg-subtle">{{ run.results.length }}</span>
        </div>
        <ul class="max-h-[70vh] divide-y divide-line overflow-y-auto">
          <li v-for="result in run.results" :key="result.id">
            <button
              type="button"
              :class="[
                'relative flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors',
                selectedId === result.id ? 'bg-overlay' : 'hover:bg-raised',
              ]"
              @click="selectedId = result.id"
            >
              <span v-if="selectedId === result.id" class="absolute inset-y-0 left-0 w-0.5 bg-accent" />
              <RunStatusIcon :status="result.status" class="mt-0.5" />
              <span class="min-w-0 flex-1">
                <span class="flex items-baseline gap-2">
                  <span class="font-mono text-[11px] text-fg-subtle">{{ result.testCaseSnapshot.key }}</span>
                  <span class="ml-auto font-mono text-[11px] text-fg-subtle tabular-nums">{{ result.durationMs != null ? formatDuration(result.durationMs) : '' }}</span>
                </span>
                <span class="mt-0.5 block truncate text-[13px] text-fg">{{ result.testCaseSnapshot.title }}</span>
                <span v-if="result.status === 'FAILED' || result.status === 'ERROR'" class="mt-0.5 block truncate text-xs text-fail/80">
                  {{ result.failedStep ? `Step ${result.failedStep}: ` : '' }}{{ result.errorMessage?.split('\n')[0] }}
                </span>
              </span>
            </button>
          </li>
        </ul>
      </section>

      <section class="panel min-w-0 p-5">
        <RunResultDetail v-if="selected" :key="selected.id" :result="selected" :browser="run.browser" />
      </section>
    </div>
  </div>
</template>
