<script setup lang="ts">
import { ArrowDown, ArrowUp, Copy, Trash } from '@lucide/vue'
import type { StepDraft } from '~/utils/steps'

const step = defineModel<StepDraft>({ required: true })
defineProps<{ index: number; isFirst: boolean; isLast: boolean; error?: string }>()
defineEmits<{ move: [delta: -1 | 1]; duplicate: []; remove: [] }>()

const meta = computed(() => ACTIONS[step.value.action])
const actionGroups = ACTION_GROUPS.map(({ group, actions }) => ({
  label: group,
  options: actions.map((action) => ({ value: action, label: ACTIONS[action].label })),
}))

const TOOL =
  'rounded-[4px] p-1.5 text-fg-subtle transition-colors hover:bg-overlay hover:text-fg disabled:pointer-events-none disabled:opacity-30 [&_svg]:size-3.5'
</script>

<template>
  <div :class="['group relative flex gap-3 py-2.5 pr-2 pl-4 transition-colors hover:bg-raised/50', error && 'bg-fail/5']">
    <span v-if="error" class="absolute inset-y-0 left-0 w-[2px] bg-fail" aria-hidden="true" />
    <span class="mt-[7px] w-5 shrink-0 font-mono text-[11px] text-fg-subtle tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>

    <div class="grid min-w-0 flex-1 gap-x-2 gap-y-1.5 md:grid-cols-[148px_minmax(0,1fr)]">
      <UiSelect v-model="step.action" :groups="actionGroups" size="sm" aria-label="Action" />
      <div class="flex min-w-0 flex-wrap gap-1.5">
        <TestCaseLocatorInput
          v-if="meta.target !== 'none'"
          v-model="step.target"
          :optional="meta.target === 'optional'"
          :invalid="!!error"
          :class="['min-w-0 flex-[3_1_260px]', step.target.type === 'role' ? 'sm:min-w-[320px]' : 'sm:min-w-[240px]']"
        />
        <UiInput
          v-if="meta.value"
          v-model="step.value"
          size="sm"
          :type="meta.value.type ?? 'text'"
          :mono="meta.value.mono"
          :placeholder="meta.value.placeholder"
          :aria-label="meta.value.label"
          :invalid="!!error"
          class="min-w-[8rem] flex-[2_1_160px]"
        />
      </div>
      <label
        v-if="step.action === 'navigate'"
        class="flex w-fit cursor-pointer items-start gap-2 text-xs leading-snug text-fg-muted md:col-start-2"
      >
        <input v-model="step.allowErrorStatus" type="checkbox" class="mt-px size-3.5 shrink-0">
        <span>Allow error status <span class="text-fg-subtle">(don't fail on HTTP 4xx/5xx, e.g. to test a custom 404 page)</span></span>
      </label>
      <p v-if="error" class="text-xs text-fail md:col-start-2">{{ error }}</p>
      <p v-else-if="meta.hint" class="text-[11px] text-fg-subtle md:col-start-2">{{ meta.hint }}</p>
    </div>

    <div class="flex shrink-0 items-start gap-0.5 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
      <button type="button" :class="TOOL" :disabled="isFirst" aria-label="Move up" @click="$emit('move', -1)"><ArrowUp /></button>
      <button type="button" :class="TOOL" :disabled="isLast" aria-label="Move down" @click="$emit('move', 1)"><ArrowDown /></button>
      <button type="button" :class="TOOL" aria-label="Duplicate step" @click="$emit('duplicate')"><Copy /></button>
      <button type="button" :class="[TOOL, 'hover:!text-fail']" aria-label="Delete step" @click="$emit('remove')"><Trash /></button>
    </div>
  </div>
</template>
