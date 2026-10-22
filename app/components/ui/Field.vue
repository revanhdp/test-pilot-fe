<script setup lang="ts">
defineProps<{ label: string; hint?: string; error?: string | null; optional?: boolean }>()
</script>

<template>
  <label class="block min-w-0">
    <span class="mb-1.5 flex items-baseline gap-2 text-xs font-medium text-fg-muted">
      {{ label }}
      <span v-if="optional" class="font-normal text-fg-subtle">optional</span>
    </span>
    <slot />
    <span v-if="error" class="mt-1.5 block text-xs text-fail">{{ error }}</span>
    <span v-else-if="hint" class="mt-1.5 block text-xs leading-relaxed text-fg-subtle">{{ hint }}</span>
  </label>
</template>
