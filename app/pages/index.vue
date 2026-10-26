<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { MotionConfig, motion, stagger, useMotionValueEvent, useScroll } from 'motion-v'

definePageMeta({ layout: false, public: true })
useHead({ title: 'TestPilot AI — Let AI test your software' })

const { user } = useAuth()
const startTo = computed(() => (user.value ? '/dashboard' : '/register'))

/** The departure board in the headline; the first word is the one the sentence is about. */
const FLAP_WORDS = ['software.', 'checkout.', 'sign-in.', 'search.', 'payments.']

/** What the engine does today, as a datasheet. */
const SPEC = [
  { term: 'Verdict', detail: 'Decided by Playwright assertions in a real browser. A model never decides pass or fail.' },
  { term: 'Browser', detail: 'Chromium. One browser per run and a fresh context, with its own cookies and storage, for every test.' },
  { term: 'Steps', detail: 'Navigate, click, fill, select, check, uncheck, press and wait, plus five assertions: visible, hidden, text, URL and title.' },
  { term: 'Locators', detail: 'Role and accessible name, label, text, placeholder, test id or CSS.' },
  { term: 'Evidence', detail: 'A screenshot of the final state, the final URL and page title, the failing step and a timing for every step.' },
  { term: 'Scope', detail: 'Tests only open pages on the environment’s own origin. An HTTP 4xx/5xx fails a navigation unless allowed.' },
  { term: 'Limits', detail: '10 s per step, 2 min per test, 100 steps per test.' },
]

// The sticky nav gets its hairline once the page has scrolled.
const scrolled = ref(false)
const { scrollY } = useScroll()
useMotionValueEvent(scrollY, 'change', (y) => (scrolled.value = y > 8))

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const rise = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}
const heroSequence = { hidden: {}, visible: { transition: { delayChildren: stagger(0.09) } } }
const specSequence = { hidden: {}, visible: { transition: { delayChildren: stagger(0.05) } } }
</script>

<template>
  <MotionConfig reduced-motion="user">
    <div class="min-h-dvh overflow-x-clip bg-canvas">
      <!-- Nav -->
      <header :class="['sticky top-0 z-30 border-b bg-canvas transition-colors duration-300', scrolled ? 'border-line' : 'border-transparent']">
        <div class="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-6">
          <NuxtLink to="/" class="rounded-sm"><AppLogo /></NuxtLink>
          <nav class="hidden gap-6 text-[13px] text-fg-muted md:flex">
            <a href="#how-it-works" class="hover:text-fg">How it works</a>
            <a href="#bug-hunt" class="hover:text-fg">Bug hunt</a>
            <a href="#engine" class="hover:text-fg">The engine</a>
            <a href="#pricing" class="hover:text-fg">Pricing</a>
            <a href="#faq" class="hover:text-fg">FAQ</a>
          </nav>
          <div class="ml-auto flex items-center gap-2">
            <UiButton v-if="!user" variant="ghost" to="/login">Sign in</UiButton>
            <UiButton variant="primary" :to="startTo">{{ user ? 'Open dashboard' : 'Start testing' }}</UiButton>
          </div>
        </div>
      </header>

      <!-- Hero -->
      <motion.section
        class="mx-auto max-w-[1200px] px-6 pt-14 pb-12 lg:pt-24 lg:pb-16"
        initial="hidden"
        animate="visible"
        :variants="heroSequence"
      >
        <motion.h1 :variants="rise" class="text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
          <span class="sr-only">Let AI test your software.</span>
          <span aria-hidden="true" class="block">Let AI test</span>
          <span aria-hidden="true" class="mt-[0.12em] flex flex-wrap items-center gap-x-[0.26em] gap-y-2">
            your
            <LandingSplitFlap class="text-[0.8em] tracking-normal" :words="FLAP_WORDS" :length="9" />
          </span>
        </motion.h1>
        <motion.div :variants="rise" class="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-7">
          <p class="max-w-[46ch] text-[17px] leading-relaxed text-fg-muted">
            TestPilot explores your application, executes real browser tests, detects failures, and turns them into actionable bug reports.
          </p>
          <div class="flex flex-wrap gap-3">
            <UiButton variant="primary" size="lg" :to="startTo">Start testing <ArrowRight /></UiButton>
            <UiButton size="lg" :to="{ path: '/', hash: '#how-it-works' }">View demo</UiButton>
          </div>
        </motion.div>
      </motion.section>

      <!-- How it works: the recorder -->
      <section id="how-it-works" class="mx-auto max-w-[1200px] scroll-mt-20 px-6 pb-24">
        <LandingReveal>
          <p class="mb-3 text-[13px] text-fg-subtle">One failing checkout test, played back from the agent to the bug report.</p>
          <LandingRecorder />
        </LandingReveal>
      </section>

      <!-- Bug hunt -->
      <section id="bug-hunt" class="scroll-mt-16 border-t border-line">
        <div class="mx-auto grid max-w-[1200px] items-start gap-x-16 gap-y-10 px-6 py-20 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:py-28">
          <LandingReveal class="lg:sticky lg:top-28">
            <h2 class="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.025em]">
              Eight planted bugs. Eight real failures.
            </h2>
            <p class="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-fg-muted">
              The demo store ships with bugs on purpose. This is the run that finds them, with the messages the engine actually prints.
            </p>
            <p class="mt-8 text-[13px] text-fg-subtle">Start the store with every bug fixed and the same tests pass:</p>
            <code class="mt-2 inline-block rounded-[4px] border border-line bg-surface px-2.5 py-1.5 font-mono text-[12px] text-fg-muted">pnpm demo:site:fixed</code>
          </LandingReveal>
          <LandingReveal :delay="0.1">
            <LandingBugHuntRun />
          </LandingReveal>
        </div>
      </section>

      <!-- Steps are data -->
      <section id="steps" class="scroll-mt-16 border-t border-line">
        <div class="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
          <LandingReveal class="max-w-2xl">
            <h2 class="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.025em]">Steps are data, never code.</h2>
            <p class="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-fg-muted">
              Every step is checked against one schema before it is stored or run, whether a person wrote it or a model proposed it. Nothing is ever evaluated as code.
            </p>
          </LandingReveal>
          <LandingReveal :delay="0.1" class="mt-12">
            <LandingStepsDemo />
          </LandingReveal>
        </div>
      </section>

      <!-- Failure analysis -->
      <section id="analysis" class="scroll-mt-16 border-t border-line">
        <div class="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
          <LandingReveal class="max-w-2xl">
            <h2 class="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.025em]">Failures come with an explanation.</h2>
            <p class="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-fg-muted">
              The evidence from a failed test goes to a model, which writes the analysis and drafts the bug report. It explains the failure. The browser already decided it.
            </p>
          </LandingReveal>
          <LandingReveal :delay="0.1" class="mt-12">
            <LandingFailureAnalysis />
          </LandingReveal>
        </div>
      </section>

      <!-- The engine -->
      <section id="engine" class="scroll-mt-16 border-t border-line">
        <div class="mx-auto grid max-w-[1200px] gap-x-16 gap-y-10 px-6 py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:py-28">
          <LandingReveal>
            <h2 class="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.025em]">
              The browser decides.<br>Not the model.
            </h2>
            <p class="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-fg-muted">
              AI can explore an app and propose what to test. Whether a test passed is decided the same way every time: by assertions running in Chromium.
            </p>
          </LandingReveal>
          <motion.dl
            class="divide-y divide-line border-y border-line"
            initial="hidden"
            while-in-view="visible"
            :in-view-options="{ once: true, margin: '0px 0px -12% 0px' }"
            :variants="specSequence"
          >
            <motion.div
              v-for="row in SPEC"
              :key="row.term"
              :variants="rise"
              class="grid gap-1 py-3.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-6"
            >
              <dt class="text-[13px] text-fg-subtle">{{ row.term }}</dt>
              <dd class="text-[14px] leading-relaxed">{{ row.detail }}</dd>
            </motion.div>
          </motion.dl>
        </div>
      </section>

      <!-- Pricing -->
      <section id="pricing" class="scroll-mt-16 border-t border-line">
        <div class="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
          <LandingReveal class="max-w-2xl">
            <h2 class="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.025em]">Priced by test runs, not by seats.</h2>
            <p class="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-fg-muted">
              Every plan runs the same engine and keeps the same evidence. Plans differ in how much you run and how long results are kept.
            </p>
          </LandingReveal>
          <LandingReveal :delay="0.1" class="mt-10">
            <LandingPricing />
          </LandingReveal>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="scroll-mt-16 border-t border-line">
        <div class="mx-auto grid max-w-[1200px] gap-x-16 gap-y-8 px-6 py-20 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:py-28">
          <LandingReveal>
            <h2 class="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.025em]">Questions</h2>
            <p class="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-fg-muted">What people ask before pointing it at their own site.</p>
          </LandingReveal>
          <LandingReveal :delay="0.1">
            <LandingFaq />
          </LandingReveal>
        </div>
      </section>

      <!-- CTA -->
      <section class="border-t border-line">
        <LandingReveal class="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 px-6 py-16">
          <div>
            <h2 class="text-2xl font-semibold tracking-[-0.015em]">Point it at a staging URL. Watch it run.</h2>
            <p class="mt-2 text-[14px] text-fg-muted">Create a project, describe a flow, and get a real browser verdict in minutes.</p>
          </div>
          <UiButton variant="primary" size="lg" :to="startTo">Start testing <ArrowRight /></UiButton>
        </LandingReveal>
        <footer class="border-t border-line">
          <div class="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-2 px-6 py-6 text-xs text-fg-subtle">
            <AppLogo :show-text="false" />
            <span>TestPilot AI</span>
            <span class="ml-auto">Built with Nuxt, NestJS, PostgreSQL and Playwright</span>
          </div>
        </footer>
      </section>
    </div>
  </MotionConfig>
</template>
