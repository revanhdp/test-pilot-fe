<script setup lang="ts">
const model = defineModel<string | number | null>()
withDefaults(defineProps<{ invalid?: boolean; mono?: boolean; size?: 'sm' | 'md' }>(), {
  size: 'md',
})
</script>

<template>
  <!-- 16px text on phones so iOS Safari doesn't zoom in on focus; compact from `sm` up. -->
  <input
    v-model="model"
    :aria-invalid="invalid || undefined"
    :class="[
      'w-full min-w-0 rounded-[4px] border bg-canvas text-base text-fg placeholder:text-fg-subtle/80 transition-colors',
      'focus:outline-none disabled:opacity-60',
      size === 'sm' ? 'h-8.5 px-2 sm:h-7.5 sm:text-xs' : ['h-10 px-2.5 sm:h-8.5', mono ? 'sm:text-[12.5px]' : 'sm:text-[13px]'],
      invalid ? 'border-fail/70 focus:border-fail' : 'border-line-strong hover:border-[#4b4b46] focus:border-fg-muted',
      mono && 'font-mono',
    ]"
  >
</template>
