<script setup lang="ts">
import { ArrowRight, FolderKanban, ListChecks, Play, Plus, TriangleAlert } from '@lucide/vue'
import type { Component } from 'vue'
import type { Overview, TestRunDetail } from '~/types/api'

useHead({ title: 'Overview · TestPilot AI' })

const { $api } = useNuxtApp()
const { user } = useAuth()
const { projects } = useProjects()

const { data: overview, refresh } = await useAsyncData('overview', () => $api<Overview>('/overview'))

/** The run the control room focuses on: the live one, else the latest. */
const focusRunId = computed(() => overview.value?.activeRuns[0]?.id ?? overview.value?.recentRuns[0]?.id ?? null)
const { data: focusRun, refresh: refreshFocus } = await useAsyncData(
  () => `overview-run:${focusRunId.value}`,
  () => (focusRunId.value ? $api<TestRunDetail>(`/test-runs/${focusRunId.value}`) : Promise.resolve(null)),
  { watch: [focusRunId] },
)

const live = computed(() => (overview.value?.activeRuns.length ?? 0) > 0 || (focusRun.value ? isActiveStatus(focusRun.value.status) : false))
usePolling(() => Promise.all([refresh(), refreshFocus()]), live, 1500)

/** Result shown in the browser frame: running → first failure → last finished. */
const spotlight = computed(() => {
  const results = focusRun.value?.results ?? []
  return (
    results.find((r) => r.status === 'RUNNING') ??
    results.find((r) => r.status === 'FAILED' || r.status === 'ERROR') ??
    [...results].reverse().find((r) => r.artifacts.length) ??
    results[0] ??
    null
  )
})
const spotlightShot = computed(() => spotlight.value?.artifacts.find((a) => a.type === 'SCREENSHOT'))

const ONBOARDING: { title: string; body: string; icon: Component; to?: string; cta?: string }[] = [
  { title: 'Create a project', body: 'Name the application and give TestPilot the base URL of an environment.', icon: FolderKanban, to: '/projects?new=1', cta: 'New project' },
  { title: 'Describe a test', body: 'Write ordered steps: navigate, click, fill, then assert what should be true.', icon: ListChecks },
  { title: 'Run it in Chromium', body: 'Playwright executes every step and captures a screenshot of the result.', icon: Play },
]

const greeting = computed(() => {
  const hour = new Date().getHours()
  const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return `${part}, ${user.value?.name.split(' ')[0] ?? ''}`
})

const stats = computed(() => {
  const s = overview.value?.stats
  if (!s) return []
  return [
    { label: 'Projects', value: String(s.projects) },
    { label: 'Test cases', value: String(s.testCases) },
    { label: 'Runs', value: String(s.runs) },
    { label: `Tests executed · ${s.windowDays}d`, value: s.testsExecuted.toLocaleString() },
    { label: `Pass rate · ${s.windowDays}d`, value: formatPercent(s.passRate, 1), rate: s.passRate },
  ]
})
</script>

<template>
  <div>
    <AppPageHeader :title="greeting" eyebrow="Control room">
      Live execution, test health and the latest failures across your projects.
      <template v-if="projects?.length" #actions>
        <UiButton to="/test-cases/new"><Plus /> New test case</UiButton>
        <UiButton variant="primary" to="/test-cases"><Play /> Run tests</UiButton>
      </template>
    </AppPageHeader>

    <!-- First-run onboarding -->
    <section v-if="!projects?.length" class="panel relative overflow-hidden">
      <div class="grid-backdrop pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div class="relative grid gap-px bg-line sm:grid-cols-3">
        <div v-for="(step, index) in ONBOARDING" :key="step.title" class="bg-surface p-6">
          <p class="eyebrow mb-4">Step {{ index + 1 }}</p>
          <component :is="step.icon" class="mb-3 size-5 text-accent" />
          <h3 class="text-sm font-semibold">{{ step.title }}</h3>
          <p class="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{{ step.body }}</p>
          <UiButton v-if="step.to" class="mt-5" variant="primary" size="sm" :to="step.to"><Plus /> {{ step.cta }}</UiButton>
        </div>
      </div>
    </section>

    <template v-else-if="overview">
      <!-- Stat strip -->
      <section class="panel mb-6 grid grid-cols-2 overflow-hidden sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-line">
        <div v-for="stat in stats" :key="stat.label" class="p-4">
          <p class="eyebrow truncate">{{ stat.label }}</p>
          <p class="mt-1.5 font-mono text-xl font-medium tabular-nums">{{ stat.value }}</p>
          <div v-if="'rate' in stat" class="mt-2 h-1 overflow-hidden rounded-full bg-overlay">
            <div class="h-full rounded-full bg-pass" :style="{ width: `${(stat.rate ?? 0) * 100}%` }" />
          </div>
        </div>
      </section>

      <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <!-- Live execution -->
        <section class="panel min-w-0 overflow-hidden">
          <div class="panel-header">
            <span class="relative flex size-2">
              <span v-if="live" class="absolute inline-flex size-full animate-ping rounded-full bg-run opacity-60" />
              <span :class="['relative inline-flex size-2 rounded-full', live ? 'bg-run' : 'bg-fg-subtle']" />
            </span>
            <h2 class="panel-title">{{ live ? 'Live execution' : 'Latest run' }}</h2>
            <template v-if="focusRun">
              <span class="hidden truncate text-xs text-fg-subtle sm:inline">
                {{ focusRun.project.name }} · Run #{{ focusRun.number }} · {{ focusRun.environmentName }}
              </span>
              <UiButton class="ml-auto" size="sm" variant="ghost" :to="`/test-runs/${focusRun.id}`">Open run <ArrowRight /></UiButton>
            </template>
          </div>

          <div v-if="focusRun" class="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div class="min-w-0">
              <RunBrowserFrame :url="spotlight?.finalUrl ?? focusRun.baseUrl" :title="spotlight?.pageTitle" :browser="focusRun.browser">
                <img
                  v-if="spotlightShot"
                  :src="`/api/artifacts/${spotlightShot.id}/file`"
                  :alt="`Final state of ${spotlight?.testCaseSnapshot.key}`"
                  class="size-full object-cover object-top"
                >
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <template v-if="live">
                    <div class="absolute inset-x-0 top-0 h-px overflow-hidden"><div class="animate-scan h-px w-1/2 bg-gradient-to-r from-transparent via-run to-transparent" /></div>
                    <UiSpinner class="size-5 text-run" />
                    <p class="text-xs text-fg-muted">Executing {{ spotlight?.testCaseSnapshot.key }}…</p>
                  </template>
                  <p v-else class="text-xs text-fg-subtle">No screenshot</p>
                </div>
              </RunBrowserFrame>
              <div v-if="spotlight" class="mt-3 flex items-start gap-2">
                <RunStatusIcon :status="spotlight.status" class="mt-0.5" />
                <div class="min-w-0">
                  <p class="truncate text-[13px]">
                    <span class="font-mono text-xs text-fg-subtle">{{ spotlight.testCaseSnapshot.key }}</span>
                    {{ spotlight.testCaseSnapshot.title }}
                  </p>
                  <p v-if="spotlight.errorMessage" class="mt-0.5 line-clamp-2 font-mono text-[11.5px] text-fail/90">{{ spotlight.errorMessage.split('\nCall log:')[0] }}</p>
                </div>
              </div>
            </div>

            <div class="min-w-0">
              <div class="mb-2 flex items-center justify-between">
                <p class="eyebrow">Tests</p>
                <RunStatusBadge :status="focusRun.status" />
              </div>
              <RunResultBar class="mb-3" :passed="focusRun.passedTests" :failed="focusRun.failedTests" :skipped="focusRun.skippedTests" :total="focusRun.totalTests" />
              <ul class="space-y-0.5">
                <li v-for="result in focusRun.results.slice(0, 10)" :key="result.id">
                  <NuxtLink
                    :to="{ path: `/test-runs/${focusRun.id}`, query: { result: result.id } }"
                    class="flex items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-overlay"
                  >
                    <RunStatusIcon :status="result.status" class="size-3.5" />
                    <span class="font-mono text-fg-subtle">{{ result.testCaseSnapshot.key }}</span>
                    <span class="min-w-0 flex-1 truncate text-fg-muted">{{ result.testCaseSnapshot.title }}</span>
                    <span class="font-mono text-[10.5px] text-fg-subtle tabular-nums">{{ result.durationMs != null ? formatDuration(result.durationMs) : '' }}</span>
                  </NuxtLink>
                </li>
              </ul>
              <p v-if="focusRun.results.length > 10" class="mt-1 px-1.5 text-[11px] text-fg-subtle">+{{ focusRun.results.length - 10 }} more</p>
            </div>
          </div>

          <UiEmptyState v-else title="Nothing has run yet" description="Run a test case and its browser session shows up here.">
            <template #icon><Play /></template>
            <UiButton variant="primary" to="/test-cases">Go to test cases</UiButton>
          </UiEmptyState>
        </section>

        <div class="space-y-6">
          <!-- Health -->
          <section class="panel">
            <div class="panel-header">
              <h2 class="panel-title">Test health</h2>
              <span class="ml-auto text-[11px] text-fg-subtle">last {{ overview.health.length }} runs</span>
            </div>
            <div class="p-4">
              <RunHealthChart :runs="overview.health" />
              <div class="mt-3 flex items-center gap-4 text-[11px] text-fg-subtle">
                <span class="flex items-center gap-1.5"><span class="size-2 rounded-sm bg-pass/75" /> Passed</span>
                <span class="flex items-center gap-1.5"><span class="size-2 rounded-sm bg-fail/80" /> Failed</span>
                <span class="ml-auto font-mono">oldest → newest</span>
              </div>
            </div>
          </section>

          <!-- Failures -->
          <section class="panel">
            <div class="panel-header">
              <TriangleAlert class="size-4 text-fail/80" />
              <h2 class="panel-title">Recent failures</h2>
            </div>
            <ul v-if="overview.recentFailures.length" class="divide-y divide-line">
              <li v-for="failure in overview.recentFailures" :key="failure.id">
                <NuxtLink :to="{ path: `/test-runs/${failure.testRun.id}`, query: { result: failure.id } }" class="block px-4 py-3 hover:bg-raised">
                  <div class="flex items-center gap-2">
                    <RunStatusIcon :status="failure.status" class="size-3.5" />
                    <span class="font-mono text-[11px] text-fg-subtle">{{ failure.testCase.key }}</span>
                    <span class="min-w-0 flex-1 truncate text-[13px]">{{ failure.testCase.title }}</span>
                  </div>
                  <p class="mt-1 line-clamp-2 pl-5.5 font-mono text-[11px] leading-relaxed text-fg-subtle">{{ failure.errorMessage?.split('\nCall log:')[0] }}</p>
                  <p class="mt-1 pl-5.5 text-[11px] text-fg-subtle">{{ failure.testRun.project.name }} · Run #{{ failure.testRun.number }} · {{ formatRelative(failure.finishedAt) }}</p>
                </NuxtLink>
              </li>
            </ul>
            <p v-else class="px-4 py-6 text-center text-xs text-fg-subtle">No failures. Everything that ran passed.</p>
          </section>
        </div>
      </div>

      <!-- Recent runs -->
      <section v-if="overview.recentRuns.length" class="panel mt-6 overflow-hidden">
        <div class="panel-header">
          <h2 class="panel-title">Recent runs</h2>
          <UiButton class="ml-auto" size="sm" variant="ghost" to="/test-runs">All runs <ArrowRight /></UiButton>
        </div>
        <ul class="divide-y divide-line">
          <li v-for="run in overview.recentRuns" :key="run.id">
            <NuxtLink :to="`/test-runs/${run.id}`" class="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2.5 hover:bg-raised md:grid-cols-[minmax(0,1.2fr)_90px_minmax(0,1fr)_minmax(0,1.2fr)_90px]">
              <span class="min-w-0 truncate text-[13px]"><span class="font-mono text-fg-subtle">#{{ run.number }}</span> {{ run.project.name }}</span>
              <RunStatusBadge :status="run.status" class="hidden md:inline-flex" />
              <span class="hidden truncate text-xs text-fg-muted md:block">{{ run.environmentName }}</span>
              <RunResultBar class="hidden md:flex" :passed="run.passedTests" :failed="run.failedTests" :skipped="run.skippedTests" :total="run.totalTests" />
              <span class="text-right text-xs text-fg-subtle">{{ formatRelative(run.createdAt) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
