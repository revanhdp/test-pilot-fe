<script setup lang="ts">
/** The page under test in the landing scenes: a small checkout form, driven by props. */
withDefaults(
  defineProps<{
    /** What has been typed into the card field so far. */
    card?: string
    typing?: boolean
    pressed?: boolean
    /** The error alert the test asserts on. */
    alert?: boolean
    /** Outline the alert like an element inspector. */
    outline?: boolean
    /** Pointer position in percent of the page, when shown. */
    cursor?: { x: number; y: number } | null
  }>(),
  { card: '4111 1111', typing: false, pressed: false, alert: true, outline: true, cursor: null },
)
</script>

<template>
  <div class="overflow-hidden rounded-[4px] border border-line-strong select-none">
    <div class="flex h-6 items-center gap-1.5 border-b border-line bg-raised px-2 font-mono text-[9.5px]">
      <span class="text-fg-subtle">https</span>
      <span class="truncate text-fg-muted">staging.acme.store/checkout</span>
    </div>
    <div class="relative bg-[#f5f4f0] px-3 pt-3 pb-4 text-[#1d1d1b]">
      <p class="text-[12px] font-semibold">Checkout</p>
      <p class="text-[9.5px] text-[#6b6a64]">Trail Backpack · $49.00</p>
      <p class="mt-2 text-[9px] font-medium">Card number</p>
      <p class="mt-0.5 h-[19px] rounded-[3px] border border-[#cfcdc6] bg-white px-1.5 py-0.5 font-mono text-[9.5px]">
        {{ card }}<span v-if="typing" class="motion-safe:animate-blink">|</span>
      </p>
      <p
        :class="[
          'mt-2 rounded-[3px] py-1 text-center text-[9.5px] font-medium text-white transition-transform duration-100',
          pressed ? 'scale-[0.97] bg-black' : 'bg-[#1d1d1b]',
        ]"
      >
        Pay $49.00
      </p>
      <div :class="['relative mt-3 transition duration-300', alert ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0']">
        <p class="rounded-[3px] bg-[#fbe9e7] px-1.5 py-1 text-[9px] text-[#a1271b]">Something went wrong. Please try again.</p>
        <span :class="['absolute -inset-[3px] rounded-[4px] border-[1.5px] border-fail transition duration-300', outline ? 'scale-100 opacity-100' : 'scale-105 opacity-0']" />
        <span :class="['absolute -top-[17px] right-[-3px] bg-fail px-1 font-mono text-[8.5px] leading-[14px] text-canvas transition-opacity duration-300', outline ? 'opacity-100' : 'opacity-0']">role=alert</span>
      </div>

      <!-- Pointer, with a ring while pressing -->
      <span
        v-if="cursor"
        class="pointer-events-none absolute size-3.5 -translate-x-[2px] -translate-y-[1px]"
        :style="{ left: `${cursor.x}%`, top: `${cursor.y}%` }"
      >
        <span :class="['absolute -top-1.5 -left-1.5 size-4 rounded-full border border-[#1d1d1b]/50 transition duration-200', pressed ? 'scale-100 opacity-100' : 'scale-50 opacity-0']" />
        <svg viewBox="0 0 14 14" class="relative size-3.5 drop-shadow-[0_1px_1px_rgb(0_0_0/0.25)]">
          <path d="M1.5 1.5v10l2.6-2.4 1.8 4 1.8-.8-1.8-3.9h3.6z" fill="#fff" stroke="#1d1d1b" stroke-width="1" stroke-linejoin="round" />
        </svg>
      </span>
    </div>
  </div>
</template>
