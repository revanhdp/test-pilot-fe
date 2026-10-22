<script setup lang="ts">
import type { StepInput, StepOutcome } from '~/types/api'

const props = defineProps<{
  steps: (StepInput & { order: number })[]
  outcomes: StepOutcome[] | null
}>()

const rows = computed(() =>
  props.steps.map((step) => {
    const outcome = props.outcomes?.find((o) => o.order === step.order)
    return {
      step,
      description: describeStep(step),
      // Outcomes are recorded when the test finishes, so steps stay pending until then.
      status: outcome?.status ?? 'PENDING',
      durationMs: outcome?.durationMs ?? null,
      error: outcome?.error,
    } as const
  }),
)
</script>

<template>
  <ol class="relative">
    <li
      v-for="(row, index) in rows"
      :key="row.step.order"
      :class="['relative flex gap-3 pb-3 last:pb-0', row.status === 'SKIPPED' && 'opacity-45']"
    >
      <!-- rail -->
      <span
        v-if="index < rows.length - 1"
        class="absolute top-5 bottom-0 left-[7.5px] w-px bg-line-strong"
        aria-hidden="true"
      />
      <RunStatusIcon :status="row.status" class="relative mt-0.5 bg-surface" />
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline gap-2">
          <span class="w-5 shrink-0 font-mono text-[11px] text-fg-subtle">{{ String(row.step.order).padStart(2, '0') }}</span>
          <p class="min-w-0 flex-1 text-[13px] leading-snug">
            <span class="font-medium text-fg">{{ row.description.verb }}</span>
            <span class="ml-1.5 font-mono text-[12px] break-all text-fg-muted">{{ row.description.subject }}</span>
            <span v-if="row.description.detail" class="ml-1.5 text-fg-subtle">{{ row.description.detail }}</span>
          </p>
          <span class="shrink-0 font-mono text-[11px] text-fg-subtle tabular-nums">
            {{ row.durationMs != null && row.status !== 'SKIPPED' ? formatDuration(row.durationMs) : '' }}
          </span>
        </div>
        <pre
          v-if="row.error"
          class="mt-2 ml-7 overflow-x-auto rounded-md border border-fail/25 bg-fail/[0.06] px-3 py-2 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-[#f6a5a3]"
        >{{ row.error }}</pre>
      </div>
    </li>
  </ol>
</template>
