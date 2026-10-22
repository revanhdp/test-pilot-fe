<script setup lang="ts">
import { RotateCw } from '@lucide/vue'
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
      <span class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span>{{ run.environmentName }} <span class="ml-1 font-mono text-xs text-fg-subtle">{{ prettyUrl(run.baseUrl) }}</span></span>
        <span class="font-mono text-xs text-fg-subtle uppercase"><span class="mr-2">·</span>{{ run.browser }}</span>
        <span :title="formatDateTime(run.createdAt)"><span class="mr-2 text-fg-subtle">·</span>{{ run.triggeredBy?.name ?? 'Unknown' }}, {{ formatRelative(run.createdAt) }}</span>
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

    <!-- Verdict -->
    <section class="panel mb-6 overflow-hidden">
      <div class="flex flex-wrap items-end gap-x-10 gap-y-4 px-5 pt-5 pb-4">
        <div>
          <p class="caption mb-2">Verdict</p>
          <p :class="['display text-5xl leading-[0.9]', TONE_CLASSES[STATUS_META[run.status].tone].text]">
            {{ STATUS_META[run.status].label }}
          </p>
        </div>
        <dl class="flex flex-wrap gap-x-8 gap-y-3 font-mono tabular-nums">
          <div>
            <dt class="caption mb-1 font-sans">Passed</dt>
            <dd :class="['text-xl', run.passedTests ? 'text-pass' : 'text-fg-subtle']">{{ run.passedTests }}</dd>
          </div>
          <div>
            <dt class="caption mb-1 font-sans">Failed</dt>
            <dd :class="['text-xl', run.failedTests ? 'text-fail' : 'text-fg-subtle']">{{ run.failedTests }}</dd>
          </div>
          <div>
            <dt class="caption mb-1 font-sans">Skipped</dt>
            <dd class="text-xl text-fg-subtle">{{ run.skippedTests }}</dd>
          </div>
          <div>
            <dt class="caption mb-1 font-sans">Pass rate</dt>
            <dd class="text-xl">{{ formatPercent(passRate, 1) }}</dd>
          </div>
          <div>
            <dt class="caption mb-1 font-sans">Duration</dt>
            <dd class="text-xl">{{ formatDuration(runDuration(run)) }}</dd>
          </div>
        </dl>
      </div>
      <div class="flex items-center gap-3 border-t border-line px-5 py-2.5">
        <RunResultBar class="flex-1" height="md" :passed="run.passedTests" :failed="run.failedTests" :skipped="run.skippedTests" :total="run.totalTests" />
        <span class="font-mono text-[11px] text-fg-subtle tabular-nums">{{ completed }}/{{ run.totalTests }}</span>
      </div>
      <div v-if="run.errorMessage" class="border-t border-warn/25 bg-warn/6 px-5 py-2.5 text-xs text-warn">
        {{ run.errorMessage }}
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
                selectedId === result.id ? 'bg-raised' : 'hover:bg-raised/60',
              ]"
              @click="selectedId = result.id"
            >
              <span v-if="selectedId === result.id" class="absolute inset-y-0 left-0 w-[2px] bg-fg" />
              <RunStatusIcon :status="result.status" class="mt-0.5" />
              <span class="min-w-0 flex-1">
                <span class="flex items-baseline gap-2">
                  <span class="font-mono text-[11px] text-fg-subtle">{{ result.testCaseSnapshot.key }}</span>
                  <span class="ml-auto font-mono text-[11px] text-fg-subtle tabular-nums">{{ result.durationMs != null ? formatDuration(result.durationMs) : '' }}</span>
                </span>
                <span class="mt-0.5 block truncate text-[13px] text-fg">{{ result.testCaseSnapshot.title }}</span>
                <span v-if="result.status === 'FAILED' || result.status === 'ERROR'" class="mt-0.5 block truncate font-mono text-[11px] text-fail/90">
                  {{ result.failedStep ? `step ${result.failedStep}: ` : '' }}{{ result.errorMessage?.split('\n')[0] }}
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
