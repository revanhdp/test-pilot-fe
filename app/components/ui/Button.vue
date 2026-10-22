<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'xs' | 'sm' | 'md'
    type?: 'button' | 'submit'
    to?: RouteLocationRaw
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'secondary', size: 'md', type: 'button' },
)

const VARIANTS = {
  primary:
    'bg-accent-strong text-white hover:bg-[#8b7af7] shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_0_0_1px_rgb(155_138_251/0.35),0_8px_24px_-12px_rgb(127_108_245/0.9)]',
  secondary: 'bg-raised text-fg border border-line-strong hover:bg-overlay hover:border-[#3a3e48]',
  ghost: 'text-fg-muted hover:text-fg hover:bg-overlay',
  danger: 'bg-fail/10 text-fail border border-fail/30 hover:bg-fail/15',
}

const SIZES = {
  xs: 'h-6 px-2 text-xs gap-1 rounded',
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  md: 'h-8.5 px-3 text-[13px] gap-1.5 rounded-md',
}

const classes = computed(() => [
  'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors select-none',
  'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0',
  SIZES[props.size],
  VARIANTS[props.variant],
  props.block && 'w-full',
])
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes"><slot /></NuxtLink>
  <button v-else :type="type" :class="classes" :disabled="disabled || loading">
    <UiSpinner v-if="loading" />
    <slot />
  </button>
</template>
