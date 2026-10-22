<script setup lang="ts">
const model = defineModel<string | number | null>()
withDefaults(defineProps<{ invalid?: boolean; mono?: boolean; size?: 'sm' | 'md' }>(), {
  size: 'md',
})
</script>

<template>
  <input
    v-model="model"
    :aria-invalid="invalid || undefined"
    :class="[
      'w-full min-w-0 rounded-md border bg-canvas text-fg placeholder:text-fg-subtle transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:opacity-60',
      size === 'sm' ? 'h-7.5 px-2 text-xs' : 'h-8.5 px-2.5 text-[13px]',
      invalid ? 'border-fail/60 focus:border-fail' : 'border-line-strong hover:border-[#3a3e48] focus:border-accent/60',
      mono && 'font-mono text-[12.5px]',
    ]"
  >
</template>
