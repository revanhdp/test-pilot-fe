<script setup lang="ts">
withDefaults(defineProps<{ showText?: boolean }>(), { showText: true })

// Unique per instance: a gradient defined inside a hidden copy (e.g. the desktop
// sidebar on mobile) would otherwise blank out every other logo.
const gradientId = `tp-logo-${useId()}`
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <svg class="size-7 shrink-0" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#a594ff" />
          <stop offset="1" stop-color="#5b8cff" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="#14151a" />
      <rect x=".5" y=".5" width="31" height="31" rx="7.5" fill="none" :stroke="`url(#${gradientId})`" stroke-opacity=".55" />
      <path d="M10 9.5 6.5 16l3.5 6.5M22 9.5l3.5 6.5-3.5 6.5" fill="none" stroke="#5d6370" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="m13 10.5 8 5.5-8 5.5z" :fill="`url(#${gradientId})`" />
    </svg>
    <span v-if="showText" class="flex items-baseline gap-1.5">
      <span class="text-[15px] font-semibold tracking-tight">TestPilot</span>
      <span class="font-mono text-[10px] font-medium tracking-wider text-accent">AI</span>
    </span>
  </span>
</template>
