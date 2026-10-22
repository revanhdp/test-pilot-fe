<script setup lang="ts">
/** `eyebrow` is the context the page lives in (project, suite…), shown above the title. */
defineProps<{ title: string; eyebrow?: string }>()
</script>

<template>
  <header class="mb-7 flex flex-wrap items-end gap-x-6 gap-y-4">
    <div class="min-w-[min(100%,20rem)] flex-1">
      <p v-if="eyebrow" class="mb-1 truncate text-[13px] text-fg-subtle">{{ eyebrow }}</p>
      <h1 class="text-2xl leading-tight font-semibold tracking-[-0.015em] text-balance wrap-break-word">{{ title }}</h1>
      <div v-if="$slots.default" class="mt-2 text-[13px] text-fg-muted">
        <slot />
      </div>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
