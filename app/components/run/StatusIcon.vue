<script setup lang="ts">
import { CircleCheck, CircleDashed, CircleMinus, CircleX, LoaderCircle, TriangleAlert } from '@lucide/vue'
import type { StepStatus, TestResultStatus, TestRunStatus } from '~/types/api'

const props = defineProps<{ status: TestRunStatus | TestResultStatus | StepStatus }>()

const icon = computed(
  () =>
    ({
      PASSED: CircleCheck,
      FAILED: CircleX,
      SKIPPED: CircleMinus,
      ERROR: TriangleAlert,
      RUNNING: LoaderCircle,
      PENDING: CircleDashed,
    })[props.status],
)
</script>

<template>
  <component
    :is="icon"
    :aria-label="STATUS_META[status].label"
    :class="[
      'size-4 shrink-0',
      TONE_CLASSES[STATUS_META[status].tone].text,
      status === 'RUNNING' && 'animate-spin',
      status === 'PENDING' && 'opacity-60',
    ]"
  />
</template>
