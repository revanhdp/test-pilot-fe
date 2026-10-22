<script setup lang="ts">
import { RotateCcw } from '@lucide/vue'

/**
 * A failure explained: the evidence the browser captured on the left, and a
 * model's structured analysis streaming in on the right, token by token.
 */
const EVIDENCE = [
  { term: 'Test', detail: 'TC-5 · step 4 · expect text' },
  { term: 'Expected', detail: 'alert contains "Card number is invalid"' },
  { term: 'Actual', detail: '"Something went wrong. Please try again."', fail: true },
  { term: 'Network', detail: 'POST /api/payments → 500 · 182 ms', fail: true },
  { term: 'Console', detail: 'Uncaught (in promise) PaymentError: card_rejected' },
]
const ANALYSIS = [
  { label: 'Severity', value: 'High' },
  { label: 'Category', value: 'Validation' },
  { label: 'Summary', value: 'The payment endpoint fails with HTTP 500 when the card number is invalid, so the user sees a generic error instead of a validation message.' },
  { label: 'Likely cause', value: 'The card number reaches the payment provider unvalidated, and the provider’s rejection is not handled.' },
  { label: 'Suggested fix', value: 'Validate the card number before calling the provider and answer 422 with a field error.' },
  { label: 'Confidence', value: '0.86' },
]

/** Seconds spent "reading" before the first token, and characters streamed per second. */
const THINK = 0.9
const CPS = 120
const TOTAL_CHARS = ANALYSIS.reduce((sum, field) => sum + field.value.length, 0)
const STREAM_END = THINK + TOTAL_CHARS / CPS
const DURATION = STREAM_END + 0.4

const root = ref<HTMLElement | null>(null)
const { t, done, play } = usePlayback(root, DURATION)

const fields = computed(() => {
  let budget = Math.max(Math.floor((t.value - THINK) * CPS), 0)
  return ANALYSIS.map((field) => {
    const shown = field.value.slice(0, Math.max(budget, 0))
    budget -= field.value.length
    return { ...field, shown, started: shown.length > 0, streaming: shown.length > 0 && shown.length < field.value.length }
  })
})
const phase = computed(() => (t.value < THINK ? 'reading' : t.value < STREAM_END ? 'writing' : 'done'))
</script>

<template>
  <div ref="root" class="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
    <!-- Evidence -->
    <section class="overflow-hidden rounded-[6px] border border-line bg-surface">
      <div class="flex h-10 items-center gap-3 border-b border-line px-4">
        <h3 class="text-[13px] font-semibold">Evidence</h3>
        <span class="ml-auto font-mono text-[11px] text-fg-subtle">captured by the engine</span>
      </div>
      <dl class="divide-y divide-line">
        <div v-for="row in EVIDENCE" :key="row.term" class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 px-4 py-2.5">
          <dt class="text-xs text-fg-subtle">{{ row.term }}</dt>
          <dd :class="['font-mono text-[11.5px] leading-relaxed wrap-anywhere', row.fail ? 'text-fail' : 'text-fg-muted']">{{ row.detail }}</dd>
        </div>
        <div class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 px-4 py-3">
          <dt class="text-xs text-fg-subtle">Screenshot</dt>
          <dd class="max-w-[15rem]"><LandingCheckoutMock /></dd>
        </div>
      </dl>
    </section>

    <!-- Analysis -->
    <section class="flex flex-col overflow-hidden rounded-[6px] border border-line bg-surface">
      <div class="flex h-10 items-center gap-3 border-b border-line px-4">
        <h3 class="text-[13px] font-semibold">Analysis</h3>
        <span class="ml-auto flex items-center gap-2 font-mono text-[11px] text-fg-subtle" aria-live="polite">
          <template v-if="phase === 'reading'"><RunStatusIcon status="RUNNING" size="sm" /> reading evidence</template>
          <template v-else-if="phase === 'writing'"><RunStatusIcon status="RUNNING" size="sm" /> writing</template>
          <template v-else><RunStatusIcon status="PASSED" size="sm" /> schema-valid · {{ (STREAM_END - THINK).toFixed(1) }} s</template>
        </span>
      </div>
      <dl class="flex-1 space-y-3 px-4 py-4">
        <div v-for="field in fields" :key="field.label" class="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
          <dt :class="['text-xs text-fg-subtle transition-opacity duration-200', field.started ? 'opacity-100' : 'opacity-0']">{{ field.label }}</dt>
          <dd class="min-h-[1.25rem] text-[13px] leading-relaxed">
            <span class="sr-only">{{ field.value }}</span>
            <span aria-hidden="true">{{ field.shown }}<span v-if="field.streaming" class="text-fg-muted motion-safe:animate-blink">▍</span></span>
          </dd>
        </div>
      </dl>
      <div class="flex min-h-9 flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-4 py-2 text-xs text-fg-subtle">
        <span :class="['transition-opacity duration-300', done ? 'opacity-100' : 'opacity-0']">Draft bug report <span class="font-mono text-fg-muted">BUG-104</span> created. The verdict stays FAIL.</span>
        <button
          type="button"
          :class="['ml-auto flex items-center gap-1 rounded-[3px] px-1.5 py-0.5 text-fg-muted transition-opacity hover:bg-raised hover:text-fg', done ? 'opacity-100' : 'pointer-events-none opacity-0']"
          :tabindex="done ? 0 : -1"
          @click="play()"
        >
          <RotateCcw class="size-3" /> Replay
        </button>
      </div>
    </section>
  </div>
</template>
