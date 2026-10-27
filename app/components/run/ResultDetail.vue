<script setup lang="ts">
import { ArrowUpRight, KeyRound, Maximize2 } from '@lucide/vue'
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
  <div class="motion-safe:animate-fade-in space-y-6">
    <!-- Heading -->
    <div class="flex flex-wrap items-start gap-x-4 gap-y-3">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-fg-subtle">
          <RunStatusBadge :status="result.status" />
          <span class="font-mono text-fg-muted">{{ snapshot.key }}</span>
          <span>{{ snapshot.suiteName }}</span>
          <TestCasePriority :priority="snapshot.priority" />
          <span>{{ CATEGORY_LABELS[snapshot.category] }}</span>
        </div>
        <h2 class="mt-2.5 text-lg leading-snug font-semibold tracking-[-0.01em]">{{ snapshot.title }}</h2>
        <p class="mt-1 font-mono text-[11.5px] text-fg-subtle">
          {{ plural(snapshot.steps.length, 'step') }} · {{ formatDuration(result.durationMs) }}
        </p>
      </div>
      <UiButton v-if="result.testCaseId" size="sm" :to="`/test-cases/${result.testCaseId}`">
        Open test <ArrowUpRight />
      </UiButton>
    </div>

    <!-- Expected vs actual -->
    <div v-if="isFailure || snapshot.expectedResult" class="grid overflow-hidden rounded-[5px] border border-line sm:grid-cols-2">
      <div class="p-4">
        <p class="caption mb-2">Expected</p>
        <p class="text-[13px] leading-relaxed text-fg">{{ snapshot.expectedResult ?? 'All steps pass.' }}</p>
      </div>
      <div :class="['border-t border-line p-4 sm:border-t-0 sm:border-l', isFailure && 'bg-fail/6']">
        <p :class="['caption mb-2', isFailure && '!text-fail']">
          Actual<template v-if="result.failedStep"> · step {{ result.failedStep }}<template v-if="failedStepAction"> ({{ failedStepAction }})</template></template>
        </p>
        <p v-if="isFailure" class="font-mono text-[12px] leading-relaxed break-words whitespace-pre-wrap text-fail">{{ result.errorMessage?.split('\nCall log:')[0] }}</p>
        <p v-else-if="result.status === 'PASSED'" class="text-[13px] text-pass">
          {{ snapshot.steps.length === 1 ? 'The step passed.' : `All ${snapshot.steps.length} steps passed.` }}
        </p>
        <p v-else class="text-[13px] text-fg-muted">{{ result.errorMessage ?? STATUS_META[result.status].label }}</p>
      </div>
    </div>

    <!-- Evidence + timeline -->
    <div class="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <section>
        <div class="mb-2 flex h-5 items-center justify-between">
          <p class="caption">Final state</p>
          <button
            v-if="screenshot"
            type="button"
            class="flex items-center gap-1 text-xs text-fg-subtle hover:text-fg"
            @click="lightbox = true"
          >
            <Maximize2 class="size-3" /> Full size
          </button>
        </div>
        <RunBrowserFrame :url="result.finalUrl" :title="result.pageTitle" :browser="browser" :live="result.status === 'RUNNING'">
          <button v-if="screenshot" type="button" class="block size-full cursor-zoom-in" @click="lightbox = true">
            <RunArtifactImage
              :id="screenshot.id"
              :alt="`Screenshot of ${result.finalUrl ?? 'the page'} after ${snapshot.key}`"
              class="size-full object-cover object-top"
            />
          </button>
          <div v-else class="absolute inset-0 flex items-center justify-center font-mono text-xs text-fg-subtle">
            {{ result.status === 'RUNNING' ? 'Executing in Chromium…' : result.status === 'PENDING' ? 'Waiting to run' : 'No screenshot captured' }}
          </div>
        </RunBrowserFrame>
      </section>

      <section>
        <div class="mb-2 flex h-5 items-center gap-3">
          <p class="caption">Steps</p>
          <p v-if="snapshot.startSignedIn" class="flex items-center gap-1.5 text-xs text-fg-subtle">
            <KeyRound class="size-3" /> Started signed in, with the run’s session
          </p>
        </div>
        <RunStepTimeline :steps="snapshot.steps" :outcomes="result.stepResults" />
      </section>
    </div>

    <UiModal v-if="screenshot" v-model:open="lightbox" :title="`${snapshot.key} — final state`" :description="result.finalUrl ?? undefined" width="lg">
      <RunArtifactImage :id="screenshot.id" class="w-full rounded-b-[6px]" />
    </UiModal>
  </div>
</template>
