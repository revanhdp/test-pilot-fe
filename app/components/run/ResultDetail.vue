<script setup lang="ts">
import { ExternalLink, Maximize2 } from '@lucide/vue'
import type { TestResult } from '~/types/api'

const props = defineProps<{ result: TestResult; browser?: string }>()

const snapshot = computed(() => props.result.testCaseSnapshot)
const screenshot = computed(() => props.result.artifacts.find((a) => a.type === 'SCREENSHOT'))
const failedStepAction = computed(() => {
  const order = props.result.failedStep
  const step = snapshot.value.steps.find((s) => s.order === order)
  return step ? describeStep(step).verb : null
})
const isFailure = computed(() => props.result.status === 'FAILED' || props.result.status === 'ERROR')
const lightbox = ref(false)
</script>

<template>
  <div class="animate-fade-in space-y-5">
    <!-- Heading -->
    <div class="flex flex-wrap items-start gap-3">
      <RunStatusIcon :status="result.status" class="mt-1 size-5" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-mono text-xs text-fg-subtle">{{ snapshot.key }}</span>
          <UiBadge :tone="PRIORITY_META[snapshot.priority].tone">{{ PRIORITY_META[snapshot.priority].label }}</UiBadge>
          <UiBadge>{{ CATEGORY_LABELS[snapshot.category] }}</UiBadge>
        </div>
        <h2 class="mt-1 text-base font-semibold tracking-tight">{{ snapshot.title }}</h2>
        <p class="mt-0.5 text-xs text-fg-subtle">
          {{ snapshot.suiteName }} · {{ snapshot.steps.length }} steps · {{ formatDuration(result.durationMs) }}
        </p>
      </div>
      <UiButton v-if="result.testCaseId" size="sm" variant="ghost" :to="`/test-cases/${result.testCaseId}`">
        Open test <ExternalLink />
      </UiButton>
    </div>

    <!-- Expected vs actual -->
    <div v-if="isFailure || snapshot.expectedResult" class="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
      <div class="bg-surface p-4">
        <p class="eyebrow mb-2">Expected</p>
        <p class="text-[13px] leading-relaxed text-fg">{{ snapshot.expectedResult ?? 'All steps pass.' }}</p>
      </div>
      <div :class="['p-4', isFailure ? 'bg-fail/[0.05]' : 'bg-surface']">
        <p :class="['eyebrow mb-2', isFailure && '!text-fail/80']">
          Actual<template v-if="result.failedStep"> · step {{ result.failedStep }}<template v-if="failedStepAction"> ({{ failedStepAction }})</template></template>
        </p>
        <p v-if="isFailure" class="font-mono text-[12px] leading-relaxed break-words whitespace-pre-wrap text-[#f6a5a3]">{{ result.errorMessage?.split('\nCall log:')[0] }}</p>
        <p v-else-if="result.status === 'PASSED'" class="text-[13px] text-pass">All {{ snapshot.steps.length }} steps passed.</p>
        <p v-else class="text-[13px] text-fg-muted">{{ result.errorMessage ?? STATUS_META[result.status].label }}</p>
      </div>
    </div>

    <!-- Evidence + timeline -->
    <div class="grid gap-5 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <section>
        <div class="mb-2 flex items-center justify-between">
          <p class="eyebrow">Browser · final state</p>
          <button
            v-if="screenshot"
            type="button"
            class="flex items-center gap-1 text-[11px] text-fg-subtle hover:text-fg"
            @click="lightbox = true"
          >
            <Maximize2 class="size-3" /> Full size
          </button>
        </div>
        <RunBrowserFrame :url="result.finalUrl" :title="result.pageTitle" :browser="browser">
          <button v-if="screenshot" type="button" class="block size-full cursor-zoom-in" @click="lightbox = true">
            <img
              :src="`/api/artifacts/${screenshot.id}/file`"
              :alt="`Screenshot of ${result.finalUrl ?? 'the page'} after ${snapshot.key}`"
              class="size-full object-cover object-top"
              loading="lazy"
            >
          </button>
          <div v-else-if="result.status === 'RUNNING'" class="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden">
            <div class="absolute inset-x-0 top-0 h-px overflow-hidden"><div class="animate-scan h-px w-1/2 bg-gradient-to-r from-transparent via-run to-transparent" /></div>
            <UiSpinner class="size-5 text-run" />
            <p class="text-xs text-fg-muted">Executing in Chromium…</p>
          </div>
          <div v-else class="absolute inset-0 flex items-center justify-center text-xs text-fg-subtle">
            {{ result.status === 'PENDING' ? 'Waiting to run' : 'No screenshot captured' }}
          </div>
        </RunBrowserFrame>
      </section>

      <section>
        <p class="eyebrow mb-3">Execution timeline</p>
        <RunStepTimeline :steps="snapshot.steps" :outcomes="result.stepResults" />
      </section>
    </div>

    <UiModal v-if="screenshot" v-model:open="lightbox" :title="`${snapshot.key} — final state`" :description="result.finalUrl ?? undefined" width="lg">
      <img :src="`/api/artifacts/${screenshot.id}/file`" alt="" class="w-full rounded-b-[10px]">
    </UiModal>
  </div>
</template>
