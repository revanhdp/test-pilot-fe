<script setup lang="ts">
import type { Tone } from '~/utils/status'

withDefaults(defineProps<{ tone?: Tone; dot?: boolean; pulse?: boolean; mono?: boolean }>(), {
  tone: 'neutral',
})
</script>

<template>
  <span
    :class="[
      'inline-flex h-5 shrink-0 items-center gap-1.5 rounded border px-1.5 text-[11px] font-medium whitespace-nowrap',
      TONE_CLASSES[tone].text,
      TONE_CLASSES[tone].bg,
      TONE_CLASSES[tone].border,
      mono && 'font-mono tracking-tight',
    ]"
  >
    <span v-if="dot" :class="['size-1.5 rounded-full', TONE_CLASSES[tone].dot, pulse && 'animate-pulse-soft']" />
    <slot />
  </span>
</template>
