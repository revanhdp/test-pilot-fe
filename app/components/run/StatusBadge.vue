<script setup lang="ts">
import type { TestResultStatus, TestRunStatus } from '~/types/api'

const props = defineProps<{ status: TestRunStatus | TestResultStatus }>()
const meta = computed(() => STATUS_META[props.status])
</script>

<template>
  <UiBadge :tone="meta.tone" dot :pulse="status === 'RUNNING'">{{ meta.label }}</UiBadge>
</template>
