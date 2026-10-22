<script setup lang="ts">
import type { Overview } from '~/types/api'

/** One column per finished run (oldest → newest): failures in red on top, passes in green below. */
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

const summary = computed(() => {
  const passed = props.runs.reduce((sum, run) => sum + run.passedTests, 0)
  const failed = props.runs.reduce((sum, run) => sum + run.failedTests, 0)
  return `Last ${props.runs.length} runs: ${passed} tests passed, ${failed} failed`
})
</script>

<template>
  <div>
    <div class="flex h-20 items-end gap-[3px] border-b border-line-strong" role="img" :aria-label="summary">
      <template v-for="(column, index) in columns" :key="column?.run.id ?? `empty-${index}`">
        <div v-if="!column" class="h-px flex-1 bg-line" />
        <NuxtLink
          v-else
          :to="`/test-runs/${column.run.id}`"
          class="group flex h-full flex-1 flex-col justify-end gap-px"
          :title="`${column.run.project.name} · Run #${column.run.number}: ${column.run.passedTests} passed, ${column.run.failedTests} failed`"
        >
          <div class="bg-fail/85 group-hover:bg-fail" :style="{ height: `${column.fail * 100}%` }" />
          <div class="bg-pass/70 group-hover:bg-pass" :style="{ height: `${column.pass * 100}%` }" />
        </NuxtLink>
      </template>
    </div>
    <div class="mt-2 flex items-center gap-3 text-[11px] text-fg-subtle">
      <span class="flex items-center gap-1.5"><span class="size-2 bg-pass/70" /> Passed</span>
      <span class="flex items-center gap-1.5"><span class="size-2 bg-fail/85" /> Failed</span>
      <span class="ml-auto font-mono">oldest → latest</span>
    </div>
  </div>
</template>
