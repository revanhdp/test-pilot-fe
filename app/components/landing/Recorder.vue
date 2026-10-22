<script setup lang="ts">
import { RotateCcw } from '@lucide/vue'
import { AnimatePresence, motion } from 'motion-v'
import type { TestResultStatus } from '~/types/api'

/**
 * Hero visual: one failing checkout test, played back from the agent to the
 * bug report on a single time axis, the way a flight recorder replays a flight.
 * `start`/`end` are animation seconds; `at` is the recorded time (T+) of each stage.
 */
const STAGES = [
  { key: 'agent', title: 'Agent', note: 'Explores toward a goal with approved browser tools.', start: 0.3, end: 3, at: 0 },
  { key: 'browser', title: 'Browser', note: 'Playwright drives a real Chromium.', start: 3, end: 5.3, at: 0.4 },
  { key: 'test', title: 'Test', note: 'Structured steps. Assertions decide.', start: 5.3, end: 8.3, at: 1.8 },
  { key: 'failure', title: 'Failure', note: 'Evidence is captured on the spot.', start: 8.3, end: 9.9, at: 11.8 },
  { key: 'report', title: 'Bug report', note: 'Editable and reproducible.', start: 9.9, end: 12.6, at: 12.1 },
] as const
type StageKey = (typeof STAGES)[number]['key']
const DURATION = 13

/** Animation time → recorded time. The test stage spends ten recorded seconds waiting for the alert. */
const CLOCK: [number, number][] = [[0.3, 0], [3, 0.4], [5.3, 1.8], [5.9, 1.9], [8.1, 11.8], [9.9, 12.1], [12.6, 12.6]]

const AGENT_LOG = [
  'open /products/backpack',
  'click button "Add to cart"',
  'open /checkout',
  'fill "Card number" 4111 1111',
  'click button "Pay $49.00"',
]
const CARD = '4111 1111'
const TEST_STEPS = [
  { verb: 'open', subject: '/checkout', until: 0.06 },
  { verb: 'fill', subject: 'field "Card number"', until: 0.12 },
  { verb: 'click', subject: 'button "Pay $49.00"', until: 0.18 },
  { verb: 'expect text', subject: 'alert "Card number is invalid"', until: 0.95 },
]
const REPORT_TITLE = 'Payment endpoint returns HTTP 500 for an invalid card number'
const REPRO = ['Open /checkout', 'Enter card number 4111 1111', 'Click "Pay $49.00"']

const root = ref<HTMLElement | null>(null)
const { t, playing, done, play } = usePlayback(root, DURATION)

const stageOf = (key: StageKey) => STAGES.find((stage) => stage.key === key)!
const reached = (key: StageKey) => t.value >= stageOf(key).start
const stageProgress = (key: StageKey) => progressBetween(t.value, stageOf(key).start, stageOf(key).end)
const activeKey = computed(() => STAGES.find((stage) => t.value >= stage.start && t.value < stage.end)?.key ?? null)

const clock = computed(() => {
  if (t.value <= CLOCK[0]![0]) return CLOCK[0]![1]
  for (let i = 1; i < CLOCK.length; i++) {
    const [t0, v0] = CLOCK[i - 1]!
    const [t1, v1] = CLOCK[i]!
    if (t.value <= t1) return v0 + ((v1 - v0) * (t.value - t0)) / (t1 - t0)
  }
  return CLOCK.at(-1)![1]
})

/** Playhead position across the five columns, 0 → 1. */
const playhead = computed(() => {
  const index = STAGES.findIndex((stage) => t.value < stage.end)
  if (index === -1) return 1
  return (index + progressBetween(t.value, STAGES[index]!.start, STAGES[index]!.end)) / STAGES.length
})

// 01 Agent: the log types itself out.
const agentLines = computed(() => {
  const total = AGENT_LOG.join('').length
  let budget = Math.round(progressBetween(stageProgress('agent'), 0.05, 0.95) * total)
  return AGENT_LOG.map((line) => {
    const text = line.slice(0, Math.max(budget, 0))
    budget -= line.length
    return { line, text, typing: text.length > 0 && text.length < line.length }
  }).filter((entry) => entry.text)
})

// 02 Browser: type the card, move to "Pay", click; the error appears and gets outlined.
const browser = computed(() => {
  const p = stageProgress('browser')
  const move = 1 - (1 - progressBetween(p, 0.32, 0.55)) ** 3
  return {
    card: reached('browser') ? CARD.slice(0, Math.ceil(progressBetween(p, 0, 0.3) * CARD.length)) : '',
    typing: p > 0 && p < 0.3,
    cursor: p >= 0.3 && p < 0.85 ? { x: 35 + 17 * move, y: 47 + 16 * move } : null,
    pressed: p >= 0.56 && p < 0.64,
    alert: p >= 0.66,
    outline: p >= 0.8,
  }
})

// 03 Test: three quick passes, then ten recorded seconds waiting for the alert.
const testSteps = computed(() => {
  const p = stageProgress('test')
  return TEST_STEPS.map((step, index) => {
    const from = index === 0 ? 0 : TEST_STEPS[index - 1]!.until
    const last = index === TEST_STEPS.length - 1
    let status: TestResultStatus = 'PENDING'
    if (reached('test') && p >= from) status = p < step.until ? 'RUNNING' : last ? 'FAILED' : 'PASSED'
    return { ...step, status, waited: last ? progressBetween(p, from, step.until) * 10 : null }
  })
})

// 04 Failure and 05 Bug report reveal in order.
const failure = computed(() => {
  const p = reached('failure') ? stageProgress('failure') : -1
  return { tag: p >= 0.05, meta: p >= 0.15, expected: p >= 0.3, actual: p >= 0.42, network: p >= 0.7 }
})
const report = computed(() => {
  const p = reached('report') ? stageProgress('report') : -1
  const typed = Math.ceil(progressBetween(p, 0.08, 0.55) * REPORT_TITLE.length)
  return {
    header: p >= 0.03,
    title: REPORT_TITLE.slice(0, typed),
    typing: typed > 0 && typed < REPORT_TITLE.length,
    repro: REPRO.filter((_, index) => p >= 0.6 + index * 0.08),
    evidence: p >= 0.86,
  }
})

const fade = (visible: boolean) => ['transition duration-300', visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0']
</script>

<template>
  <div ref="root" role="group" aria-label="Playback of a failing checkout test, from the agent to the bug report" class="overflow-hidden rounded-[6px] border border-line bg-surface">
    <div class="flex h-10 items-center gap-3 border-b border-line px-4 font-mono text-[11px] text-fg-subtle">
      <span class="shrink-0 text-fg-muted">TC-5</span>
      <span class="truncate">Invalid card number shows a validation message</span>
      <span class="ml-auto flex shrink-0 items-center gap-3">
        <span v-if="playing" class="size-1.5 rounded-full bg-run motion-safe:animate-blink" aria-hidden="true" />
        <span class="w-[4.5rem] text-right text-fg-muted tabular-nums" aria-hidden="true">T+{{ clock.toFixed(1) }}s</span>
        <AnimatePresence>
          <motion.button
            v-if="done"
            type="button"
            class="flex items-center gap-1 rounded-[3px] px-1.5 py-0.5 font-sans text-xs text-fg-muted hover:bg-raised hover:text-fg"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            @click="play()"
          >
            <RotateCcw class="size-3" /> Replay
          </motion.button>
        </AnimatePresence>
      </span>
    </div>

    <div class="relative">
      <!-- Playhead -->
      <div
        :class="['pointer-events-none absolute inset-y-0 z-10 hidden w-px bg-fg/60 transition-opacity duration-500 lg:block', t > 0 && !done ? 'opacity-100' : 'opacity-0']"
        :style="{ left: `${playhead * 100}%` }"
        aria-hidden="true"
      >
        <span class="absolute top-0 -left-[4px] border-x-[4.5px] border-t-[6px] border-x-transparent border-t-fg" />
      </div>

      <ol class="grid divide-y divide-line lg:grid-cols-5 lg:divide-x lg:divide-y-0">
        <li
          v-for="(stage, index) in STAGES"
          :key="stage.key"
          :class="['flex min-w-0 flex-col transition-colors duration-500', activeKey === stage.key && 'bg-raised/50']"
        >
          <!-- Time axis: a ruler with the stage's start time -->
          <div class="relative h-9 border-b border-line px-4 pt-2">
            <span :class="['font-mono text-[11px] tabular-nums', stage.key === 'failure' && reached('failure') ? 'text-fail' : 'text-fg-subtle']">T+{{ stage.at.toFixed(1) }}s</span>
            <span
              class="absolute inset-x-0 bottom-0 h-1.5 bg-[repeating-linear-gradient(to_right,var(--color-line-strong)_0_1px,transparent_1px_10px)]"
              aria-hidden="true"
            />
          </div>

          <div :class="['flex flex-1 flex-col transition-opacity duration-500', t >= stage.start ? 'opacity-100' : 'opacity-35']">
            <div class="px-4 pt-4">
              <p class="flex items-baseline gap-2">
                <span class="font-mono text-[11px] text-fg-subtle">0{{ index + 1 }}</span>
                <span class="text-sm font-semibold">{{ stage.title }}</span>
              </p>
              <p class="mt-1 text-xs leading-relaxed text-fg-subtle">{{ stage.note }}</p>
            </div>

            <div class="min-h-[13.5rem] flex-1 px-4 pt-4 pb-5">
              <!-- 01 Agent -->
              <template v-if="stage.key === 'agent'">
                <p class="caption">Goal</p>
                <p class="mt-0.5 text-[13px] leading-snug">Buy the trail backpack with an invalid card.</p>
                <ul class="mt-3 space-y-1 font-mono text-[11px] leading-snug text-fg-muted">
                  <li v-for="entry in agentLines" :key="entry.line" class="flex gap-1.5">
                    <span class="text-fg-subtle">›</span>
                    <span>{{ entry.text }}<span v-if="entry.typing" class="text-fg motion-safe:animate-blink">▍</span></span>
                  </li>
                </ul>
              </template>

              <!-- 02 Browser -->
              <LandingCheckoutMock
                v-else-if="stage.key === 'browser'"
                :card="browser.card"
                :typing="browser.typing"
                :pressed="browser.pressed"
                :alert="browser.alert"
                :outline="browser.outline"
                :cursor="browser.cursor"
              />

              <!-- 03 Test -->
              <ol v-else-if="stage.key === 'test'" class="space-y-2 text-[12px] leading-snug">
                <li v-for="(step, stepIndex) in testSteps" :key="step.verb" class="flex gap-2">
                  <RunStatusIcon :status="step.status" size="sm" class="mt-px" />
                  <span class="min-w-0">
                    <span class="mr-1 font-mono text-[11px] text-fg-subtle">0{{ stepIndex + 1 }}</span>
                    <span class="font-medium">{{ step.verb }}</span>
                    <span class="ml-1.5 font-mono text-[11px] text-fg-muted">{{ step.subject }}</span>
                    <span
                      v-if="step.waited !== null && step.status !== 'PENDING'"
                      :class="['mt-1 block font-mono text-[11px] tabular-nums', step.status === 'FAILED' ? 'text-fail' : 'text-fg-subtle']"
                    >
                      {{ step.status === 'FAILED' ? 'timed out after 10.0 s' : `waiting ${step.waited.toFixed(1)} s` }}
                    </span>
                  </span>
                </li>
              </ol>

              <!-- 04 Failure -->
              <template v-else-if="stage.key === 'failure'">
                <p class="flex items-center gap-2">
                  <span :class="fade(failure.tag)"><RunStatusBadge status="FAILED" /></span>
                  <span :class="['font-mono text-[11px] text-fg-subtle', fade(failure.meta)]">step 4 · 10.0 s</span>
                </p>
                <dl class="mt-3 space-y-2 text-[12px] leading-snug">
                  <div :class="fade(failure.expected)">
                    <dt class="caption">Expected</dt>
                    <dd class="mt-0.5">"Card number is invalid"</dd>
                  </div>
                  <div :class="fade(failure.actual)">
                    <dt class="caption">Actual</dt>
                    <dd class="mt-0.5 font-mono text-[11px] text-fail">
                      <LandingScrambleText text="&quot;Something went wrong. Please try again.&quot;" :active="failure.actual" />
                    </dd>
                  </div>
                  <div :class="fade(failure.network)">
                    <dt class="caption">Network</dt>
                    <dd class="mt-0.5 font-mono text-[11px] text-fg-muted">POST /api/payments → <span class="text-fail">500</span></dd>
                  </div>
                </dl>
              </template>

              <!-- 05 Bug report -->
              <template v-else>
                <p :class="['flex items-center gap-2 font-mono text-[11px] text-fg-subtle', fade(report.header)]">
                  BUG-104 <TestCasePriority priority="HIGH" />
                </p>
                <p class="mt-1.5 min-h-[2.6em] text-[13px] leading-snug font-semibold">
                  {{ report.title }}<span v-if="report.typing" class="font-normal text-fg-muted motion-safe:animate-blink">▍</span>
                </p>
                <p :class="['caption mt-3', fade(report.repro.length > 0)]">Steps to reproduce</p>
                <ol class="mt-1 list-decimal space-y-0.5 pl-4 text-[12px] text-fg-muted marker:font-mono marker:text-fg-subtle">
                  <li v-for="line in REPRO" :key="line" :class="fade(report.repro.includes(line))">{{ line }}</li>
                </ol>
                <div :class="fade(report.evidence)">
                  <p class="caption mt-3">Evidence</p>
                  <p class="mt-0.5 text-[12px] text-fg-muted">Screenshot, network log, step timings</p>
                </div>
              </template>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>
