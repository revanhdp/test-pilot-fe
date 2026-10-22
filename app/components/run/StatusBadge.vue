<script setup lang="ts">
import type { TestResultStatus, TestRunStatus } from '~/types/api'

/** Inverse status tag, as test runners print it: PASS, FAIL, SKIP… */
const props = defineProps<{ status: TestRunStatus | TestResultStatus }>()
const meta = computed(() => STATUS_META[props.status])
</script>

<template>
  <span
    :class="[
      'inline-flex h-[18px] shrink-0 items-center gap-1 rounded-[3px] px-1.5 font-mono text-[10.5px] font-semibold tracking-[0.04em] whitespace-nowrap',
      TONE_CLASSES[meta.tone].solid,
    ]"
    :title="meta.label"
  >
    <span v-if="status === 'RUNNING'" class="size-1.5 motion-safe:animate-blink rounded-full bg-current" aria-hidden="true" />
    {{ meta.tag }}
  </span>
</template>
