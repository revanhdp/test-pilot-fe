<script setup lang="ts">
defineProps<{ title: string; eyebrow?: string }>()
</script>

<template>
  <header class="mb-6 flex flex-wrap items-end gap-x-6 gap-y-3">
    <div class="min-w-[min(100%,20rem)] flex-1">
      <p v-if="eyebrow" class="eyebrow mb-1.5">{{ eyebrow }}</p>
      <h1 class="truncate text-xl font-semibold tracking-tight">{{ title }}</h1>
      <div v-if="$slots.default" class="mt-1.5 text-[13px] text-fg-muted">
        <slot />
      </div>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
