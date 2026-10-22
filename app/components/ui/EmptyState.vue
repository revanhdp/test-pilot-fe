<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="px-6 py-14 text-center">
    <div class="mx-auto max-w-sm">
      <div v-if="$slots.icon" class="mb-3 flex justify-center text-fg-subtle [&_svg]:size-5 [&_svg]:stroke-[1.5]">
        <slot name="icon" />
      </div>
      <h3 class="text-sm font-semibold">{{ title }}</h3>
      <p v-if="description" class="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{{ description }}</p>
      <div v-if="$slots.default" class="mt-5 flex justify-center gap-2">
        <slot />
      </div>
    </div>
  </div>
</template>
