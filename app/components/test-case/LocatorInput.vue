<script setup lang="ts">
import type { Locator, LocatorType } from '~/types/api'

const locator = defineModel<Locator>({ required: true })
defineProps<{ optional?: boolean; invalid?: boolean }>()

const typeOptions = (Object.keys(LOCATOR_TYPES) as LocatorType[]).map((value) => ({
  value,
  label: LOCATOR_TYPES[value].label,
}))

const ROLES = [
  'button', 'link', 'textbox', 'checkbox', 'radio', 'combobox', 'option', 'heading',
  'alert', 'dialog', 'tab', 'menuitem', 'listitem', 'img', 'navigation', 'switch',
]
const datalistId = useId()
</script>

<template>
  <div class="flex min-w-0 flex-wrap gap-1.5">
    <UiSelect v-model="locator.type" :options="typeOptions" size="sm" class="w-[104px] shrink-0" aria-label="Locator type" />
    <UiInput
      v-model="locator.value"
      size="sm"
      :mono="locator.type === 'css' || locator.type === 'testId' || locator.type === 'role'"
      :invalid="invalid"
      :placeholder="optional ? `${LOCATOR_TYPES[locator.type].placeholder} (optional)` : LOCATOR_TYPES[locator.type].placeholder"
      :list="locator.type === 'role' ? datalistId : undefined"
      :aria-label="`${LOCATOR_TYPES[locator.type].label} locator`"
      class="min-w-[8rem] flex-1"
    />
    <UiInput
      v-if="locator.type === 'role'"
      v-model="locator.name"
      size="sm"
      placeholder="name"
      aria-label="Accessible name"
      class="min-w-[8rem] flex-1"
    />
    <datalist :id="datalistId">
      <option v-for="role in ROLES" :key="role" :value="role" />
    </datalist>
  </div>
</template>
