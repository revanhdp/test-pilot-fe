<script setup lang="ts">
import { Check } from '@lucide/vue'

/**
 * Plans, priced by test executions. Features that aren't built yet say so.
 * Prices sit on split-flap cells, so switching the billing period flips them.
 */
interface Plan {
  name: string
  note: string
  monthly: number
  /** Per month, billed yearly (two months free). */
  yearly: number
  cta: string
  recommended?: boolean
  includes?: string
  features: { label: string; soon?: boolean }[]
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    note: 'For trying it on one app.',
    monthly: 0,
    yearly: 0,
    cta: 'Start free',
    features: [
      { label: '1 project' },
      { label: '200 test executions a month' },
      { label: 'Screenshots, step timings and failure details' },
      { label: '7 days of run history' },
    ],
  },
  {
    name: 'Pro',
    note: 'For a developer who ships every week.',
    monthly: 19,
    yearly: 16,
    cta: 'Start with Pro',
    recommended: true,
    includes: 'Everything in Free, plus',
    features: [
      { label: '5 projects' },
      { label: '3,000 test executions a month' },
      { label: 'AI test generation', soon: true },
      { label: 'AI failure analysis', soon: true },
      { label: '90 days of run history' },
    ],
  },
  {
    name: 'Team',
    note: 'For a team with a release process.',
    monthly: 79,
    yearly: 66,
    cta: 'Start with Team',
    includes: 'Everything in Pro, plus',
    features: [
      { label: 'Unlimited projects' },
      { label: '15,000 test executions a month' },
      { label: 'Shared team workspace', soon: true },
      { label: 'Scheduled and CI-triggered runs', soon: true },
      { label: 'GitHub issues from failures', soon: true },
      { label: '1 year of run history' },
    ],
  },
]

const yearly = ref(false)
const priceOf = (plan: Plan) => (yearly.value ? plan.yearly : plan.monthly)
/** Same number of cells either way, so only the digits that change flip. */
const cellsOf = (plan: Plan) => `$${priceOf(plan)}`.padStart(`$${plan.monthly}`.length).split('')
</script>

<template>
  <div>
    <!-- Billing period -->
    <div class="relative inline-grid grid-cols-2 rounded-[5px] border border-line bg-surface p-0.5 text-[13px]">
      <span
        :class="['absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-[3px] bg-overlay transition-transform duration-300', yearly && 'translate-x-full']"
        aria-hidden="true"
      />
      <button type="button" :aria-pressed="!yearly" :class="['relative h-8 px-4', !yearly ? 'text-fg' : 'text-fg-muted hover:text-fg']" @click="yearly = false">
        Monthly
      </button>
      <button type="button" :aria-pressed="yearly" :class="['relative h-8 px-4', yearly ? 'text-fg' : 'text-fg-muted hover:text-fg']" @click="yearly = true">
        Yearly <span class="font-mono text-[11px] text-fg-subtle">2 months free</span>
      </button>
    </div>

    <div class="mt-6 grid divide-y divide-line overflow-hidden rounded-[6px] border border-line bg-surface lg:grid-cols-3 lg:divide-x lg:divide-y-0">
      <section v-for="plan in PLANS" :key="plan.name" :class="['flex flex-col p-6', plan.recommended && 'bg-raised/60']">
        <div class="flex items-center gap-2">
          <h3 class="text-[15px] font-semibold">{{ plan.name }}</h3>
          <UiBadge v-if="plan.recommended">Recommended</UiBadge>
        </div>
        <p class="mt-1 text-[13px] text-fg-muted">{{ plan.note }}</p>

        <div class="mt-7 flex items-end gap-3">
          <span class="inline-flex gap-[0.06em] text-[40px] leading-none" aria-hidden="true">
            <LandingFlapCell
              v-for="(char, index) in cellsOf(plan)"
              :key="index"
              :char="char"
              :delay="index * 50"
              :spins="2"
              glyphs="0123456789"
            />
          </span>
          <span class="pb-1 text-xs leading-snug text-fg-subtle">
            <template v-if="plan.monthly === 0">free<br>forever</template>
            <template v-else>per month<br>{{ yearly ? 'billed yearly' : 'billed monthly' }}</template>
          </span>
          <span class="sr-only">
            {{ plan.monthly === 0 ? 'Free forever' : `$${priceOf(plan)} per month, billed ${yearly ? 'yearly' : 'monthly'}` }}
          </span>
        </div>

        <UiButton class="mt-7" :variant="plan.recommended ? 'primary' : 'secondary'" size="lg" block to="/register">{{ plan.cta }}</UiButton>

        <p v-if="plan.includes" class="mt-7 text-xs text-fg-subtle">{{ plan.includes }}</p>
        <ul :class="['space-y-2.5 text-[13px]', plan.includes ? 'mt-3' : 'mt-7']">
          <li v-for="feature in plan.features" :key="feature.label" class="flex gap-2.5">
            <Check class="mt-0.5 size-3.5 shrink-0 text-fg-muted" />
            <span :class="feature.soon ? 'text-fg-muted' : 'text-fg'">
              {{ feature.label }}
              <span v-if="feature.soon" class="ml-1 font-mono text-[10.5px] text-fg-subtle">soon</span>
            </span>
          </li>
        </ul>
      </section>
    </div>

    <p class="mt-4 text-[13px] text-fg-subtle">
      TestPilot is in beta: every account runs free, without limits, until billing launches. A test execution is one test case run once in one browser.
    </p>
  </div>
</template>
