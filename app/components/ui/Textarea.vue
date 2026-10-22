<script setup lang="ts">
const model = defineModel<string | null>()
defineProps<{ invalid?: boolean }>()
</script>

<template>
  <textarea
    v-model="model"
    :aria-invalid="invalid || undefined"
    :class="[
      'w-full min-w-0 rounded-[4px] border bg-canvas px-2.5 py-2 text-base leading-relaxed text-fg placeholder:text-fg-subtle/80 transition-colors sm:text-[13px]',
      'resize-y focus:outline-none',
      invalid ? 'border-fail/70 focus:border-fail' : 'border-line-strong hover:border-[#4b4b46] focus:border-fg-muted',
    ]"
  />
</template>
