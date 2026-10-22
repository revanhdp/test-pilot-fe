<script setup lang="ts">
import { useReducedMotion } from 'motion-v'

/**
 * Text that decodes into place from random glyphs, left to right, once
 * `active` turns true. Space is reserved from the start (no layout shift), and
 * screen readers get the final text only. Meant for monospaced text, so the
 * glyphs wrap exactly like the final string.
 */
const props = withDefaults(defineProps<{ text: string; active?: boolean; duration?: number }>(), {
  active: true,
  duration: 600,
})

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/'
const reduced = useReducedMotion()
const shown = ref(props.active && reduced.value ? props.text : '')
let frame = 0

function decode() {
  cancelAnimationFrame(frame)
  if (reduced.value) {
    shown.value = props.text
    return
  }
  const start = performance.now()
  const tick = (now: number) => {
    const resolved = Math.floor(Math.min((now - start) / props.duration, 1) * props.text.length)
    shown.value = [...props.text]
      .map((char, index) => (index < resolved || char === ' ' ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
      .join('')
    if (resolved < props.text.length) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

watch(
  () => [props.active, props.text] as const,
  ([active]) => {
    if (active) return decode()
    cancelAnimationFrame(frame)
    shown.value = ''
  },
  { immediate: true },
)
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <span class="relative inline-block max-w-full align-top">
    <span class="sr-only">{{ active ? text : '' }}</span>
    <!-- The final text, invisible, holds the line's size while the visible copy decodes over it. -->
    <span class="invisible" aria-hidden="true">{{ text }}</span>
    <span class="absolute inset-0" aria-hidden="true">{{ shown }}</span>
  </span>
</template>
