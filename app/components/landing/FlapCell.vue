<script setup lang="ts">
import { useReducedMotion } from 'motion-v'

/**
 * One split-flap cell, as on an airport departure board. When `char` changes
 * the cell flips through a few random `glyphs` before landing on it: the old
 * top half folds down while the new bottom half unfolds behind it. With
 * reduced motion it just changes.
 */
const props = withDefaults(defineProps<{ char: string; delay?: number; spins?: number; glyphs?: string }>(), {
  delay: 0,
  spins: 3,
  glyphs: 'abcdefghijklmnopqrstuvwxyz-.',
})

const reduced = useReducedMotion()
/** Duration of one half of a flip; a full flip is twice this. */
const HALF_MS = 65

const current = ref(props.char)
const next = ref(props.char)
/** Bumped on every flip so the animated halves remount and replay their keyframes. */
const flips = ref(0)

let timers: ReturnType<typeof setTimeout>[] = []
const clear = () => timers.splice(0).forEach(clearTimeout)

watch(
  () => props.char,
  (target) => {
    clear()
    if (reduced.value) {
      current.value = next.value = target
      return
    }
    const randoms = Array.from({ length: props.spins }, () => props.glyphs[Math.floor(Math.random() * props.glyphs.length)]!)
    let at = props.delay
    for (const glyph of [...randoms, target]) {
      timers.push(setTimeout(() => {
        next.value = glyph
        flips.value++
      }, at))
      at += HALF_MS * 2
      timers.push(setTimeout(() => (current.value = glyph), at))
    }
  },
)
onBeforeUnmount(clear)
</script>

<template>
  <span class="flap" :style="{ '--half': `${HALF_MS}ms` }">
    <!-- Static halves: the next character's top, the current character's bottom. -->
    <span class="half top">{{ next }}</span>
    <span class="half bottom">{{ current }}</span>
    <!-- Moving halves: the current top folds away, then the next bottom unfolds over the old one. -->
    <span :key="`fold-${flips}`" :class="['half top', flips && 'fold']">{{ current }}</span>
    <span :key="`unfold-${flips}`" :class="['half bottom', flips && 'unfold']">{{ next }}</span>
  </span>
</template>

<style scoped>
.flap {
  position: relative;
  display: inline-block;
  width: 0.74em;
  height: 1.14em;
  perspective: 3em;
  font-family: var(--font-mono);
  font-weight: 600;
  line-height: 1.14em;
  text-align: center;
  white-space: pre;
}

/* The axle: a hairline between the two halves. */
.flap::after {
  content: '';
  position: absolute;
  inset: calc(50% - 0.5px) 0 auto;
  height: 1px;
  background: var(--color-canvas);
  z-index: 5;
}

.half {
  position: absolute;
  inset: 0;
  border-radius: 0.06em;
  background: #1f1f1d;
  transform-origin: 50% 50%;
}
.top {
  clip-path: inset(0 0 50% 0);
}
.bottom {
  clip-path: inset(50% 0 0 0);
  background: #1a1a18;
}

.fold {
  animation: fold var(--half) ease-in forwards;
}
.unfold {
  animation: unfold var(--half) ease-out var(--half) both;
}

@keyframes fold {
  from { transform: rotateX(0deg); filter: brightness(1); }
  to { transform: rotateX(-90deg); filter: brightness(0.55); }
}
@keyframes unfold {
  from { transform: rotateX(90deg); filter: brightness(0.55); }
  to { transform: rotateX(0deg); filter: brightness(1); }
}
</style>
