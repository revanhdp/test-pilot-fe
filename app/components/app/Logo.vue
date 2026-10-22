<script setup lang="ts">
withDefaults(defineProps<{ showText?: boolean }>(), { showText: true })
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <!-- A flight-test photo target: the quadrant mark painted on test aircraft and crash-test dummies. -->
    <svg class="size-5 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.75" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path d="M10 10V1.25A8.75 8.75 0 0 1 18.75 10ZM10 10v8.75A8.75 8.75 0 0 1 1.25 10Z" fill="currentColor" />
    </svg>
    <span v-if="showText" class="text-[15px] font-semibold tracking-[-0.01em]">TestPilot</span>
  </span>
</template>
