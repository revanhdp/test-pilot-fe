<script setup lang="ts">
import type { TestPriority } from '~/types/api'

/** Priority as a 4-step level meter, so it never competes with outcome colors. */
const props = defineProps<{ priority: TestPriority }>()
const meta = computed(() => PRIORITY_META[props.priority])
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-xs whitespace-nowrap text-fg-muted">
    <span class="flex h-2.5 items-end gap-[2px]" aria-hidden="true">
      <span
        v-for="bar in 4"
        :key="bar"
        :class="['w-[3px]', bar > meta.level ? 'bg-line-strong' : meta.level === 4 ? 'bg-fg' : 'bg-fg-muted']"
        :style="{ height: `${bar * 25}%` }"
      />
    </span>
    {{ meta.label }}
  </span>
</template>
