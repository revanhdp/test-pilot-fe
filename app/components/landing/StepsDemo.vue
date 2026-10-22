<script setup lang="ts">
import { RotateCcw } from '@lucide/vue'
import type { StepInput, StepOutcome } from '~/types/api'

/** "Steps are data": the stored JSON on the left, executed in order on the right, kept in sync. */
const STEPS: (StepInput & { order: number })[] = [
  { order: 1, action: 'navigate', value: '/checkout' },
  { order: 2, action: 'fill', target: { type: 'label', value: 'Card number' }, value: '4111 1111' },
  { order: 3, action: 'click', target: { type: 'role', value: 'button', name: 'Pay $49.00' } },
  { order: 4, action: 'assertText', target: { type: 'role', value: 'alert' }, value: 'Card number is invalid' },
]
const OUTCOMES: StepOutcome[] = [
  { order: 1, status: 'PASSED', durationMs: 412 },
  { order: 2, status: 'PASSED', durationMs: 88 },
  { order: 3, status: 'PASSED', durationMs: 1290 },
  {
    order: 4,
    status: 'FAILED',
    durationMs: 10004,
    error: 'Expected alert to contain "Card number is invalid", but its text was "Something went wrong. Please try again."',
  },
]
/** Animation seconds each step runs for; the assertion waits the longest, like the real timeout. */
const WINDOWS: [number, number][] = [[0.5, 1.1], [1.1, 1.6], [1.6, 2.3], [2.3, 4.4]]
const DURATION = 4.8

const root = ref<HTMLElement | null>(null)
const { t, done, play } = usePlayback(root, DURATION)

const running = computed(() => {
  const index = WINDOWS.findIndex(([start, end]) => t.value >= start && t.value < end)
  return index === -1 ? undefined : index + 1
})
const outcomes = computed(() => OUTCOMES.filter((outcome) => t.value >= WINDOWS[outcome.order - 1]![1]))
const failed = computed(() => outcomes.value.some((outcome) => outcome.status === 'FAILED'))

const inline = (value: unknown): string =>
  value && typeof value === 'object'
    ? `{ ${Object.entries(value).map(([key, inner]) => `"${key}": ${inline(inner)}`).join(', ')} }`
    : JSON.stringify(value)

/** One line per step, or one line per field when the step has a target. */
const formatStep = ({ order: _order, ...step }: StepInput & { order: number }): string =>
  step.target
    ? `  {\n${Object.entries(step).map(([key, value]) => `    "${key}": ${inline(value)}`).join(',\n')}\n  }`
    : `  ${inline(step)}`

/** Grayscale syntax highlighting: keys recede, values stand out. */
function tokenize(code: string) {
  const tokens: { text: string; kind: 'key' | 'value' | 'punct' }[] = []
  let last = 0
  for (const match of code.matchAll(/("(?:[^"\\]|\\.)*")(\s*:)?/g)) {
    const index = match.index ?? 0
    if (index > last) tokens.push({ text: code.slice(last, index), kind: 'punct' })
    tokens.push({ text: match[1]!, kind: match[2] ? 'key' : 'value' })
    if (match[2]) tokens.push({ text: match[2], kind: 'punct' })
    last = index + match[0].length
  }
  tokens.push({ text: code.slice(last), kind: 'punct' })
  return tokens
}
const BLOCKS = STEPS.map((step, index) => tokenize(formatStep(step) + (index < STEPS.length - 1 ? ',' : '')))
const TOKEN_CLASS = { key: 'text-fg-subtle', value: 'text-fg', punct: 'text-fg-subtle' }

function blockClass(order: number) {
  if (running.value === order) return 'border-fg bg-raised'
  const outcome = outcomes.value.find((o) => o.order === order)
  return outcome?.status === 'FAILED' ? 'border-fail bg-fail/6' : 'border-transparent'
}
</script>

<template>
  <div ref="root" class="grid overflow-hidden rounded-[6px] border border-line bg-surface lg:grid-cols-2">
    <div class="min-w-0">
      <div class="flex h-10 items-center border-b border-line px-4 font-mono text-[11px] text-fg-subtle">steps.json</div>
      <code class="block overflow-x-auto py-4 text-[12px] leading-[1.8]">
        <span class="block px-4 whitespace-pre text-fg-subtle">[</span>
        <span
          v-for="(tokens, index) in BLOCKS"
          :key="index"
          :class="['block border-l-2 px-4 whitespace-pre transition-colors duration-300', blockClass(index + 1)]"
        ><span v-for="(token, tokenIndex) in tokens" :key="tokenIndex" :class="TOKEN_CLASS[token.kind]">{{ token.text }}</span></span>
        <span class="block px-4 whitespace-pre text-fg-subtle">]</span>
      </code>
    </div>
    <div class="flex min-w-0 flex-col border-t border-line lg:border-t-0 lg:border-l">
      <div class="flex h-10 items-center gap-3 border-b border-line px-4">
        <span class="font-mono text-[11px] text-fg-subtle">TC-5</span>
        <span class="min-w-0 flex-1 truncate text-[13px]">Invalid card number shows a validation message</span>
        <RunStatusBadge :status="failed ? 'FAILED' : running ? 'RUNNING' : 'PENDING'" />
      </div>
      <div class="flex-1 p-4">
        <RunStepTimeline :steps="STEPS" :outcomes="outcomes" :running="running" />
      </div>
      <div class="flex h-9 items-center justify-end border-t border-line px-3">
        <button
          type="button"
          :class="['flex items-center gap-1 rounded-[3px] px-1.5 py-0.5 text-xs text-fg-muted transition-opacity hover:bg-raised hover:text-fg', done ? 'opacity-100' : 'pointer-events-none opacity-0']"
          :tabindex="done ? 0 : -1"
          @click="play()"
        >
          <RotateCcw class="size-3" /> Replay
        </button>
      </div>
    </div>
  </div>
</template>
