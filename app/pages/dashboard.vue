<script setup lang="ts">
import { ArrowRight, Play, Plus } from '@lucide/vue'
import type { Overview, TestRunDetail } from '~/types/api'

useHead({ title: 'Overview · TestPilot AI' })

const { $api } = useNuxtApp()
const { projects } = useProjects()

const { data: overview, refresh } = await useAsyncData('overview', () => $api<Overview>('/overview'))

/** The run the overview focuses on: the live one, else the latest. */
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

/** First-run checklist, shown until the first project exists. */
const CHECKLIST: { title: string; body: string; to?: string; cta?: string }[] = [
  { title: 'Create a project', body: 'Name the application and give TestPilot the base URL of an environment.', to: '/projects?new=1', cta: 'New project' },
  { title: 'Describe a test', body: 'Write ordered steps: navigate, click, fill, then assert what should be true.' },
  { title: 'Run it in Chromium', body: 'Playwright executes every step and captures a screenshot of the result.' },
]

const summary = computed(() => {
  const s = overview.value?.stats
  return s ? [plural(s.projects, 'project'), plural(s.testCases, 'test case'), plural(s.runs, 'run')].join(' · ') : null
})
</script>

<template>
  <div>
    <AppPageHeader title="Overview">
      {{ summary }}
      <template v-if="projects?.length" #actions>
        <UiButton to="/test-cases/new"><Plus /> New test case</UiButton>
        <UiButton variant="primary" to="/test-cases"><Play /> Run tests</UiButton>
      </template>
    </AppPageHeader>

    <!-- First run -->
    <section v-if="!projects?.length" class="panel max-w-3xl">
      <div class="panel-header"><h2 class="panel-title">Before your first run</h2></div>
      <ol class="divide-y divide-line">
        <li v-for="(item, index) in CHECKLIST" :key="item.title" class="flex items-start gap-4 px-5 py-4">
          <span class="w-4 pt-px font-mono text-sm text-fg-subtle tabular-nums">{{ index + 1 }}</span>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold">{{ item.title }}</h3>
            <p class="mt-1 text-[13px] leading-relaxed text-fg-muted">{{ item.body }}</p>
          </div>
          <UiButton v-if="item.to" variant="primary" size="sm" :to="item.to"><Plus /> {{ item.cta }}</UiButton>
        </li>
      </ol>
    </section>

    <template v-else-if="overview">
      <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:grid-rows-[auto_1fr]">
        <!-- Latest or live run -->
        <section class="panel min-w-0 overflow-hidden xl:col-start-1 xl:row-start-1">
          <div class="panel-header">
            <span v-if="live" class="size-1.5 motion-safe:animate-blink rounded-full bg-run" aria-hidden="true" />
            <h2 class="panel-title">{{ live ? 'Live run' : 'Latest run' }}</h2>
            <NuxtLink
              v-if="focusRun"
              :to="`/test-runs/${focusRun.id}`"
              class="ml-auto flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
            >
              Open run <ArrowRight class="size-3.5" />
            </NuxtLink>
          </div>

          <div v-if="focusRun" class="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div class="min-w-0">
              <RunBrowserFrame :url="spotlight?.finalUrl ?? focusRun.baseUrl" :title="spotlight?.pageTitle" :browser="focusRun.browser" :live="live">
                <img
                  v-if="spotlightShot"
                  :src="`/api/artifacts/${spotlightShot.id}/file`"
                  :alt="`Final state of ${spotlight?.testCaseSnapshot.key}`"
                  class="size-full object-cover object-top"
                >
                <div v-else class="absolute inset-0 flex items-center justify-center font-mono text-xs text-fg-subtle">
                  {{ live ? `Executing ${spotlight?.testCaseSnapshot.key ?? ''}…` : 'No screenshot' }}
                </div>
              </RunBrowserFrame>
              <div v-if="spotlight" class="mt-3 flex items-start gap-2.5">
                <RunStatusIcon :status="spotlight.status" class="mt-0.5" />
                <div class="min-w-0">
                  <p class="truncate text-[13px]">
                    <span class="mr-1.5 font-mono text-xs text-fg-subtle">{{ spotlight.testCaseSnapshot.key }}</span>{{ spotlight.testCaseSnapshot.title }}
                  </p>
                  <p v-if="spotlight.errorMessage" class="mt-1 line-clamp-2 font-mono text-[11.5px] leading-relaxed text-fail">
                    {{ spotlight.errorMessage.split('\nCall log:')[0] }}
                  </p>
                </div>
              </div>
            </div>

            <div class="min-w-0">
              <p :class="['display text-[40px] leading-none', TONE_CLASSES[STATUS_META[focusRun.status].tone].text]">
                {{ STATUS_META[focusRun.status].label }}
              </p>
              <p class="mt-3 truncate text-[13px] font-medium">Run #{{ focusRun.number }} · {{ focusRun.project.name }}</p>
              <p class="mt-0.5 truncate text-xs text-fg-subtle">{{ focusRun.environmentName }} · {{ formatRelative(focusRun.createdAt) }}</p>

              <p class="mt-5 flex gap-3 font-mono text-[11.5px] tabular-nums">
                <span :class="focusRun.passedTests ? 'text-pass' : 'text-fg-subtle'">{{ focusRun.passedTests }} passed</span>
                <span :class="focusRun.failedTests ? 'text-fail' : 'text-fg-subtle'">{{ focusRun.failedTests }} failed</span>
                <span class="text-fg-subtle">{{ focusRun.skippedTests }} skipped</span>
              </p>
              <RunResultBar class="mt-2" :passed="focusRun.passedTests" :failed="focusRun.failedTests" :skipped="focusRun.skippedTests" :total="focusRun.totalTests" />

              <ul class="mt-4 -mx-1.5">
                <li v-for="result in focusRun.results.slice(0, 10)" :key="result.id">
                  <NuxtLink
                    :to="{ path: `/test-runs/${focusRun.id}`, query: { result: result.id } }"
                    class="flex items-center gap-2 rounded-[3px] px-1.5 py-1 text-xs hover:bg-raised"
                  >
                    <RunStatusIcon :status="result.status" size="sm" />
                    <span class="font-mono text-[11px] text-fg-subtle">{{ result.testCaseSnapshot.key }}</span>
                    <span class="min-w-0 flex-1 truncate text-fg-muted">{{ result.testCaseSnapshot.title }}</span>
                    <span class="font-mono text-[10.5px] text-fg-subtle tabular-nums">{{ result.durationMs != null ? formatDuration(result.durationMs) : '' }}</span>
                  </NuxtLink>
                </li>
              </ul>
              <p v-if="focusRun.results.length > 10" class="mt-1 text-[11px] text-fg-subtle">+{{ focusRun.results.length - 10 }} more</p>
            </div>
          </div>

          <UiEmptyState v-else title="Nothing has run yet" description="Run a test case and its browser session shows up here.">
            <UiButton variant="primary" to="/test-cases">Go to test cases</UiButton>
          </UiEmptyState>
        </section>

        <div class="space-y-6 xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <!-- Health -->
          <section class="panel">
            <div class="panel-header">
              <h2 class="panel-title">Test health</h2>
              <span class="ml-auto text-xs text-fg-subtle">last {{ overview.stats.windowDays }} days</span>
            </div>
            <div class="p-4">
              <p class="flex items-baseline gap-2">
                <span class="display text-[34px] leading-none tabular-nums">{{ formatPercent(overview.stats.passRate, 1) }}</span>
                <span class="text-xs text-fg-subtle">passed</span>
              </p>
              <p class="mt-1.5 text-xs text-fg-subtle">{{ plural(overview.stats.testsExecuted, 'test') }} executed</p>
              <RunHealthChart class="mt-5" :runs="overview.health" />
            </div>
          </section>

          <!-- Failures -->
          <section class="panel">
            <div class="panel-header">
              <h2 class="panel-title">Recent failures</h2>
            </div>
            <ul v-if="overview.recentFailures.length" class="divide-y divide-line">
              <li v-for="failure in overview.recentFailures.slice(0, 4)" :key="failure.id">
                <NuxtLink :to="{ path: `/test-runs/${failure.testRun.id}`, query: { result: failure.id } }" class="block px-4 py-3 hover:bg-raised">
                  <div class="flex items-center gap-2">
                    <RunStatusIcon :status="failure.status" size="sm" />
                    <span class="font-mono text-[11px] text-fg-subtle">{{ failure.testCase.key }}</span>
                    <span class="min-w-0 flex-1 truncate text-[13px]">{{ failure.testCase.title }}</span>
                  </div>
                  <p class="mt-1 line-clamp-2 pl-5.5 font-mono text-[11px] leading-relaxed text-fg-muted">{{ failure.errorMessage?.split('\nCall log:')[0] }}</p>
                  <p class="mt-1 pl-5.5 text-[11px] text-fg-subtle">{{ failure.testRun.project.name }} · Run #{{ failure.testRun.number }} · {{ formatRelative(failure.finishedAt) }}</p>
                </NuxtLink>
              </li>
            </ul>
            <p v-else class="px-4 py-6 text-center text-xs text-fg-subtle">No failures. Everything that ran passed.</p>
          </section>
        </div>

        <!-- Recent runs -->
        <section v-if="overview.recentRuns.length" class="panel min-w-0 overflow-hidden xl:col-start-1 xl:row-start-2">
          <div class="panel-header">
            <h2 class="panel-title">Recent runs</h2>
            <NuxtLink to="/test-runs" class="ml-auto flex items-center gap-1 text-xs text-fg-muted hover:text-fg">All runs <ArrowRight class="size-3.5" /></NuxtLink>
          </div>
          <ul class="divide-y divide-line">
            <li v-for="run in overview.recentRuns" :key="run.id">
              <NuxtLink :to="`/test-runs/${run.id}`" class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-2.5 hover:bg-raised md:grid-cols-[70px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.2fr)_100px]">
                <RunStatusBadge :status="run.status" class="justify-self-start" />
                <span class="min-w-0 truncate text-[13px]"><span class="mr-1.5 font-mono text-fg-subtle">#{{ run.number }}</span>{{ run.project.name }}</span>
                <span class="hidden truncate text-xs text-fg-muted md:block">{{ run.environmentName }}</span>
                <RunResultBar class="hidden md:flex" :passed="run.passedTests" :failed="run.failedTests" :skipped="run.skippedTests" :total="run.totalTests" />
                <span class="text-right text-xs text-fg-subtle">{{ formatRelative(run.createdAt) }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </div>


    </template>
  </div>
</template>
