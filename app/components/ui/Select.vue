<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

defineOptions({ inheritAttrs: false })

const model = defineModel<string | null>()
withDefaults(
  defineProps<{
    options?: SelectOption[]
    groups?: { label: string; options: SelectOption[] }[]
    placeholder?: string
    invalid?: boolean
    mono?: boolean
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)

// Layout attrs (class, style) go on the wrapper; everything else (aria-*, name, id…) on the <select>.
const attrs = useAttrs()
const wrapperAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const selectAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
</script>

<template>
  <div class="relative min-w-0" v-bind="wrapperAttrs">
    <select
      v-bind="selectAttrs"
      v-model="model"
      :aria-invalid="invalid || undefined"
      :class="[
        'w-full min-w-0 appearance-none truncate rounded-md border bg-canvas pr-7 text-fg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:opacity-60',
        size === 'sm' ? 'h-7.5 pl-2 text-xs' : 'h-8.5 pl-2.5 text-[13px]',
        invalid ? 'border-fail/60' : 'border-line-strong hover:border-[#3a3e48] focus:border-accent/60',
        mono && 'font-mono',
        model == null || model === '' ? 'text-fg-subtle' : '',
      ]"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">
        {{ option.label }}
      </option>
      <optgroup v-for="group in groups" :key="group.label" :label="group.label">
        <option v-for="option in group.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </optgroup>
    </select>
    <ChevronDown class="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-fg-subtle" />
  </div>
</template>
