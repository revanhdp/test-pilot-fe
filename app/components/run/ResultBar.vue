<script setup lang="ts">
/** Segmented bar: passed / failed / skipped, with the remainder shown as pending. */
const props = withDefaults(
  defineProps<{ passed: number; failed: number; skipped: number; total: number; height?: 'sm' | 'md' }>(),
  { height: 'sm' },
)

const segments = computed(() => {
  const total = Math.max(props.total, 1)
  return [
    { key: 'passed', share: props.passed / total, class: 'bg-pass' },
    { key: 'failed', share: props.failed / total, class: 'bg-fail' },
    { key: 'skipped', share: props.skipped / total, class: 'bg-skip/70' },
  ].filter((segment) => segment.share > 0)
})
</script>

<template>
  <div
    :class="['flex w-full gap-px overflow-hidden rounded-full bg-overlay', height === 'sm' ? 'h-1.5' : 'h-2']"
    role="img"
    :aria-label="`${passed} passed, ${failed} failed, ${skipped} skipped of ${total}`"
  >
    <div
      v-for="segment in segments"
      :key="segment.key"
      :class="['h-full transition-[width] duration-500', segment.class]"
      :style="{ width: `${segment.share * 100}%` }"
    />
  </div>
</template>
