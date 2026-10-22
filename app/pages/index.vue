<script setup lang="ts">
import { ArrowRight, Braces, Bug, Camera, FileWarning, Globe, Play, Radar, ShieldCheck } from '@lucide/vue'

definePageMeta({ layout: false, public: true })
useHead({ title: 'TestPilot AI — Let AI test your software' })

const { user } = useAuth()
const startTo = computed(() => (user.value ? '/dashboard' : '/register'))

const pipeline = [
  { icon: Radar, title: 'AI agent', body: 'Explores the app toward a goal you set, using only approved browser tools.' },
  { icon: Globe, title: 'Real browser', body: 'Playwright drives a real Chromium browser against your environment.' },
  { icon: Play, title: 'Test', body: 'Structured steps with assertions. The engine — not the model — decides pass or fail.' },
  { icon: FileWarning, title: 'Failure', body: 'Screenshot, failing step, expected vs actual — captured automatically.' },
  { icon: Bug, title: 'Bug report', body: 'Evidence and analysis become an editable, reproducible report.' },
]

const features = [
  {
    icon: Braces,
    title: 'Structured actions, never generated code',
    body: 'Every step is validated JSON — navigate, click, fill, assert. Nothing an LLM writes is ever eval’d.',
  },
  {
    icon: Camera,
    title: 'Evidence on every result',
    body: 'Each test runs in an isolated browser context and ends with a screenshot, final URL and per-step timings.',
  },
  {
    icon: ShieldCheck,
    title: 'Scoped to your environment',
    body: 'Tests can only open pages on the environment’s origin, with timeouts and step limits on every run.',
  },
]
</script>

<template>
  <div class="min-h-dvh overflow-x-hidden bg-canvas">
    <!-- Nav -->
    <header class="relative z-20 mx-auto flex max-w-6xl items-center gap-6 px-6 py-5">
      <NuxtLink to="/"><AppLogo /></NuxtLink>
      <nav class="hidden gap-6 text-[13px] text-fg-muted md:flex">
        <a href="#how-it-works" class="hover:text-fg">How it works</a>
        <a href="#features" class="hover:text-fg">Features</a>
      </nav>
      <div class="ml-auto flex items-center gap-2">
        <UiButton v-if="!user" variant="ghost" to="/login">Sign in</UiButton>
        <UiButton variant="primary" :to="startTo">{{ user ? 'Open dashboard' : 'Start Testing' }}</UiButton>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative">
      <div class="grid-backdrop pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_30%,black,transparent)]" />
      <div class="pointer-events-none absolute top-[-10%] right-[5%] h-[520px] w-[620px] rounded-full bg-accent-strong/20 blur-[140px]" />
      <div class="pointer-events-none absolute top-[30%] right-[30%] h-[300px] w-[400px] rounded-full bg-accent-blue/10 blur-[120px]" />

      <div class="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pt-10 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:pt-16">
        <div>
          <p class="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/80 px-3 py-1 text-xs text-fg-muted">
            <span class="size-1.5 rounded-full bg-accent" /> Playwright engine · AI failure analysis
          </p>
          <h1 class="mt-6 text-[2.75rem] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-6xl">
            Let AI test<br>
            <span class="bg-gradient-to-r from-[#c4b9ff] via-accent to-accent-blue bg-clip-text text-transparent">your software.</span>
          </h1>
          <p class="mt-6 max-w-lg text-base leading-relaxed text-fg-muted">
            TestPilot explores your application, executes real browser tests, detects failures, and turns them into actionable bug reports.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UiButton variant="primary" :to="startTo" class="!h-10 !px-4 !text-sm">Start Testing <ArrowRight /></UiButton>
            <UiButton :to="{ path: '/', hash: '#how-it-works' }" class="!h-10 !px-4 !text-sm">View Demo</UiButton>
          </div>
          <dl class="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
            <div><dt class="eyebrow">Engine</dt><dd class="mt-1 text-[13px]">Playwright</dd></div>
            <div><dt class="eyebrow">Output</dt><dd class="mt-1 text-[13px]">Validated JSON</dd></div>
            <div><dt class="eyebrow">Verdict</dt><dd class="mt-1 text-[13px]">Real browser</dd></div>
          </dl>
        </div>
        <LandingHeroVisual />
      </div>
    </section>

    <!-- Pipeline -->
    <section id="how-it-works" class="scroll-mt-8 border-t border-line bg-surface/40">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <p class="eyebrow">How it works</p>
        <h2 class="mt-3 max-w-xl text-3xl font-semibold tracking-tight">From a goal to a bug report, with evidence at every step.</h2>
        <ol class="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-5">
          <li v-for="(stage, index) in pipeline" :key="stage.title" class="relative bg-surface p-5">
            <div class="flex items-center gap-2">
              <span class="flex size-8 items-center justify-center rounded-lg border border-line-strong bg-raised text-accent"><component :is="stage.icon" class="size-4" /></span>
              <span class="ml-auto font-mono text-[11px] text-fg-subtle">0{{ index + 1 }}</span>
            </div>
            <h3 class="mt-4 text-sm font-semibold">{{ stage.title }}</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{{ stage.body }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="scroll-mt-8 border-t border-line">
      <div class="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-3">
        <div v-for="feature in features" :key="feature.title">
          <component :is="feature.icon" class="size-5 text-accent" />
          <h3 class="mt-4 text-[15px] font-semibold">{{ feature.title }}</h3>
          <p class="mt-2 text-[13px] leading-relaxed text-fg-muted">{{ feature.body }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="border-t border-line">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-14">
        <div class="flex-1">
          <h2 class="text-xl font-semibold tracking-tight">Point it at a staging URL. Watch it run.</h2>
          <p class="mt-1.5 text-[13px] text-fg-muted">Create a project, describe a flow, and get a real browser verdict in minutes.</p>
        </div>
        <UiButton variant="primary" :to="startTo" class="!h-10 !px-4 !text-sm">Start Testing <ArrowRight /></UiButton>
      </div>
      <footer class="mx-auto flex max-w-6xl items-center gap-4 border-t border-line px-6 py-6 text-xs text-fg-subtle">
        <AppLogo :show-text="false" />
        <span>TestPilot AI</span>
        <span class="ml-auto">Built with Nuxt, NestJS, PostgreSQL & Playwright</span>
      </footer>
    </section>
  </div>
</template>
