<script setup lang="ts">
import type { StepStatus, TestResultStatus, TestRunStatus } from '~/types/api'

/** Terminal-style marks: ✓ passed, ✕ failed, – skipped, ! error. */
const props = withDefaults(
  defineProps<{ status: TestRunStatus | TestResultStatus | StepStatus; size?: 'sm' | 'md' | 'lg' }>(),
  { size: 'md' },
)

const color = computed(() =>
  props.status === 'PENDING' ? 'text-fg-subtle' : TONE_CLASSES[STATUS_META[props.status].tone].text,
)
</script>

<template>
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-linecap="square"
    role="img"
    :aria-label="STATUS_META[status].label"
    :class="[
      'shrink-0',
      { sm: 'size-3.5', md: 'size-4', lg: 'size-5' }[size],
      color,
      status === 'RUNNING' && 'animate-spin',
    ]"
  >
    <path v-if="status === 'PASSED'" d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke-width="2" />
    <path v-else-if="status === 'FAILED'" d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" stroke-width="2" />
    <path v-else-if="status === 'SKIPPED'" d="M4.5 8h7" stroke-width="2" />
    <template v-else-if="status === 'ERROR'">
      <path d="M8 2.5 14 13.5H2Z" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M8 6.75v3" stroke-width="1.5" />
      <path d="M8 11.5v.25" stroke-width="1.75" />
    </template>
    <template v-else-if="status === 'RUNNING'">
      <circle cx="8" cy="8" r="5.25" stroke-width="1.75" stroke-opacity=".25" />
      <path d="M13.25 8A5.25 5.25 0 0 0 8 2.75" stroke-width="1.75" stroke-linecap="round" />
    </template>
    <circle v-else cx="8" cy="8" r="4.25" stroke-width="1.5" stroke-dasharray="2 2" />
  </svg>
</template>
