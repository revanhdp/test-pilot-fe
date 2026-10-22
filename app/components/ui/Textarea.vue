<script setup lang="ts">
const model = defineModel<string | null>()
defineProps<{ invalid?: boolean }>()
</script>

<template>
  <textarea
    v-model="model"
    :aria-invalid="invalid || undefined"
    :class="[
      'w-full min-w-0 rounded-md border bg-canvas px-2.5 py-2 text-[13px] leading-relaxed text-fg placeholder:text-fg-subtle transition-colors',
      'resize-y focus:outline-none focus:ring-2 focus:ring-accent/15',
      invalid ? 'border-fail/60 focus:border-fail' : 'border-line-strong hover:border-[#3a3e48] focus:border-accent/60',
    ]"
  />
</template>
