<script setup lang="ts">
import type { Overview } from '~/types/api'

/** One column per finished run (oldest → newest): pass share in green, failures in red. */
const props = defineProps<{ runs: Overview['health'] }>()

const SLOTS = 24
const columns = computed(() => {
  const padded: (Overview['health'][number] | null)[] = [
    ...Array<null>(Math.max(0, SLOTS - props.runs.length)).fill(null),
    ...props.runs.slice(-SLOTS),
  ]
  return padded.map((run) => {
    if (!run) return null
    const executed = Math.max(run.passedTests + run.failedTests, 1)
    return { run, pass: run.passedTests / executed, fail: run.failedTests / executed }
  })
})
</script>

<template>
  <div class="flex h-24 items-end gap-[3px]" role="img" aria-label="Pass rate of recent runs">
    <template v-for="(column, index) in columns" :key="column?.run.id ?? `empty-${index}`">
      <div v-if="!column" class="h-1 flex-1 rounded-sm bg-overlay" />
      <NuxtLink
        v-else
        :to="`/test-runs/${column.run.id}`"
        class="group flex h-full flex-1 flex-col justify-end gap-px"
        :title="`${column.run.project.name} · Run #${column.run.number}: ${column.run.passedTests} passed, ${column.run.failedTests} failed`"
      >
        <div class="rounded-t-sm bg-fail/80 transition-opacity group-hover:opacity-100" :style="{ height: `${column.fail * 100}%` }" />
        <div
          :class="['bg-pass/75 transition-colors group-hover:bg-pass', column.fail === 0 ? 'rounded-sm' : 'rounded-b-sm']"
          :style="{ height: `${column.pass * 100}%` }"
        />
      </NuxtLink>
    </template>
  </div>
</template>
