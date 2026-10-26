<script setup lang="ts">
import { Plus } from '@lucide/vue'
import type { StepAction } from '~/types/api'
import type { StepDraft } from '~/utils/steps'

const steps = defineModel<StepDraft[]>({ required: true })
withDefaults(defineProps<{ errors?: Record<number, string>; title?: string; hint?: string }>(), {
  title: 'Steps',
  hint: 'Top to bottom, in a fresh browser context',
})

const QUICK_ADD: StepAction[] = ['navigate', 'click', 'fill', 'assertText', 'assertVisible', 'assertUrl']

function add(action: StepAction) {
  steps.value = [...steps.value, blankStep(action)]
}

function move(index: number, delta: -1 | 1) {
  const next = [...steps.value]
  const [step] = next.splice(index, 1)
  next.splice(index + delta, 0, step!)
  steps.value = next
}

function duplicate(index: number) {
  const source = steps.value[index]!
  const copy = { ...toDraft({ ...source, target: { ...source.target } }) }
  steps.value = [...steps.value.slice(0, index + 1), copy, ...steps.value.slice(index + 1)]
}

function remove(index: number) {
  steps.value = steps.value.filter((_, i) => i !== index)
}
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <h2 class="panel-title">{{ title }}</h2>
      <span class="font-mono text-[11px] text-fg-subtle">{{ steps.length }}</span>
      <p class="ml-auto hidden text-xs text-fg-subtle sm:block">{{ hint }}</p>
    </div>

    <ol v-if="steps.length" class="divide-y divide-line">
      <li v-for="(step, index) in steps" :key="step.key">
        <TestCaseStepRow
          v-model="steps[index]!"
          :index="index"
          :is-first="index === 0"
          :is-last="index === steps.length - 1"
          :error="errors?.[index]"
          @move="move(index, $event)"
          @duplicate="duplicate(index)"
          @remove="remove(index)"
        />
      </li>
    </ol>
    <div v-else class="px-4 py-8 text-center">
      <p class="text-[13px] text-fg-muted">No steps yet.</p>
      <p class="mt-1 text-xs text-fg-subtle">Start with <span class="font-mono">Navigate</span>, interact with the page, then assert what should be true.</p>
    </div>

    <div class="flex flex-wrap items-center gap-1.5 border-t border-line px-3 py-2.5">
      <span class="mr-1 text-xs text-fg-subtle">Add step</span>
      <UiButton v-for="action in QUICK_ADD" :key="action" size="xs" @click="add(action)">
        <Plus /> {{ ACTIONS[action].label }}
      </UiButton>
    </div>
  </section>
</template>
