<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'xs' | 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit'
    to?: RouteLocationRaw
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'secondary', size: 'md', type: 'button' },
)

// Primary is paper-white on graphite: the strongest contrast on the screen, no hue.
const VARIANTS = {
  primary: 'bg-fg text-canvas hover:bg-white',
  secondary: 'border border-line-strong text-fg hover:border-[#4b4b46] hover:bg-raised',
  ghost: 'text-fg-muted hover:bg-raised hover:text-fg',
  danger: 'border border-fail/40 text-fail hover:bg-fail/10',
}

const SIZES = {
  xs: 'h-6 px-2 text-xs gap-1',
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-8 px-3 text-[13px] gap-1.5',
  lg: 'h-10 px-4 text-sm gap-2',
}

const classes = computed(() => [
  'inline-flex shrink-0 items-center justify-center rounded-[4px] font-medium whitespace-nowrap transition-colors select-none',
  'disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5 [&_svg]:shrink-0',
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
