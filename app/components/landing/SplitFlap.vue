<script setup lang="ts">
import { useInView, useReducedMotion } from 'motion-v'

/**
 * A row of split-flap cells that cycles through `words`, padded to `length`
 * cells like a departure board. Holds still with reduced motion, off screen
 * and in background tabs.
 */
const props = withDefaults(defineProps<{ words: string[]; length: number; interval?: number }>(), {
  interval: 3200,
})

const root = ref<HTMLElement | null>(null)
const inView = useInView(root)
const reduced = useReducedMotion()

const index = ref(0)
const cells = computed(() => props.words[index.value]!.padEnd(props.length).slice(0, props.length).split(''))

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    if (!inView.value || reduced.value || document.visibilityState !== 'visible') return
    index.value = (index.value + 1) % props.words.length
  }, props.interval)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <span ref="root" class="inline-flex gap-[0.06em]" aria-hidden="true">
    <LandingFlapCell v-for="(char, position) in cells" :key="position" :char="char" :delay="position * 45" />
  </span>
</template>
