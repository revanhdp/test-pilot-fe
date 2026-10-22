<script setup lang="ts">
import { RotateCcw } from '@lucide/vue'
import { AnimatePresence, motion } from 'motion-v'
import type { TestResultStatus } from '~/types/api'

/**
 * The demo "Bug Hunt" run, replayed: nine tests against a store with eight
 * planted bugs, and the failure messages the engine really prints for them
 * (backend/demo-site/bug-hunt.spec.ts holds the same expectations).
 */
const TESTS = [
  { key: 'TC-1', title: 'Deals page opens from the navigation', bug: 'Broken link', message: 'step 3 · Expected heading "Summer Deals" to be visible within 10000 ms', seconds: 10.3 },
  { key: 'TC-2', title: 'Adding a product updates the cart count', bug: 'Stale UI state', message: 'step 3 · Expected element "#cart-count" to contain "1", but its text was "0"', seconds: 10.2 },
  { key: 'TC-3', title: 'Search field accepts a query', bug: 'Renamed field', message: 'step 2 · locator.fill: Timeout 10000ms exceeded', seconds: 10.1 },
  { key: 'TC-4', title: 'Newsletter rejects an invalid email', bug: 'No validation', message: 'step 4 · Expected element "#newsletter-message" to contain "valid email", but its text was "Thanks for subscribing!"', seconds: 10.2 },
  { key: 'TC-5', title: 'Order history page loads', bug: 'Server error', message: 'step 1 · GET /orders responded with HTTP 500 Internal Server Error', seconds: 0.3 },
  { key: 'TC-6', title: 'Sales report finishes loading', bug: 'Slow page', message: 'step 2 · Expected element "#report-status" to contain "Report ready", but its text was "Loading report…"', seconds: 10.1 },
  { key: 'TC-7', title: 'Admin panel requires sign-in', bug: 'No auth check', message: 'step 2 · Expected the URL to contain "/login", but it was "http://localhost:4100/admin"', seconds: 10.1 },
  { key: 'TC-8', title: 'Product images have text alternatives', bug: 'Missing alt text', message: 'step 2 · Expected img "Trail Backpack" to be visible within 10000 ms', seconds: 10.1 },
  { key: 'TC-9', title: 'Gift card can be redeemed', bug: null, message: 'Test case has no steps', seconds: 0 },
]

// Each test gets a slot of animation time; quick ones get a short slot.
const START = 0.4
const slots = TESTS.reduce<{ start: number; end: number }[]>((acc, test) => {
  const start = acc.at(-1)?.end ?? START
  return [...acc, { start, end: start + (test.seconds === 0 ? 0.25 : test.seconds < 1 ? 0.35 : 0.62) }]
}, [])
const VERDICT_AT = slots.at(-1)!.end + 0.25
const DURATION = VERDICT_AT + 0.8

const root = ref<HTMLElement | null>(null)
const { t, done, play } = usePlayback(root, DURATION)

const rows = computed(() =>
  TESTS.map((test, index) => {
    const { start, end } = slots[index]!
    const resolved = t.value >= end
    let status: TestResultStatus = 'PENDING'
    if (resolved) status = test.bug ? 'FAILED' : 'SKIPPED'
    else if (t.value >= start) status = 'RUNNING'
    const elapsed = resolved ? test.seconds : status === 'RUNNING' ? progressBetween(t.value, start, end) * test.seconds : null
    return { ...test, status, resolved, elapsed }
  }),
)
const failed = computed(() => rows.value.filter((row) => row.status === 'FAILED').length)
const skipped = computed(() => rows.value.filter((row) => row.status === 'SKIPPED').length)
const elapsed = computed(() => rows.value.reduce((sum, row) => sum + (row.elapsed ?? 0), 0))
const finished = computed(() => t.value >= VERDICT_AT)
</script>

<template>
  <div ref="root" role="group" aria-label="Replay of the demo Bug Hunt run" class="overflow-hidden rounded-[6px] border border-line bg-surface">
    <div class="flex h-10 items-center gap-3 border-b border-line px-4 text-[12px]">
      <RunStatusBadge :status="finished ? 'FAILED' : t > 0 ? 'RUNNING' : 'PENDING'" />
      <span class="truncate text-fg-muted">Run #1 · Acme Store (Bug Hunt) · <span class="font-mono text-[11px] text-fg-subtle uppercase">chromium</span></span>
      <span class="ml-auto shrink-0 font-mono text-[11px] whitespace-nowrap text-fg-muted tabular-nums">{{ formatDuration(Math.round(elapsed * 1000)) }}</span>
    </div>

    <ol class="divide-y divide-line">
      <li
        v-for="row in rows"
        :key="row.key"
        :class="['grid grid-cols-[0.875rem_2.25rem_minmax(0,1fr)_auto] gap-x-3 px-4 py-2.5 transition-colors duration-300', row.status === 'RUNNING' && 'bg-raised/60']"
      >
        <RunStatusIcon :status="row.status" size="sm" class="mt-[3px]" />
        <span class="pt-px font-mono text-[11px] text-fg-subtle">{{ row.key }}</span>
        <span class="min-w-0">
          <span :class="['block truncate text-[13px] transition-colors', row.status === 'PENDING' ? 'text-fg-subtle' : 'text-fg']">{{ row.title }}</span>
          <span :class="['mt-0.5 block font-mono text-[11px] leading-relaxed', row.bug ? 'text-fail' : 'text-fg-subtle']">
            <LandingScrambleText :text="row.message" :active="row.resolved" :duration="450" />
          </span>
        </span>
        <span class="flex flex-col items-end gap-1.5">
          <span class="font-mono text-[11px] text-fg-subtle tabular-nums">{{ row.elapsed != null && row.seconds > 0 ? `${row.elapsed.toFixed(1)} s` : '' }}</span>
          <UiBadge v-if="row.bug" :class="['transition-opacity duration-300', row.resolved ? 'opacity-100' : 'opacity-0']">{{ row.bug }}</UiBadge>
        </span>
      </li>
    </ol>

    <div class="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line px-4 py-4">
      <div class="h-10 min-w-[7.5rem]">
        <AnimatePresence>
          <motion.p
            v-if="finished"
            class="display text-[40px] leading-none text-fail"
            :initial="{ opacity: 0, scale: 1.12 }"
            :animate="{ opacity: 1, scale: 1 }"
            :transition="{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }"
          >
            Failed
          </motion.p>
        </AnimatePresence>
      </div>
      <div class="min-w-[14rem] flex-1">
        <p class="flex gap-3 font-mono text-[11.5px] tabular-nums">
          <span class="text-fg-subtle">0 passed</span>
          <span :class="failed ? 'text-fail' : 'text-fg-subtle'">{{ failed }} failed</span>
          <span class="text-fg-subtle">{{ skipped }} skipped</span>
          <span class="text-fg-subtle">/ {{ TESTS.length }}</span>
        </p>
        <RunResultBar class="mt-2" height="md" :passed="0" :failed="failed" :skipped="skipped" :total="TESTS.length" />
      </div>
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
</template>
