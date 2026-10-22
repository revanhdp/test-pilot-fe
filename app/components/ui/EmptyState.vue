<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="relative overflow-hidden px-6 py-12 text-center">
    <div class="grid-backdrop pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
    <div class="relative mx-auto max-w-sm">
      <div
        v-if="$slots.icon"
        class="mx-auto mb-4 flex size-10 items-center justify-center rounded-lg border border-line-strong bg-raised text-fg-muted [&_svg]:size-4.5"
      >
        <slot name="icon" />
      </div>
      <h3 class="text-sm font-medium">{{ title }}</h3>
      <p v-if="description" class="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{{ description }}</p>
      <div v-if="$slots.default" class="mt-5 flex justify-center gap-2">
        <slot />
      </div>
    </div>
  </div>
</template>
