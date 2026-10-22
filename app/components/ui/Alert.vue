<script setup lang="ts">
import { TriangleAlert } from '@lucide/vue'

defineProps<{ message: string | null | undefined }>()
</script>

<template>
  <div
    v-if="message"
    role="alert"
    class="flex items-start gap-2 rounded-md border border-fail/25 bg-fail/8 px-3 py-2 text-xs leading-relaxed text-fail"
  >
    <TriangleAlert class="mt-px size-3.5 shrink-0" />
    <span>{{ message }}</span>
  </div>
</template>
