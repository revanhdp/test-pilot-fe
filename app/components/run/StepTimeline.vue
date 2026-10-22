<script setup lang="ts">
import type { StepInput, StepOutcome } from '~/types/api'

const props = defineProps<{
  steps: (StepInput & { order: number })[]
  outcomes: StepOutcome[] | null
  /** Order of the step executing right now, when known. */
  running?: number
}>()

const rows = computed(() => {
  let elapsed = 0
  return props.steps.map((step) => {
    const outcome = props.outcomes?.find((o) => o.order === step.order)
    // Outcomes are recorded when the test finishes, so steps stay pending until then.
    const status = outcome?.status ?? (step.order === props.running ? 'RUNNING' : 'PENDING')
    const durationMs = outcome && status !== 'SKIPPED' ? outcome.durationMs : null
    // When the step started, relative to the start of the test: a flight-recorder clock.
    const startedAt = durationMs != null ? elapsed : null
    if (durationMs != null) elapsed += durationMs
    return { step, description: describeStep(step), status, startedAt, durationMs, error: outcome?.error } as const
  })
})
</script>

<template>
  <ol class="divide-y divide-line/70 border-y border-line/70">
    <li
      v-for="row in rows"
      :key="row.step.order"
      :class="[
        'grid grid-cols-[3.25rem_0.875rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-2',
        row.status === 'SKIPPED' && 'opacity-45',
      ]"
    >
      <span class="text-right font-mono text-[11px] text-fg-subtle tabular-nums">
        {{ row.startedAt != null ? `T+${(row.startedAt / 1000).toFixed(2)}` : '' }}
      </span>
      <RunStatusIcon :status="row.status" size="sm" class="translate-y-[3px]" />
      <p class="min-w-0 text-[13px] leading-snug">
        <span class="mr-2 font-mono text-[11px] text-fg-subtle">{{ String(row.step.order).padStart(2, '0') }}</span>
        <span class="font-medium text-fg">{{ row.description.verb }}</span>
        <span class="ml-1.5 font-mono text-[12px] wrap-anywhere text-fg-muted">{{ row.description.subject }}</span>
        <span v-if="row.description.detail" class="ml-1.5 text-fg-subtle">{{ row.description.detail }}</span>
      </p>
      <span class="font-mono text-[11px] text-fg-subtle tabular-nums">
        {{ row.durationMs != null ? formatDuration(row.durationMs) : '' }}
      </span>
      <pre
        v-if="row.error"
        class="col-span-2 col-start-3 mt-2 overflow-x-auto border-l-2 border-fail bg-fail/6 px-3 py-2 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-fail"
      >{{ row.error }}</pre>
    </li>
  </ol>
</template>
