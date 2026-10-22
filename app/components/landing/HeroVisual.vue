<script setup lang="ts">
import { CircleCheck, CircleX, LoaderCircle, Lock } from '@lucide/vue'

/** Static product composite: agent activity → browser → failed assertion → bug report. */
const activity = [
  { text: 'Opened /checkout', state: 'done' },
  { text: 'Filled Card number "4111 1111"', state: 'done' },
  { text: 'Clicked button "Pay $49.00"', state: 'done' },
  { text: 'Expected alert to contain "Card number is invalid"', state: 'fail' },
  { text: 'Analyzing HTTP 500 response', state: 'run' },
] as const
</script>

<template>
  <div class="relative mx-auto w-full max-w-[640px] select-none" aria-hidden="true">
    <!-- Browser -->
    <div class="relative ml-auto w-[88%] overflow-hidden rounded-xl border border-line-strong bg-[#0c0d10] shadow-[0_40px_120px_-40px_rgb(91_140_255/0.35)]">
      <div class="flex items-center gap-3 border-b border-line bg-raised px-3 py-2">
        <div class="flex gap-1.5"><span class="size-2.5 rounded-full bg-[#3a3d45]" /><span class="size-2.5 rounded-full bg-[#3a3d45]" /><span class="size-2.5 rounded-full bg-[#3a3d45]" /></div>
        <div class="flex h-6 flex-1 items-center gap-1.5 rounded-md border border-line bg-canvas px-2">
          <Lock class="size-3 text-fg-subtle" />
          <span class="font-mono text-[11px] text-fg-muted">staging.acme.store/checkout</span>
        </div>
        <span class="font-mono text-[10px] tracking-wide text-fg-subtle">CHROMIUM</span>
      </div>
      <div class="relative bg-[#f6f7f9] px-8 pt-7 pb-12">
        <div class="ml-auto max-w-[250px] rounded-lg border border-[#e3e5e8] bg-white p-5 text-[#1f2328]">
          <p class="text-[15px] font-bold">Checkout</p>
          <p class="mt-1 text-[10px] text-[#57606a]">Trail Backpack — <b>$49.00</b></p>
          <p class="mt-3 text-[9px] font-semibold">Card number</p>
          <div class="mt-1 rounded border border-[#cdd1d6] px-2 py-1 font-mono text-[10px]">4111 1111</div>
          <p class="mt-2 text-[9px] font-semibold">Expiry</p>
          <div class="mt-1 rounded border border-[#cdd1d6] px-2 py-1 font-mono text-[10px]">12/30</div>
          <div class="mt-3 rounded bg-[#4f46e5] py-1.5 text-center text-[10px] font-semibold text-white">Pay $49.00</div>
          <div class="relative mt-2.5">
            <div class="rounded bg-[#fdecec] px-2 py-1.5 text-[9.5px] text-[#a4161a]">Something went wrong. Please try again.</div>
            <!-- inspector highlight -->
            <div class="absolute -inset-1 rounded-md border-2 border-fail shadow-[0_0_0_4px_rgb(242_95_92/0.15)]" />
            <span class="absolute -top-5 left-0 rounded bg-fail px-1.5 py-0.5 font-mono text-[9px] whitespace-nowrap text-white">role=alert · assertText</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent activity -->
    <div class="absolute top-[15%] left-0 w-[45%] rounded-xl border border-line-strong bg-surface/95 p-3.5 shadow-2xl shadow-black/60 backdrop-blur">
      <div class="mb-2.5 flex items-center gap-2">
        <span class="relative flex size-2"><span class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" /><span class="relative inline-flex size-2 rounded-full bg-accent" /></span>
        <span class="text-[11px] font-medium">AI activity</span>
        <span class="ml-auto font-mono text-[10px] text-fg-subtle">TC-5</span>
      </div>
      <ul class="space-y-1.5">
        <li
          v-for="(item, index) in activity"
          :key="item.text"
          class="flex animate-fade-in items-start gap-2 text-[11px] leading-snug opacity-0 [animation-fill-mode:forwards]"
          :style="{ animationDelay: `${0.2 + index * 0.3}s` }"
        >
          <CircleCheck v-if="item.state === 'done'" class="mt-px size-3.5 shrink-0 text-pass" />
          <CircleX v-else-if="item.state === 'fail'" class="mt-px size-3.5 shrink-0 text-fail" />
          <LoaderCircle v-else class="mt-px size-3.5 shrink-0 animate-spin text-accent" />
          <span :class="item.state === 'fail' ? 'text-fail/90' : item.state === 'run' ? 'text-fg' : 'text-fg-muted'">{{ item.text }}</span>
        </li>
      </ul>
    </div>

    <!-- Bug report -->
    <div
      class="relative z-10 -mt-10 mr-[4%] ml-[22%] animate-fade-in rounded-xl border border-fail/30 bg-surface p-4 opacity-0 shadow-2xl shadow-black/60 [animation-delay:1.8s] [animation-fill-mode:forwards]"
    >
      <div class="flex items-center gap-2">
        <span class="font-mono text-[10.5px] text-fg-subtle">BUG-104</span>
        <span class="rounded border border-warn/30 bg-warn/10 px-1.5 text-[10px] font-medium text-warn">HIGH</span>
        <span class="rounded border border-line-strong bg-overlay px-1.5 text-[10px] text-fg-muted">VALIDATION</span>
        <span class="ml-auto text-[10px] text-fg-subtle">Staging</span>
      </div>
      <p class="mt-2 text-[13px] font-semibold">Payment endpoint returns HTTP 500 for invalid card input</p>
      <div class="mt-2.5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line text-[10.5px]">
        <div class="bg-raised px-2.5 py-1.5"><span class="text-fg-subtle">Expected</span><br><span class="text-fg-muted">Validation message</span></div>
        <div class="bg-fail/[0.07] px-2.5 py-1.5"><span class="text-fail/70">Actual</span><br><span class="text-[#f6a5a3]">POST /api/pay → 500</span></div>
      </div>
    </div>
  </div>
</template>
